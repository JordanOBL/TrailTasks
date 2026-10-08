import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '../..');

const env = process.env.NODE_ENV || 'development';
const envFile =
  env === 'production'
    ? '.env.production'
    : env === 'development'
      ? '.env.development'
      : '.env.test';

dotenv.config({ path: path.join(apiRoot, envFile) });

const requiredEnv = ['PGDBNAME', 'PGUSER', 'PGPASSWORD', 'PGHOST'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required database environment variables for ${env}: ${missingEnv.join(', ')}`,
  );
}

const sequelize = new Sequelize(
  process.env.PGDBNAME,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    dialect: 'postgres',
    logging: process.env.DB_MIGRATION_LOGGING === 'true' ? console.log : false,
  },
);

const umzug = new Umzug({
  migrations: {
    glob: path.join(apiRoot, 'migrations', '*.js'),
  },
  context: {
    queryInterface: sequelize.getQueryInterface(),
    Sequelize,
    sequelize,
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const command = process.argv[2] || 'pending';

const printMigrationNames = migrations => {
  if (migrations.length === 0) {
    console.log('No migrations found.');
    return;
  }

  for (const migration of migrations) {
    console.log(migration.name);
  }
};

try {
  switch (command) {
    case 'up': {
      const migrations = await umzug.up();
      console.log(`Applied ${migrations.length} migration(s).`);
      printMigrationNames(migrations);
      break;
    }
    case 'down': {
      const migrations = await umzug.down();
      console.log(`Reverted ${migrations.length} migration(s).`);
      printMigrationNames(migrations);
      break;
    }
    case 'pending': {
      const migrations = await umzug.pending();
      console.log(`Pending migrations (${migrations.length}):`);
      printMigrationNames(migrations);
      break;
    }
    case 'executed': {
      const migrations = await umzug.executed();
      console.log(`Executed migrations (${migrations.length}):`);
      printMigrationNames(migrations);
      break;
    }
    default:
      console.error(`Unknown migration command: ${command}`);
      console.error('Use one of: up, down, pending, executed');
      process.exitCode = 1;
  }
} finally {
  await sequelize.close();
}
