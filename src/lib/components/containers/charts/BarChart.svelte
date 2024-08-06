<script>
	import * as d3 from 'd3'
	import { ChartTooltip } from '$lib/index.js'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'

	/**
	 *  @param {array} data
	 *      data - an array of objects containing the bar chart data.
	 *      For all bar charts each object must have a minimum of three properties –
	 *      one for the domain, one for the range, and one for the series differentiator =>
	 *      { x: <domain-value>, y: <range-value>, series: <series-name>, ... }.
	 *      Note that there can be more properties within this object, but they are not accessed
	 *      by the chart component.
	 *
	 *  @param {string} domain
	 *      domain - string property that declares the name of the object key used to define the x-axis.
	 *
	 *  @param {string} range
	 *      range - string property that declares the name of the object key used to define the y-axis.
	 *
	 *  @param {string} seriesKey
	 *      seriesKey - string property that declares the object key to differentiating each series
	 */

	export let data,
		barColors = [],
		vertical = false,
		horizontal = false,
		stacked = false,
		sort = null,
		domain,
		range,
		valueOneLabel,
		valueTwoLabel,
		seriesKey = null,
		tooltipId,
		chartWidth = null,
		chartHeight = null

	let innerWidth
	$: width = innerWidth < 768 ? 294 : chartWidth
	$: height = innerWidth < 768 ? 400 : chartHeight || 400
	let marginLeft = vertical ? 0 : 125
	let marginRight = vertical ? 0 : 50
	let marginTop = vertical ? 24 : 20
	let marginBottom = vertical ? 24 : 20
	let xScale, yScale, stack

	$: {
		if (vertical) {
			if (stacked) {
				stack = d3
					.stack()
					.keys(d3.union(data.map((d) => d[seriesKey])))
					.value(([, D], key) => D.get(key)[range])(
					d3.index(
						data,
						(d) => d[domain],
						(d) => d[seriesKey],
					),
				)

				xScale = d3
					.scaleBand()
					.domain(data.map((d) => d[domain]))
					.range([marginLeft, width - marginRight])
					.padding(0.3)

				yScale = d3
					.scaleLinear()
					.domain([0, d3.max(stack, (d) => d3.max(d, (d) => d[1]))])
					.range([height - marginBottom, marginTop])
			} else {
				if (sort === 'ascending') {
					xScale = d3
						.scaleBand()
						.domain(
							d3.groupSort(
								data,
								([d]) => d[range],
								(d) => d[domain],
							),
						)
						.range([marginLeft, width - marginRight])
						.padding(0.3)
				} else if (sort === 'descending') {
					xScale = d3
						.scaleBand()
						.domain(
							d3.groupSort(
								data,
								([d]) => -d[range],
								(d) => d[domain],
							),
						)
						.range([marginLeft, width - marginRight])
						.padding(0.3)
				} else {
					xScale = d3
						.scaleBand()
						.domain(data.map((d) => d[domain]))
						.range([marginLeft, width - marginRight])
						.padding(0.3)
				}

				yScale = d3
					.scaleLinear()
					.domain([0, d3.max(data, (d) => d[range])])
					.range([height - marginBottom, marginTop])
			}
		}

		if (horizontal) {
			if (stacked) {
				stack = d3
					.stack()
					.keys(d3.union(data.map((d) => d[seriesKey])))
					.value(([, D], key) => D.get(key)[domain])(
					d3.index(
						data,
						(d) => d[range],
						(d) => d[seriesKey],
					),
				)

				yScale = d3
					.scaleBand()
					.domain(data.map((d) => d[range]))
					.range([marginTop, height - marginBottom])
					.padding(0.2)

				xScale = d3
					.scaleLinear()
					.domain([0, d3.max(stack, (d) => d3.max(d, (d) => d[1]))])
					.range([width - marginRight, marginLeft])
			} else {
				if (sort === 'ascending') {
					yScale = d3
						.scaleBand()
						.domain(
							d3.groupSort(
								data,
								([d]) => d[domain],
								(d) => d[range],
							),
						)
						.range([marginTop, height - marginBottom])
						.padding(0.2)
				} else if (sort === 'descending') {
					yScale = d3
						.scaleBand()
						.domain(
							d3.groupSort(
								data,
								([d]) => -d[domain],
								(d) => d[range],
							),
						)
						.range([marginTop, height - marginBottom])
						.padding(0.2)
				} else {
					yScale = d3
						.scaleBand()
						.domain(data.map((d) => d[range]))
						.range([marginTop, height - marginBottom])
						.padding(0.2)
				}

				xScale = d3
					.scaleLinear()
					.domain([0, d3.max(data, (d) => d[domain])])
					.range([width - marginRight, marginLeft])
			}
		}
	}

	let tooltip,
		tooltipData = { y: 0, x: 0, title: '', valueOneLabel, tooltipId, valueOne: 0 }

	if (valueTwoLabel) {
		tooltipData.valueTwoLabel = valueTwoLabel
		tooltipData.valueTwo = 0
	}

	if (browser) {
		tooltip = d3.select(`#${tooltipId}`)
	}

	function enterTooltip(e) {
		tooltip.style('opacity', 1)
	}

	function movingTooltip(e, d, s) {
		// console.log('barchart d: ', d)

		const [x, y] = d3.pointer(e)

		tooltipData.x = e.offsetX - 60
		tooltipData.title = s
		tooltipData.y = e.offsetY - 85

		if (stacked) {
			tooltipData.valueOne = d.data[0]
			if (tooltipData.valueTwoLabel) tooltipData.valueTwo = d[1] - d[0]
		} else {
			tooltipData.valueOne = d[tooltipData.valueOneLabel]
			if (tooltipData.valueTwoLabel) tooltipData.valueTwo = d[tooltipData.valueTwoLabel]
		}
	}

	function leaveTooltip(e) {
		tooltip.style('opacity', 0)
	}
