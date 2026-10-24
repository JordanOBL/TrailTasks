export async function up({ context }) {
	const { sequelize } = context;

	await sequelize.query(`
		CREATE TABLE IF NOT EXISTS token_transactions (
			id VARCHAR(255) PRIMARY KEY,
			user_id VARCHAR(255) NOT NULL,
			amount INTEGER NOT NULL,
			type VARCHAR(255) NOT NULL,
			source_type VARCHAR(255),
			source_id VARCHAR(255),
			idempotency_key VARCHAR(255) NOT NULL,
			balance_after INTEGER,
			rule_version VARCHAR(255),
			metadata JSONB,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
		);
	`);

	await sequelize.query('CREATE INDEX IF NOT EXISTS token_transactions_user_id_idx ON token_transactions (user_id);');
	await sequelize.query('CREATE INDEX IF NOT EXISTS token_transactions_type_idx ON token_transactions (type);');
	await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS token_transactions_user_id_idempotency_key_idx ON token_transactions (user_id, idempotency_key);');
	await sequelize.query('ALTER TABLE users DROP COLUMN IF EXISTS trail_tokens;');
}

export async function down({ context }) {
	const { sequelize } = context;

	await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trail_tokens INTEGER NOT NULL DEFAULT 0;');
	await sequelize.query('DROP TABLE IF EXISTS token_transactions;');
}
