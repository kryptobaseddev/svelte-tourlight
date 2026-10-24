<script lang="ts">
	let email = $state(true);
	let sms = $state(false);
</script>

<svelte:head><title>Settings · svelte-tourlight demo</title></svelte:head>

<main class="page">
	<h1>Settings</h1>
	<p class="lede">A second page, so the tour can show it follows you across routes.</p>
	<section class="card" data-tour="notifications" aria-labelledby="notif-title">
		<h2 id="notif-title">Notifications</h2>
		<label class="check"
			><input type="checkbox" bind:checked={email} /> Email me about new features</label
		>
		<label class="check"><input type="checkbox" bind:checked={sms} /> Text me reminders</label>
	</section>
</main>
