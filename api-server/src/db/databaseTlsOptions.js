export function databaseTlsOptions(sslMode) {
	if (sslMode === 'require') {
		return {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		};
	}

	return {};
}
