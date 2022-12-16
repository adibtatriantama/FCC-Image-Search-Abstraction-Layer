import { Query, formatImageSize } from '$lib/server/model/query';
import { searchForImage } from '$lib/server/simpleDi';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const search = url.searchParams.get('term');
	const size = url.searchParams.get('size');
	const start = url.searchParams.get('start') ?? 1;
	const limit = url.searchParams.get('limit') ?? 10;
	let images: { src: string; width: number; height: number }[] = [];

	const query = Query.create({
		size: formatImageSize(size),
		search,
		limit,
		start
	});

	const useCaseResponse = await searchForImage.execute(query);

	if (useCaseResponse.isRight()) {
		images = useCaseResponse.value.items.map((item) => {
			return {
				src: item.url,
				width: item.image.width,
				height: item.image.height
			};
		});

		return json(images);
	}
}
