export const ONETABLE_SCHEMA = {
	format: 'onetable:1.1.0',
	version: '0.0.1',
	indexes: {
		primary: { hash: 'PK', sort: 'SK' }
	},
	models: {
		SearchHistory: {
			PK: { type: String, value: 'u#${userId}' },
			SK: { type: Date, value: '${created}' },
			userId: { type: String, required: true },
			term: { type: String, required: true },
			expireAt: { type: Date, required: true, ttl: true },
			created: { type: Date, required: true }
		},
		Image: {
			PK: { type: String, value: 't#${term}' },
			SK: { type: String, value: '${size}#${start}#${limit}' },
			term: { type: String, required: true },
			size: { type: String, required: true },
			start: { type: Number, required: true },
			limit: { type: Number, required: true },
			images: { type: Array, required: true },
			expireAt: { type: Date, required: true, ttl: true }
		}
	} as const,
	params: {
		isoDates: true
	}
};
