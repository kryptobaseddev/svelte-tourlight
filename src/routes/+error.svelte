<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>{page.status} · svelte-tourlight</title></svelte:head>

<main class="error">
	<h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
	<p>{page.error?.message ?? 'An unexpected error occurred.'}</p>
	<p><a href="/">Back to the svelte-tourlight home page</a></p>
</main>

<style>
	.error {
		max-width: 40rem;
		margin: 4rem auto;
		padding: 0 1rem;
		font-family: system-ui, sans-serif;
	}
</style>
