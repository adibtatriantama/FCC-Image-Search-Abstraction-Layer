export function load({ url }) {
	const term = url.searchParams.get('term');
	const size = url.searchParams.get('size');
	return {
		term,
		size
	};
}
