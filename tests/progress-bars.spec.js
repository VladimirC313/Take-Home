import { test, expect } from '@playwright/test'

test.describe('Progress Bars Tests', () => {
	const baseUrl = 'http://localhost:4173/'

	test.beforeEach(async ({ page }) => {
		await page.goto(baseUrl)
		await page.locator('a:has-text("Progress")').click()
	})

	test('Verify Progress Bar Colors', async ({ page }) => {
		const allProgressBars = page.locator('.progress-bar-fill')

		const expectedColors = ['rgb(255, 212, 73)', 'rgb(240, 68, 56)', 'rgb(243, 241, 253)', 'rgb(50, 213, 131)']

		expect(await allProgressBars.count()).toBe(expectedColors.length)

		for (let i = 0; i < expectedColors.length; i++) {
			const progressBar = allProgressBars.nth(i)
			const backgroundColor = await progressBar.evaluate((el) => window.getComputedStyle(el).backgroundColor)

			console.log(`Progress Bar ${i + 1}: Actual ${backgroundColor}, Expected ${expectedColors[i]}`)

			expect(backgroundColor).toBe(expectedColors[i])
		}
	})

	test('Verify Functionality of the Alert Progress Bar', async ({ page }) => {
		const alertProgressBar = page.locator('.progress-bar-fill').nth(0)

		const moreButton = page.locator('button:has-text("More")')
		await expect(moreButton).toBeEnabled()
		await moreButton.click({ button: 'left', clickCount: 7 })

		let expectedStyleAttribute = 'width: 70%'
		let actualStyleAttribute = await alertProgressBar.evaluate((el) => el.getAttribute('style'))
		expect(actualStyleAttribute).toBe(expectedStyleAttribute)

		await page.reload()

		const lessButton = page.locator('button:has-text("Less")')
		await lessButton.click({ button: 'left', clickCount: 3 })

		expectedStyleAttribute = 'width: -30%'
		actualStyleAttribute = await alertProgressBar.evaluate((el) => el.getAttribute('style'))
		expect(actualStyleAttribute).toBe(expectedStyleAttribute)
	})

	test('Verify Circle Animation', async ({ page }) => {
		const circleButton = page.locator('svg.progress-spinner circle').nth(-1)
		await expect(circleButton).toBeVisible()

		const strokeDasharray = await circleButton.evaluate((el) => el.getAttribute('stroke-dasharray'))
		expect(strokeDasharray).toBe('12.566370614359172, 100')
	})

	test('Verify Circle Button Color Change', async ({ page }) => {
		const circleButton = page.locator('div.btn-content-wrapper.btn-fit.btn-l.btn-square.btn-primary')

		const colorBefore = await circleButton.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'))
		expect(colorBefore).toBe('rgb(255, 212, 73)')

		await circleButton.hover()

		const colorAfter = await circleButton.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'))
		expect(colorBefore).not.toBe(colorAfter)
		await console.log('The Color After Hovering Over With a Mouse Is: ', colorAfter)
	})
})
