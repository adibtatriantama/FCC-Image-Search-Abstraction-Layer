import type { QueryDto } from '$lib/dto/query.dto';
import { searchForImage } from '$lib/server/simpleDi';
import { error, json } from '@sveltejs/kit';

export async function GET({ url }) {
	const term = url.searchParams.get('term');
	const size = url.searchParams.get('size');
	const start = url.searchParams.get('start') ?? 1;

	const query: QueryDto = {
		limit: 10,
		size,
		term,
		start
	};

	const response = await searchForImage.execute(query);
	if (response.isRight()) {
		return json(
			response.value.map((item) => {
				return {
					src: item.url,
					width: item.image.width,
					height: item.image.height
				};
			})
		);
	} else {
		throw error(500, response.value.message);
	}
}
