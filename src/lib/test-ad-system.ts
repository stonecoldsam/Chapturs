/**
 * Ad System Integration Test
 * 
 * Tests the ad placement API endpoints and editor integration
 */

import { test, expect } from '@playwright/test'

test.describe('Ad Placement System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to creator dashboard/editor
    await page.goto('/creator/editor')
    
    // Assume we have auth setup or mock auth
    // In a real test, we'd handle authentication properly
  })

  test('can enable monetization in settings', async ({ page }) => {
    // Open sidebar if not already open
    await page.click('[data-testid="toggle-sidebar"]', { force: true }).catch(() => {})
    
    // Navigate to settings tab
    await page.click('text=Settings')
    
    // Enable monetization
    const monetizationCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /Enable Monetization/i })
    await monetizationCheckbox.check()
    
    // Verify checkbox is checked
    await expect(monetizationCheckbox).toBeChecked()
  })

  test('can access ads tab when monetization is enabled', async ({ page }) => {
    // Enable monetization first
    await page.click('text=Settings')
    await page.check('input[type="checkbox"]')
    
    // Navigate to ads tab
    await page.click('text=Ads')
    
    // Verify ad placement editor is visible
    await expect(page.locator('text=Ad Placements')).toBeVisible()
    await expect(page.locator('text=AI Suggestions')).toBeVisible()
  })

  test('shows monetization disabled message when not enabled', async ({ page }) => {
    // Navigate to ads tab without enabling monetization
    await page.click('text=Ads')
    
    // Verify disabled message is shown
    await expect(page.locator('text=Monetization Disabled')).toBeVisible()
    await expect(page.locator('text=Enable ads in your creator settings')).toBeVisible()
  })

  test('can create a new ad placement', async ({ page }) => {
    // Setup: Enable monetization
    await page.click('text=Settings')
    await page.check('input[type="checkbox"]')
    await page.click('text=Ads')
    
    // Click add new placement
    await page.click('[title="Add new ad placement"]')
    
    // Fill out placement form
    await page.selectOption('select', 'SCENE_BREAK')
    await page.selectOption('select >> nth=1', 'NATIVE')
    
    // Adjust revenue share
    await page.fill('input[type="range"]', '0.8')
    
    // Create placement
    await page.click('text=Create Placement')
    
    // Verify placement appears in list
    await expect(page.locator('text=Scene Break')).toBeVisible()
    await expect(page.locator('text=Revenue: 80%')).toBeVisible()
  })

  test('displays AI suggestions for optimal placements', async ({ page }) => {
    // Add some content to trigger suggestions
    await page.fill('[data-testid="editor-content"]', 
      'This is a long story with multiple paragraphs. '.repeat(50)
    )
    
    // Enable monetization and go to ads
    await page.click('text=Settings')
    await page.check('input[type="checkbox"]')
    await page.click('text=Ads')
    
    // Verify AI suggestions appear
    await expect(page.locator('text=AI Suggestions')).toBeVisible()
    await expect(page.locator('text=High engagement at chapter beginning')).toBeVisible()
    
    // Accept a suggestion
    await page.click('text=Accept >> first')
    
    // Verify placement was created
    await expect(page.locator('text=Chapter Start')).toBeVisible()
  })

  test('can pause and resume ad placements', async ({ page }) => {
    // Create a placement first
    await page.click('text=Settings')
    await page.check('input[type="checkbox"]')
    await page.click('text=Ads')
    await page.click('[title="Add new ad placement"]')
    await page.click('text=Create Placement')
    
    // Pause the placement
    await page.click('[title="Pause placement"]')
    
    // Verify placement shows as paused
    await expect(page.locator('text=Paused')).toBeVisible()
    
    // Resume the placement
    await page.click('[title="Activate placement"]')
    
    // Verify placement is active again
    await expect(page.locator('text=Paused')).not.toBeVisible()
  })

  test('displays revenue projections', async ({ page }) => {
    // Create multiple placements
    await page.click('text=Settings')
    await page.check('input[type="checkbox"]')
    await page.click('text=Ads')
    
    // Add a few placements
    for (let i = 0; i < 3; i++) {
      await page.click('[title="Add new ad placement"]')
      await page.click('text=Create Placement')
    }
    
    // Verify revenue projection is displayed
    await expect(page.locator('text=Revenue Projection')).toBeVisible()
    await expect(page.locator('text=Weekly')).toBeVisible()
    await expect(page.locator('text=Monthly')).toBeVisible()
    
    // Verify numbers are showing (should be > $0)
    const weeklyRevenue = await page.locator('text=/\\$\\d+\\.\\d+/ >> nth=0').textContent()
    expect(parseFloat(weeklyRevenue?.replace('$', '') || '0')).toBeGreaterThan(0)
  })
})

// API Tests
test.describe('Ad Placement API', () => {
  test('POST /api/ads/placements creates placement', async ({ request }) => {
    const placementData = {
      workId: 'test-work-id',
      placementType: 'INLINE_CONTENT',
      format: 'BANNER',
      position: { paragraph: 1 },
      revenueShare: 0.7,
      isActive: true,
      requiresApproval: false
    }
    
    const response = await request.post('/api/ads/placements', {
      data: placementData
    })
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.placement).toBeDefined()
    expect(data.placement.placementType).toBe('INLINE_CONTENT')
    expect(data.placement.revenueShare).toBe(0.7)
  })

  test('GET /api/ads/placements retrieves placements', async ({ request }) => {
    const response = await request.get('/api/ads/placements?workId=test-work-id')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.placements).toBeInstanceOf(Array)
    expect(data.totalPlacements).toBeDefined()
    expect(data.activePlacements).toBeDefined()
  })

  test('PATCH /api/ads/placements/[id] updates placement', async ({ request }) => {
    // First create a placement
    const createResponse = await request.post('/api/ads/placements', {
      data: {
        workId: 'test-work-id',
        placementType: 'INLINE_CONTENT',
        format: 'BANNER',
        position: { paragraph: 1 },
        revenueShare: 0.7
      }
    })
    
    const { placement } = await createResponse.json()
    
    // Update the placement
    const updateResponse = await request.patch(`/api/ads/placements/${placement.id}`, {
      data: {
        revenueShare: 0.8,
        isActive: false
      }
    })
    
    expect(updateResponse.status()).toBe(200)
    
    const updatedData = await updateResponse.json()
    expect(updatedData.placement.revenueShare).toBe(0.8)
    expect(updatedData.placement.isActive).toBe(false)
  })

  test('DELETE /api/ads/placements/[id] removes placement', async ({ request }) => {
    // First create a placement
    const createResponse = await request.post('/api/ads/placements', {
      data: {
        workId: 'test-work-id',
        placementType: 'INLINE_CONTENT',
        format: 'BANNER',
        position: { paragraph: 1 },
        revenueShare: 0.7
      }
    })
    
    const { placement } = await createResponse.json()
    
    // Delete the placement
    const deleteResponse = await request.delete(`/api/ads/placements/${placement.id}`)
    
    expect(deleteResponse.status()).toBe(200)
    
    // Verify it's deleted
    const getResponse = await request.get(`/api/ads/placements/${placement.id}`)
    expect(getResponse.status()).toBe(404)
  })
})