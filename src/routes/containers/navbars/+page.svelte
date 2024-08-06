<script>
	import { Page, SimpleNavBar } from '$lib/index.js'

	const links = [
		{ text: 'Link One', url: '/containers/navbars' },
		{ text: 'Link Two', url: '/containers/navbars' },
		{ text: 'Link Three', url: '/containers/navbars' },
	]
</script>

<Page>
	<h1>NavBars</h1>

	<SimpleNavBar {links} />
</Page>
