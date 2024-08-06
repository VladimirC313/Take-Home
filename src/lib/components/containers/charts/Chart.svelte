<script>
	import { AreaChart, BarChart, Card, ChartKeyContainer, PieChart } from '$lib/index.js'
	import { afterUpdate } from 'svelte'

	export let data = [],
		type = '',
		title = 'Title',
		domain = '',
		range = '',
		valueOneLabel,
		valueTwoLabel = '',
		fullDate = false,
		yearOnly = false,
		monthOnly = false,
		monthDay = false,
		monthYear = false,
		tooltipId = '',
		barColors = ['var(--secondary-600)', 'var(--secondary-base)', 'var(--secondary-400)', 'var(--secondary-300)', 'var(--secondary-200)', 'var(--secondary-100)', 'var(--secondary-050)'],
		areaColors = ['var(--secondary-trans-600)', 'var(--secondary-trans-500)', 'var(--secondary-trans-400)', 'var(--secondary-trans-300)', 'var(--secondary-trans-200)', 'var(--secondary-trans-100)'],
		lineColors = ['var(--secondary-600)', 'var(--secondary-base)', 'var(--secondary-400)', 'var(--secondary-300)', 'var(--secondary-200)', 'var(--secondary-100)'],
		arcColors = ['var(--secondary-600)', 'var(--secondary-base)', 'var(--secondary-400)', 'var(--secondary-300)', 'var(--secondary-200)', 'var(--secondary-100)', 'var(--secondary-050)'],
		vertical = false,
		horizontal = false,
		stacked = false,
		sort = '',
		seriesKey = '',
		ring = false,
		line = false,
		singleXSmallSlot = false,
		singleSmallSlot = false,
		singleMediumSlot = false,
		stackedSmallSlot = false,
		stackedMediumSlot = false,
		stackedLargeSlot = false

	let chartWidth,
		chartHeight,
		chartHeader,
		keyContainerKeys = []

	afterUpdate(() => {
		// pull out the unique series values for the chart key
		let seenValues = []
		keyContainerKeys.length = 0
		for (let item of data) {
			keyContainerKeys.push(item[seriesKey])
		}
		for (let [index, value] of keyContainerKeys.entries()) {
			if (!seenValues.includes(value)) {
				const obj = {}
				obj[seriesKey] = value
				keyContainerKeys[index] = obj
				seenValues.push(value)
			}
		}
		for (let i = keyContainerKeys.length - 1; i >= 0; i--) {
			if (typeof keyContainerKeys[i] === 'string') keyContainerKeys.splice(i, 1)
		}
	})
</script>

<Card
	{title}
	chart
	classes={['neutral-shadow-l']}
	styles={['position: relative', `max-width: ${type === 'pie' ? '354px' : '100%'}`, `height: 100%`, 'border: 1px solid var(--neutral-100)', 'border-radius: 24px', 'padding: var(--spacing09)', 'font-weight: 700']}
>
	<slot name="chart-header" />
	<div
		class="chart-wrapper {singleXSmallSlot ? 'single-xs-slots' : ''} {singleSmallSlot ? 'single-s-slots' : ''} {singleMediumSlot ? 'single-m-slots' : ''} {stacked ? 'stacked-xs-slots' : ''} {stackedSmallSlot ? 'stacked-s-slots' : ''} {stackedMediumSlot ? 'stacked-m-slots' : ''} {stackedLargeSlot ? 'stacked-l-slots' : ''}"
		bind:clientWidth={chartWidth}
		bind:clientHeight={chartHeight}
	>
		{#if type === 'bar'}
			<BarChart
				{tooltipId}
				{data}
				{domain}
				{range}
				{valueOneLabel}
				{valueTwoLabel}
				{barColors}
				{vertical}
				{horizontal}
				{stacked}
				{sort}
				{seriesKey}
				{chartHeight}
				{chartWidth}
			/>
			{#if stacked}
				<ChartKeyContainer
					data={keyContainerKeys}
					{seriesKey}
					colors={barColors}
					column={chartWidth < 500 ? true : false}
				/>
			{/if}
		{:else if type === 'area'}
			<AreaChart
				{tooltipId}
				{data}
				{domain}
				{range}
				{valueOneLabel}
				{valueTwoLabel}
				{seriesKey}
				{areaColors}
				{lineColors}
				{stacked}
				{line}
				{fullDate}
				{yearOnly}
				{monthOnly}
				{monthDay}
				{monthYear}
				{chartWidth}
				{chartHeight}
			/>
			{#if stacked}
				<ChartKeyContainer
					data={keyContainerKeys}
					{seriesKey}
					colors={lineColors}
					column={chartWidth < 500 ? true : false}
				/>
			{/if}
		{:else if type === 'pie'}
			<PieChart
				{tooltipId}
				{data}
				{domain}
				{range}
				{valueOneLabel}
				{valueTwoLabel}
				{sort}
				{arcColors}
				{ring}
				height={280}
			/>
			<ChartKeyContainer
				{data}
				{seriesKey}
				colors={arcColors}
				column={chartWidth < 500 ? true : false}
			/>
		{:else if type === '' || data.length === 0}
			<p>This chart has no data or parameters</p>
		{/if}
	</div>
</Card>

<style>
	.chart-wrapper {
		margin-top: var(--spacing09);
		height: calc(100% - var(--spacing09));
	}

	.single-xs-slots {
		height: calc(100% - 123px);
	}

	.single-s-slots {
		height: calc(100% - 185px);
	}

	.single-m-slots {
		height: calc(100% - 260px);
	}

	.stacked-xs-slots {
		height: calc(100% - 45px);
	}

	.stacked-s-slots {
		height: calc(100% - 178px);
	}

	.stacked-m-slots {
		height: calc(100% - 230px);
	}

	.stacked-l-slots {
		height: calc(100% - 310px);
	}
</style>
