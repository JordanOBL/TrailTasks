export async function verifyDatabaseConnection(client) {
	await client.authenticate();
}

export function failStartup() {
	console.error('API startup failed.');
	process.exit(1);
}
