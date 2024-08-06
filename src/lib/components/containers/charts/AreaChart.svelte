<script>
	import * as d3 from 'd3'
	import { ChartTooltip } from '$lib/index.js'
	import { browser } from '$app/environment'

	/**
	 *  @param {array} data
	 *      data - an array of objects containing the area chart data.
	 *      For UNSTACKED area charts each object must have a minimum of three properties –
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
	 *      seriesKey - string property that declares the object key differentiating each series
	 */

	export let data = [],
		tooltipId,
		areaColors = [],
		lineColors = [],
		domain,
		range,
		valueOneLabel,
		valueTwoLabel,
		seriesKey,
		fullDate,
		yearOnly,
		monthOnly,
		monthDay,
		monthYear,
		line = false,
		stacked = false,
		chartWidth = null,
		chartHeight = null

	let innerWidth
	$: width = innerWidth < 768 ? 294 : chartWidth
	$: height = innerWidth < 768 ? 350 : chartHeight || 400
	let marginLeft = 15
	let marginRight = 15
	let marginTop = 24
	let marginBottom = 24

	let xScale,
		yScale,
		stroke,
		stack,
		area,
		lines = []
	let formatFull = d3.utcFormat('%b %d, %Y')
	let formatYear = d3.utcFormat('%Y')
	let formatMonth = d3.utcFormat('%b')
	let formatMonthDay = d3.utcFormat('%b %d')
	let formatMonthYear = d3.utcFormat('%b %Y')

	$: {
		if (stacked) {
			for (let obj of data) {
				obj[domain] = new Date(obj[domain])
			}

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
				.scaleTime()
				.domain(d3.extent(data, (d) => d[domain]))
				.range([marginLeft, width - marginRight])

			yScale = d3
				.scaleLinear()
				.domain([0, d3.max(stack, (d) => d3.max(d, (d) => d[1]))])
				.range([height - marginBottom, marginTop])

			area = d3
				.area()
				.x((d) => xScale(d.data[0]))
				.y0((d) => yScale(d[0]))
				.y1((d) => yScale(d[1]))

			stroke = d3
				.line()
				.x((d) => xScale(d.data[0]))
				.y((d) => yScale(d[1]))

			//
		} else {
			for (let obj of data) {
				obj[domain] = new Date(obj[domain])
			}

			xScale = d3
				.scaleTime()
				.domain(d3.extent(data, (d) => d[domain]))
				.range([marginLeft, width - marginRight])
			yScale = d3
				.scaleLinear()
				.domain([0, d3.max(data, (d) => d[range])])
				.range([height - marginBottom, marginTop])

			area = d3
				.area()
				.x((d) => xScale(d[domain]))
				.y0(yScale(0))
				.y1((d) => yScale(d[range]))

			stroke = d3
				.line()
				.x((d) => xScale(d[domain]))
				.y((d) => yScale(d[range]))

			//
		}
	}

	let tooltip,
		tooltipData = { y: 0, x: 0, line: 0, color: '', title: '', tooltipId, valueOneLabel, valueOne: 0 }

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

	function movingTooltip(e, d, s, stack, i, c) {
		const [x, y] = d3.pointer(e)

		const mouseDate = xScale.invert(x)
		const bisectDate = d3.bisector((d) => d[domain]).right
		const xIndex = bisectDate(d, mouseDate, 1)

		let mouseValue = data[xIndex][range]

		tooltipData.color = c
		tooltipData.x = e.offsetX - 60
		tooltipData.line = x + 3
		tooltipData.title = s
		tooltipData.y = e.offsetY - 90

		if (stacked) {
			const stackedMouseDate = data[xIndex][domain]
			let allRelevantEntries = []
			stack.forEach((series) => {
				for (let item of series) {
					if (item.data[0].getTime() === stackedMouseDate.getTime()) {
						allRelevantEntries.push(item)
					}
				}
			})

			if (i === 0) {
				mouseValue = allRelevantEntries[0][1]
			} else if (i === 1) {
				mouseValue = allRelevantEntries[1][1] - allRelevantEntries[1][0]
			} else if (i === 2) {
				mouseValue = allRelevantEntries[2][1] - allRelevantEntries[2][0]
			} else if (i === 3) {
				mouseValue = allRelevantEntries[3][1] - allRelevantEntries[3][0]
			}
		}

		if (xScale(mouseDate) < marginLeft + 40) tooltipData.x = marginLeft

		tooltipData.valueOne = fullDate ? formatFull(xScale.invert(x)) : yearOnly ? formatYear(xScale.invert(x)) : monthOnly ? formatMonth(xScale.invert(x)) : monthDay ? formatMonthDay(xScale.invert(x)) : monthYear ? formatMonthYear(xScale.invert(x)) : formatFull(xScale.invert(x))
		if (tooltipData.valueTwoLabel) tooltipData.valueTwo = mouseValue
	}

	function leaveTooltip(e) {
		tooltip.style('opacity', 0)
	}
