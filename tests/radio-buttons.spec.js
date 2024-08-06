import { test, expect } from '@playwright/test'

test.describe('Radio Buttons Test', () => {
	const baseUrl = 'http://localhost:4173/'

	test.beforeEach(async ({ page }) => {
		await page.goto(baseUrl)
		await page.locator('a:has-text("Tables")').click()
	})

	test('Testing the Radio Buttons', async ({ page }) => {
		const radioButtons = page.locator('input[type="radio"]')
		const count = await radioButtons.count()
		expect(count).toBe(2)

		for (let i = 0; i < count; i++) {
			const radioButton = radioButtons.nth(i)
			const isEnabled = await radioButton.isEnabled()
			const isChecked = await radioButton.isChecked()
			expect(isEnabled).toBe(true)
			expect(isChecked).toBe(false)

			if (!isChecked) {
				await radioButton.click()
			}

			expect(await radioButton.isChecked()).toBe(true)
		}
	})
})
