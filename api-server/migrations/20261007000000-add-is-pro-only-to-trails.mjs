export async function up({ context }) {
	const { queryInterface, Sequelize } = context;

	await queryInterface.addColumn('trails', 'is_pro_only', {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	});

	await queryInterface.sequelize.query(`
    UPDATE trails
    SET is_pro_only = COALESCE(is_subscribers_only, false);
  `);

	await queryInterface.removeColumn('trails', 'is_subscribers_only');
}

export async function down({ context }) {
	const { queryInterface, Sequelize } = context;

	await queryInterface.addColumn('trails', 'is_subscribers_only', {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	});

	await queryInterface.sequelize.query(`
    UPDATE trails
    SET is_subscribers_only = COALESCE(is_pro_only, false);
  `);

	await queryInterface.removeColumn('trails', 'is_pro_only');
}
