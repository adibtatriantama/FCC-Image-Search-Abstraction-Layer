<script context="module">
	export function load({ url }) {
		const term = url.searchParams.get('term');
		const size = url.searchParams.get('size');
		return {
			props: {
				term,
				size
			}
		};
	}
</script>

<script lang="ts">
	import { openModal } from 'svelte-modals';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Gallery from 'svelte-gallery';
	import Modal from '$lib/Modal.svelte';

	export let size: string;
	export let term: string;

	let sizeNewInput: string = 'medium';
	let termNewInput: string = '';

	const update = async () => {
		if (termNewInput.trim().length > 0) {
			const query = new URLSearchParams();
			query.set('term', termNewInput);
			query.set('size', sizeNewInput);
			await goto(`?${query.toString()}`, { replaceState: true });
			reset();
		}
	};

	let images = [];

	const maxFetch = 5;
	let isFetching = false;
	let fetchCount = 0;
	let nextPageUrl = '';

	const scrollHandler = () => {
		if (isBottomPageReached() && isAbleToFetch()) {
			fetchImages();
		}
	};

	const isBottomPageReached = () => {
		return window.innerHeight + window.scrollY >= document.body.offsetHeight;
	};

	const isAbleToFetch = () => {
		return fetchCount < maxFetch && !isFetching;
	};

	const fetchImages = async () => {
		isFetching = true;

		let response;
		if (fetchCount === 0) {
			try {
				response = await fetch(
					`${import.meta.env.VITE_API_URL}/search-image?search=${term}&size=${size}`
				);
				handleResponse(await response.json());

				if (isBottomPageReached()) {
					await fetchImages();
				} else {
					isFetching = false;
				}
			} catch (error) {}
		} else if (nextPageUrl && fetchCount < maxFetch) {
			try {
				response = await fetch(nextPageUrl);
				handleResponse(await response.json());

				if (isBottomPageReached()) {
					await fetchImages();
				} else {
					isFetching = false;
				}
			} catch (error) {}
		} else if (!!nextPageUrl && fetchCount < maxFetch) {
			console.error('No next page url');
			isFetching = false;
		} else {
			isFetching = false;
		}
	};

	const handleResponse = (data) => {
		fetchCount++;
		images = [
			...images,
			...data.items.map((item) => ({
				src: item.url,
				width: item.image.width,
				height: item.image.height
			}))
		];
		nextPageUrl = data.navigations.next;
	};

	let historyText = 'loading';

	onMount(() => {
		reset();
		loadHistory();
	});

	const reset = () => {
		sizeNewInput = size;
		termNewInput = term;
		images = [];
		fetchCount = 0;
		nextPageUrl = '';
		fetchImages();
	};

	const loadHistory = async () => {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/history`);

		const data = await response.json();
		console.dir(data);

		historyText = data
			.map((item) => `${new Date(item.date).toLocaleDateString('en-US')} - ${item.title}`)
			.join('\n');

		console.log(historyText);
	};

	const showHistory = () => {
		openModal(Modal, { title: 'History', message: historyText });
	};
</script>

<svelte:window on:scroll={scrollHandler} />

<div class="flex flex-col min-w-full p-6 gap-8 sm:gap-10">
	<div class="flex flex-col sm:flex-row items-center gap-8">
		<div>
			<img alt="Logo" class="w-44" src="logo-2.png" />
		</div>
		<div class="w-full  flex flex-row justify-between item-center">
			<form on:submit|preventDefault={update} class="sm:w-3/5 w-4/5">
				<div class="relative rounded-md shadow-sm">
					<input
						bind:value={termNewInput}
						type="text"
						name="searchTerm"
						id="searchTerm"
						class="focus:ring-green-500 focus:border-green-500 block w-full pl-5 pr-24 sm:text-md border-gray-300 rounded-md"
					/>
					<div class="absolute inset-y-0 right-0 flex items-center">
						<label for="size" class="sr-only">Size</label>
						<select
							bind:value={sizeNewInput}
							on:change={update}
							id="size"
							name="size"
							class="focus:ring-green-500 focus:border-green-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-md rounded-md"
						>
							<option>icon</option>
							<option>small</option>
							<option>medium</option>
							<option>large</option>
							<option>xlarge</option>
							<option>xxlarge</option>
							<option>huge</option>
						</select>
					</div>
				</div>
			</form>
			<div class="flex items-center">
				<p class="underline" on:click={showHistory}>history</p>
			</div>
		</div>
	</div>

	<Gallery {images} />
</div>
