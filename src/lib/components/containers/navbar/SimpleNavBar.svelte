<script>
	import { Button } from '$lib/index.js'

	export let links = []
</script>

<div class="simple-navbar">
	{#each links as link}
		<Button
			text={link.text}
			url={link.url}
			classes={['btn-link']}
		/>
	{/each}
</div>

<style>
	.simple-navbar {
		padding: var(--spacing09) 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing09);
		align-items: center;
	}

	@media screen and (min-width: 768px) {
		.simple-navbar {
			flex-direction: row;
			align-items: unset;
		}
	}
</style>
