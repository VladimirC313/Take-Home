import { test, expect } from '@playwright/test'

test.describe('Charts Tests', () => {
	const baseUrl = 'http://localhost:4173/'

	test.beforeEach(async ({ page }) => {
		await page.goto(baseUrl)
		await page.locator('a:has-text("Charts")').click()
		const actualHeader = await page.locator('h2').textContent()
		const expectedHeader = 'Charts'
		expect(actualHeader).toBe(expectedHeader)
	})

	test('Graphs Have Fixed Width', async ({ page }) => {
		const expectedWidth = 840
		const graphLocators = [page.locator('.simple-v-bar'), page.locator('.simple-h-bar'), page.locator('.simple-area-chart'), page.locator('.stacked-area-chart')]

		for (const graphLocator of graphLocators) {
			const width = await graphLocator.evaluate((element) => element.getBoundingClientRect().width)
			expect(width).toBe(expectedWidth)
		}
	})

	test('Pie Charts Do Not Have Matching Widths', async ({ page }) => {
		const pieChart = page.locator('.pie-chart .chart-content')
		const ringChart = page.locator('.ring-chart .chart-content')

		const getWidth = async (locator) => {
			return locator.evaluate((el) => el.getBoundingClientRect().width)
		}

		const pieChartWidth = await getWidth(pieChart)
		console.log(`Pie Chart's Width: ${pieChartWidth}`)

		const ringChartWidth = await getWidth(ringChart)
		console.log(`Ring Chart's Width: ${ringChartWidth}`)

		expect(pieChartWidth).not.toBe(ringChartWidth)
	})

	test('Graphs Have Fixed Height --> Purposefully Fail', async ({ page }) => {
		const maxHeight = 1000
		const graphLocators = [page.locator('.simple-v-bar'), page.locator('.simple-h-bar'), page.locator('.simple-area-chart'), page.locator('.stacked-area-chart'), page.locator('.pie-chart'), page.locator('.ring-chart')]

		for (const locator of graphLocators) {
			const height = await locator.evaluate((el) => el.getBoundingClientRect().height)
			expect(height).toBeLessThanOrEqual(maxHeight)
		}
	})

	test('Bar Graph Will Timeout Because No Fixed Height', async ({ page }) => {
		const ourStabilityTimeout = 5000

		const barGraph = page.locator('.simple-v-bar')
		await barGraph.scrollIntoViewIfNeeded

		const getCurrentHeightFunction = async () => barGraph.evaluate((el) => el.getBoundingClientRect().height)

		const startingHeight = await getCurrentHeightFunction()
		console.log('Starting Height: ' + startingHeight)

		await page.waitForTimeout(ourStabilityTimeout)

		const endingHeight = await getCurrentHeightFunction()
		console.log('Ending Height: ' + endingHeight)

		expect(startingHeight).not.toBe(endingHeight)
	})

	test('Chart Title Is Displayed', async ({ page }) => {
		const graphs = [
			{ locator: page.locator('.simple-v-bar'), expectedTitle: 'Simple Vertical Bar Chart' },
			{ locator: page.locator('.simple-h-bar'), expectedTitle: 'Simple Horizontal Bar Chart' },
			{ locator: page.locator('.simple-area-chart'), expectedTitle: 'Simple Area Chart' },
			{ locator: page.locator('.stacked-area-chart'), expectedTitle: 'Stacked Area Chart' },
			{ locator: page.locator('.stacked-v-bar'), expectedTitle: 'Stacked Vertical Bar Chart' },
			{ locator: page.locator('.stacked-h-bar'), expectedTitle: 'Stacked Horizontal Bar Chart' },
			{ locator: page.locator('.pie-chart'), expectedTitle: 'Pie Chart' },
			{ locator: page.locator('.ring-chart'), expectedTitle: 'Ring Chart' },
		]

		for (const { locator, expectedTitle } of graphs) {
			const title = locator.locator('.card-title')
			await expect(title).toHaveText(expectedTitle)
		}
	})
})
