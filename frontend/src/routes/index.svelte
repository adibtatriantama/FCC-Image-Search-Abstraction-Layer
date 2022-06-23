<script lang="ts">
	import { goto } from '$app/navigation';

	let size: string = 'medium';
	let term: string = '';

	const handleSubmit = () => {
		if (term.trim().length > 0) {
			goto(`/search?term=${term}&size=${size}`);
		}
	};
</script>

<div class="flex flex-col min-h-screen justify-center w-2/3 md:w-1/3 mx-auto items-center gap-4">
	<div>
		<img alt="Logo" class="w-100 mb-6" src="logo-1.png" />
	</div>
	<div class="min-w-full px-3">
		<form on:submit|preventDefault={handleSubmit}>
			<div class="relative rounded-md shadow-sm">
				<input
					bind:value={term}
					type="text"
					name="searchTerm"
					id="searchTerm"
					class="focus:ring-green-500 focus:border-green-500 block w-full pl-5 pr-24 sm:text-md border-gray-300 rounded-md"
					placeholder="Sleeping Cat"
				/>
				<div class="absolute inset-y-0 right-0 flex items-center">
					<label for="size" class="sr-only">Size</label>
					<select
						bind:value={size}
						id="size"
						name="size"
						class="focus:ring-green-500 focus:border-green-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-md rounded-md"
					>
						<option>icon</option>
						<option>small</option>
						<option selected>medium</option>
						<option>large</option>
						<option>xlarge</option>
						<option>xxlarge</option>
						<option>huge</option>
					</select>
				</div>
			</div>
		</form>
	</div>

	<div>
		<button class="rounded-md shadow" on:click={handleSubmit}>
			<span
				class="w-full flex items-center justify-center px-8 py-1 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-700 md:py-4 md:text-lg md:px-5"
			>
				Search
			</span>
		</button>
	</div>
</div>