</script>

<svelte:window bind:innerWidth />

<svg
	class="bar-chart-svg"
	viewBox="0 0 {width} {height}"
>
	<!-- Side Axis -->
	<g
		class="side-axis"
		transform="translate({marginLeft}, 0)"
	>
		{#if horizontal}
			<line
				stroke="var(--neutral-050)"
				y1={marginTop}
				y2={height - marginBottom}
			/>
			{#each data as d}
				<text
					class="axis-label"
					fill="gray"
					text-anchor="start"
					x={-100}
					y={yScale(d[range]) + yScale.bandwidth() / 2 + 5}
				>
					{d[range]}
				</text>
			{/each}
		{:else if vertical}
			{#each yScale.ticks() as tick}
				<line
					stroke="var(--neutral-050)"
					x1={marginLeft}
					x2={width - marginRight}
					y1={yScale(tick)}
					y2={yScale(tick)}
				/>
			{/each}
		{/if}
	</g>

	<!-- Base Axis -->
	<g
		class="base-axis"
		transform="translate(0,{height - marginBottom})"
	>
		{#if vertical}
			<line
				stroke="var(--neutral-050)"
				x1={marginLeft - 6}
				x2={width}
			/>
			{#if innerWidth >= 500}
				{#each data as d}
					<text
						class="axis-label"
						fill="gray"
						text-anchor="middle"
						x={xScale(d[domain]) + xScale.bandwidth() / 2}
						y={20}
					>
						{d[domain]}
					</text>
				{/each}
			{/if}
		{/if}
	</g>

	<!-- Bars -->
	{#if stacked}
		<g class="bars">
			{#each stack as series, i}
				{#each series as d}
					{#if vertical}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<path
							on:mouseenter={enterTooltip}
							on:mousemove={(e) => movingTooltip(e, d, series.key)}
							on:mouseleave={leaveTooltip}
							fill={barColors[i]}
							d={`
								M${xScale(d.data[0])},${yScale(d[1]) + 4}
								a4,4 0 0 1 4,-4
								h${xScale.bandwidth() - 2 * 4}
								a4,4 0 0 1 4,4
								v${yScale(d[0]) - yScale(d[1]) - 4}
								h${-xScale.bandwidth()}Z
							`}
						/>
					{:else if horizontal}
						<!-- <path 
							fill={barColors[i]}
							d={`
								M${marginLeft},${yScale(d[range]) + 4}
								h${width - xScale(d[domain]) - marginRight - 4}
								a4,4 0 0 1 4,4
								v${yScale.bandwidth() - 2 * 4}
								a-4,4 0 0 1 -4,4
								h${-width + xScale(d[domain]) + marginRight + 4}Z
							`}
						/> -->
					{/if}
				{/each}
			{/each}
		</g>
	{:else}
		<g class="bars">
			{#each data as d, i}
				{#if vertical}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<path
						on:mouseenter={enterTooltip}
						on:mousemove={(e) => movingTooltip(e, d, d[seriesKey])}
						on:mouseleave={leaveTooltip}
						fill={barColors[i]}
						d={`
							M${xScale(d[domain])},${yScale(d[range]) + 4}
							a4,4 0 0 1 4,-4
							h${xScale.bandwidth() - 2 * 4}
							a4,4 0 0 1 4,4
							v${height - yScale(d[range]) - marginBottom - 4}
							h${-xScale.bandwidth()}Z
						`}
					/>
				{:else if horizontal}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<path
						on:mouseenter={enterTooltip}
						on:mousemove={(e) => movingTooltip(e, d, d[seriesKey])}
						on:mouseleave={leaveTooltip}
						fill={barColors[i]}
						d={`
							M${marginLeft},${yScale(d[range]) + 4}
							h${width - xScale(d[domain]) - marginRight - 4}
							a4,4 0 0 1 4,4
							v${yScale.bandwidth() - 2 * 4}
							a-4,4 0 0 1 -4,4
							h${-width + xScale(d[domain]) + marginRight + 4}Z
						`}
					/>
				{/if}
			{/each}
		</g>
	{/if}
</svg>

<ChartTooltip tooltipInfo={tooltipData} />

<style>
	.bar-chart-svg {
		width: 100%;
		display: block;
	}

	.axis-label {
		font-size: 11px;
	}
</style>
