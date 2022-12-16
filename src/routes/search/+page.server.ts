import { Query, formatImageSize } from '$lib/server/model/query';
import { findRecentHistory, searchForImage } from '$lib/server/simpleDi';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	const term = url.searchParams.get('term');
	const size = url.searchParams.get('size');
	let images: { src: string; width: number; height: number }[] = [];
	let historyText = 'nothing';

	if (!term) {
		throw redirect(307, '/');
	}

	const query = Query.create({
		search: term,
		size: formatImageSize(size),
		limit: 10,
		start: 1
	});

	const searchImagePromise = searchForImage.execute(query);
	const loadHistoryPromise = findRecentHistory.execute();

	const [searchImageResult, loadHistoryResult] = await Promise.all([
		searchImagePromise,
		loadHistoryPromise
	]);

	if (searchImageResult.isRight()) {
		images = searchImageResult.value.items.map((item) => {
			return {
				src: item.url,
				width: item.image.width,
				height: item.image.height
			};
		});
	}

	if (loadHistoryResult.isRight()) {
		historyText = loadHistoryResult.value
			.map((item) => `${new Date(item.date).toLocaleDateString('en-US')} - ${item.title}`)
			.join('\n');

		console.log(loadHistoryResult.value);
	}
	return {
		term,
		size,
		images,
		historyText
	};
}
