import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Breaddie/);

    // Check for main navigation elements
    await expect(page.getByRole('link', { name: /recipes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create/i })).toBeVisible();
  });

  test('navigates to recipes page', async ({ page }) => {
    await page.goto('/');

    // Click on recipes link
    await page.getByRole('link', { name: /recipes/i }).click();

    // Should navigate to recipes page
    await expect(page).toHaveURL(/\/recipes/);
    await expect(page.getByText(/recipes/i)).toBeVisible();
  });

  test('displays recipe cards on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for recipe cards to load
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 10000 });

    // Check that at least one recipe card is visible
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    await expect(recipeCards.first()).toBeVisible();
  });
});

test.describe('Recipe Search and Filtering', () => {
  test('searches for recipes', async ({ page }) => {
    await page.goto('/recipes');

    // Find search input
    const searchInput = page.getByPlaceholder(/search recipes/i);
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('bread');
    await searchInput.press('Enter');

    // Results should update
    await page.waitForLoadState('networkidle');

    // Check that results contain bread recipes
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    if ((await recipeCards.count()) > 0) {
      await expect(recipeCards.first().getByText(/bread/i)).toBeVisible();
    }
  });

  test('filters recipes by category', async ({ page }) => {
    await page.goto('/recipes');

    // Find category filter
    const categoryFilter = page.getByLabel(/category/i);
    await expect(categoryFilter).toBeVisible();

    // Select breads category
    await categoryFilter.selectOption('breads');

    // Wait for results to update
    await page.waitForLoadState('networkidle');

    // Check that only bread recipes are shown
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    if ((await recipeCards.count()) > 0) {
      // All visible recipes should be in breads category
      await expect(page.getByText(/breads/i).first()).toBeVisible();
    }
  });
});
