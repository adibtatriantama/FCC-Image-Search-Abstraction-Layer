<script>
	import '../app.css';
    import { Modals, closeModal } from 'svelte-modals'
</script>

<Modals>
    <div
      slot="backdrop"
      class="backdrop"
      on:click={closeModal}
    />
  </Modals>

<svelte:head>
	<title>Search Image</title>
</svelte:head>

<slot />
  
