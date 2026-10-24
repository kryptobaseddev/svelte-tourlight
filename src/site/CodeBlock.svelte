<script lang="ts">
	interface Props {
		code: string;
		/** Shown above the code, e.g. a file name. */
		label?: string;
	}

	let { code, label }: Props = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code.trim());
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 1800);
		} catch {
			copied = false;
		}
	}
</script>

<figure class="code">
	<figcaption>
		<span>{label ?? 'Code'}</span>
		<button
			type="button"
			class="copy"
			onclick={copy}
			aria-label={copied ? 'Copied' : `Copy ${label ?? 'code'}`}
		>
			{copied ? 'Copied' : 'Copy'}
		</button>
	</figcaption>
	<pre><code>{code.trim()}</code></pre>
	<span class="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>
</figure>
