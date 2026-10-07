export async function up({ context }) {
	const { queryInterface, Sequelize } = context;

	await queryInterface.addColumn('trails', 'is_pro_only', {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	});

	await queryInterface.sequelize.query(`
    UPDATE trails
    SET is_pro_only = is_subscribers_only
    WHERE is_subscribers_only IS NOT NULL;
  `);
}

export async function down({ context }) {
	const { queryInterface } = context;

	await queryInterface.removeColumn('trails', 'is_pro_only');
}
