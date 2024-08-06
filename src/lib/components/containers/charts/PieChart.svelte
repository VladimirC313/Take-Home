<script>
	import * as d3 from 'd3'
	import { ChartTooltip } from '$lib/index.js'
	import { browser } from '$app/environment'

	/**
	 *  @param {array} data
	 *      data - an array of objects containing the pie chart data.
	 *      Each object must have a minimum of two properties – one for the domain and
	 *      one for the range value => { x: <domain-value>, y: <range-value>, ... }.
	 *      Note that there can be more properties within this object, but they are not accessed
	 *      by the chart component.
	 *
	 *  @param {string} domain
	 *      domain - string property that declares the name of the object key used to define the arc groupings.
	 *
	 *  @param {string} range
	 *      range - string property that declares the name of the object key used to define
	 *      the measured arc value.
	 */

	export let data,
		arcColors = [],
		domain,
		range,
		valueOneLabel,
		valueTwoLabel,
		sort = null,
		ring = false,
		tooltipId,
		chartHeight

	let width = 306
	let height = chartHeight || 306
	let pie, arcPath, arcs

	$: {
		if (sort === 'ascending') {
			pie = d3
				.pie()
				.sort((a, b) => d3.ascending(a[range], b[range]))
				.value((d) => d[range])
		} else if (sort === 'descending') {
			pie = d3
				.pie()
				.sort((a, b) => d3.descending(a[range], b[range]))
				.value((d) => d[range])
		} else {
			pie = d3
				.pie()
				.sort(null)
				.value((d) => d[range])
		}

		arcPath = d3
			.arc()
			.innerRadius(ring ? width / 3.8 : 0)
			.outerRadius(Math.min(width, height) / 2)

		arcs = pie(data)
	}

	let tooltip,
		tooltipData = { y: 0, x: 0, title: '', tooltipId, valueOneLabel, valueOne: 0 }
	if (valueTwoLabel) {
		tooltipData.valueTwoLabel = valueTwoLabel
		tooltipData.valueTwo = 0
	}

	if (browser) {
		tooltip = d3.select(`#${tooltipId}`).style('opacity', 0)
	}

	function enterTooltip(e) {
		tooltip.style('opacity', 1)
	}

	function movingTooltip(e, d) {
		const [x, y] = d3.pointer(e)
		tooltipData.y = e.offsetY - 85
		tooltipData.x = e.offsetX - 10
		tooltipData.title = d.data[domain]
		tooltipData.valueOne = d.data[valueOneLabel]
		if (valueTwoLabel) tooltipData.valueTwo = d.data[tooltipData.valueTwoLabel]
	}

	function leaveTooltip(e) {
		tooltip.style('opacity', 0)
	}
</script>

<div class="svg-container">
	<svg
		class="pie-chart-svg"
		viewBox="{-width / 2} {-height / 2} {width} {height}"
	>
		<g>
			{#each arcs as slice, i}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<path
					on:mouseenter={enterTooltip}
					on:mousemove={(e) => movingTooltip(e, slice)}
					on:mouseleave={leaveTooltip}
					fill={arcColors[i]}
					d={arcPath(slice)}
				/>
			{/each}
		</g>
	</svg>
	<ChartTooltip tooltipInfo={tooltipData} />
</div>

<style>
	.svg-container {
		width: 100%;
	}

	.pie-chart-svg {
		width: 100%;
	}
</style>
