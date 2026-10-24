<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>Page two · Multi-page tour · svelte-tourlight</title></svelte:head>

<article class="example">
	<h1>Multi-page tour: page two</h1>
	<p class="lede">The tour brought you here. Reload now to see it resume.</p>
	<div class="mock-app" data-tour="mp-second">
		<h2 class="h3">Notifications</h2>
		<label class="check"><input type="checkbox" checked /> Email me about new features</label>
		<label class="check"><input type="checkbox" /> Text me reminders</label>
	</div>
	<p><a href={resolve('/examples/multi-page')}>Back to page one</a></p>
</article>
