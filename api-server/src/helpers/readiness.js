export function createReadinessHandler(client) {
	if (!client) throw new Error('Readiness Handler needs a client');
	return async (req, res) => {
		try {
			await client.query('SELECT 1');
			return res.status(200).json({ status: 'ok' });
		} catch {
			return res.status(503).json({ status: 'unavailable' });
		}
	};
}
