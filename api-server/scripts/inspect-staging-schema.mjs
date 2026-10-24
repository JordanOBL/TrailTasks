import { QueryTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize(
	process.env.PGDBNAME,
	process.env.PGUSER,
	process.env.PGPASSWORD,
	{
		host: process.env.PGHOST,
		port: Number(process.env.PGPORT || 5432),
		dialect: 'postgres',
		logging: false,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	},
);

try {
	await sequelize.transaction(async (transaction) => {
		await sequelize.query('SET TRANSACTION READ ONLY', { transaction });

		const columns = await sequelize.query(
			`
                SELECT table_name, column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name IN (
                      'trails',
                      'users',
                      'users_sessions',
                      'token_transactions',
                      'SequelizeMeta'
                  )
                ORDER BY table_name, ordinal_position
            `,
			{ transaction, type: QueryTypes.SELECT },
		);

		const [history] = await sequelize.query(
			`SELECT to_regclass('public."SequelizeMeta"') IS NOT NULL AS present`,
			{ transaction, type: QueryTypes.SELECT },
		);

		let migrations = [];
		if (history.present) {
			migrations = await sequelize.query(
				'SELECT name FROM public."SequelizeMeta" ORDER BY name',
				{ transaction, type: QueryTypes.SELECT },
			);
		}

		console.log(
			JSON.stringify(
				{
					columns,
					migrationHistoryTableExists: history.present,
					executedMigrations: migrations.map((row) => row.name),
				},
				null,
				2,
			),
		);
	});
} catch {
	console.error('Read-only staging schema inspection failed.');
	process.exitCode = 1;
} finally {
	await sequelize.close();
}
