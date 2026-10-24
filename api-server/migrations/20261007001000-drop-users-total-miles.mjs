export async function up({ context }) {
	const { sequelize } = context;

	await sequelize.query('ALTER TABLE users DROP COLUMN IF EXISTS total_miles;');
}

export async function down({ context }) {
	const { sequelize } = context;

	await sequelize.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS total_miles VARCHAR(255) DEFAULT '0.00';");
}