</script>

<svelte:window bind:innerWidth />

<svg
	class="area-chart-svg"
	viewBox="0 0 {width} {height}"
>
	<!-- Y-Axis lines -->
	{#each yScale.ticks() as tick}
		<line
			stroke="var(--neutral-050)"
			x1={marginLeft}
			x2={width - marginRight}
			y1={yScale(tick)}
			y2={yScale(tick)}
		/>
	{/each}

	<!-- Areas -->
	{#if stacked}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		{#each stack as series, i}
			<!-- svelte-ignore missing-declaration -->
			<path
				stroke={lineColors[i]}
				stroke-width={2}
				fill="none"
				d={stroke(series)}
			/>
			{#if !line}
				<path
					on:mouseenter={enterTooltip}
					on:mousemove={(e) => movingTooltip(e, data, series.key, stack, i, lineColors[i])}
					on:mouseleave={leaveTooltip}
					fill={areaColors[i]}
					d={area(series)}
				/>
			{/if}
		{/each}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
	{:else}
		<path
			stroke={lineColors[0]}
			stroke-width="2"
			fill="none"
			d={stroke(data)}
		/>
		<!-- svelte-ignore missing-declaration -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			on:mouseenter={enterTooltip}
			on:mousemove={(e) => movingTooltip(e, data, data[0][seriesKey])}
			on:mouseleave={leaveTooltip}
			fill={line ? 'rgba(0,0,0,0)' : areaColors[0]}
			d={area(data)}
		/>
	{/if}

	<!-- Base Axis -->
	<g transform="translate(0,{height - marginBottom})">
		{#if stacked}
			{#each stack as series, i}
				{#each series as item}
					<line
						stroke="var(--neutral-050)"
						stroke-width={2}
						x1={xScale(item.data[0])}
						x2={xScale(item.data[0])}
						y1={marginTop}
						y2={height - marginBottom}
					/>
					<text
						class="axis-label"
						fill="gray"
						text-anchor="middle"
						x={xScale(item.data[0])}
						y={22}
					>
						{fullDate ? formatFull(item.data[0]) : yearOnly ? formatYear(item.data[0]) : monthOnly ? formatMonth(item.data[0]) : monthDay ? formatMonthDay(item.data[0]) : monthYear ? formatMonthYear(item.data[0]) : formatFull(item.data[0])}
					</text>
				{/each}
			{/each}
		{:else}
			{#each data as d, i}
				<text
					class="axis-label"
					fill="gray"
					text-anchor="middle"
					x={xScale(d[domain])}
					y={22}
				>
					{fullDate ? formatFull(d[domain]) : yearOnly ? formatYear(d[domain]) : monthOnly ? formatMonth(d[domain]) : monthDay ? formatMonthDay(d[domain]) : monthYear ? formatMonthYear(d[domain]) : formatFull(d[domain])}
				</text>
			{/each}
		{/if}
	</g>

	<!-- Tooltip Line -->
	<line
		stroke="var(--neutral-trans-100)"
		stroke-dasharray="2 3"
		x1={tooltipData.line}
		x2={tooltipData.line}
		y1={marginTop}
		y2={height - marginBottom}
	/>
</svg>

<ChartTooltip tooltipInfo={tooltipData} />

<style>
	.area-chart-svg {
		width: 100%;
	}

	.axis-label {
		font-size: 11px;
	}
</style>
