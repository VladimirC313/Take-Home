import { test, expect } from '@playwright/test'

test.describe('Toasts Test', () => {
	const baseUrl = 'http://localhost:4173/'

	test.beforeEach(async ({ page }) => {
		await page.goto(baseUrl)
		await page.locator('a:has-text("Toasts")').click()
	})

	test('Verify Toasts Page', async ({ page }) => {
		const ourJsonLocator = page.locator('pre code')
		const ourJsonText = await ourJsonLocator.textContent()
		console.log('Our JSON Toasts:', ourJsonText)

		const cleanJson = ourJsonText.replace(/^\s*const\s+toastList\s*=\s*/, '').trim()

		let actualData
		try {
			actualData = new Function('return ' + cleanJson)()
			console.log('Parsed cleanJson:', actualData)
		} catch (error) {
			throw new Error('Failed to evaluate...')
		}

		const expectedData = [
			{
				body: 'Yay!',
				category: 'dismiss',
				id: 0,
				purpose: 'success',
				title: 'Success!',
			},
			{
				body: 'Oh no, what now?',
				category: 'action',
				id: 1,
				purpose: 'error',
				title: 'Error!',
			},
		]

		expect(actualData).toEqual(expectedData)
	})
})
