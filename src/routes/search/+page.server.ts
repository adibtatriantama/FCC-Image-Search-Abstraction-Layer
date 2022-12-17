import type { QueryDto } from '$lib/dto/query.dto';
import type { SearchHistoryDto } from '$lib/dto/searchHistory.dto';
import { findRecentHistory, searchForImage } from '$lib/server/simpleDi';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	const term = url.searchParams.get('term');
	const size = url.searchParams.get('size');

	if (!term) {
		throw redirect(307, '/');
	}

	const query: QueryDto = {
		limit: 10,
		start: 1,
		size,
		term
	};

	const searchImagePromise = searchForImage.execute(query);
	const findRecentHistoryPromise = findRecentHistory.execute();

	const [imagesResult, historiesResult] = await Promise.all([
		searchImagePromise,
		findRecentHistoryPromise
	]);

	const images = imagesResult.isRight()
		? imagesResult.value.map((item) => {
				return {
					src: item.url,
					width: item.image.width,
					height: item.image.height
				};
		  })
		: [];

	const historyText = historiesResult.isRight() ? formatHistory(historiesResult.value) : 'Nothing';

	return {
		historyText,
		images,
		term,
		size
	};
}

function formatHistory(dtos: SearchHistoryDto[]): string {
	if (dtos.length > 0) {
		return dtos
			.map((item) => `${new Date(item.created).toLocaleDateString('en-US')} - ${item.term}`)
			.join('\n');
	} else {
		return 'nothing';
	}
}
