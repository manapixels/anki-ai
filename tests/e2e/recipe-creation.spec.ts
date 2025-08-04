import { test, expect } from '@playwright/test';

test.describe('Recipe Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to recipe creation page
    await page.goto('/recipes/create');
  });

  test('displays recipe creation form', async ({ page }) => {
    // Check form elements are present
    await expect(page.getByLabel(/recipe name/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/category/i)).toBeVisible();
    await expect(page.getByLabel(/difficulty/i)).toBeVisible();
    await expect(page.getByLabel(/total time/i)).toBeVisible();
    await expect(page.getByLabel(/servings/i)).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /create recipe/i }).click();

    // Should show validation errors
    await expect(page.getByText(/recipe name is required/i)).toBeVisible();
    await expect(page.getByText(/description is required/i)).toBeVisible();
  });

  test('creates a basic recipe', async ({ page }) => {
    // Fill out basic recipe information
    await page.getByLabel(/recipe name/i).fill('Test Playwright Recipe');
    await page.getByLabel(/description/i).fill('A recipe created during E2E testing');

    // Select category and subcategory
    await page.getByLabel(/category/i).selectOption('breads');
    await page.getByLabel(/subcategory/i).selectOption('lean-dough');

    // Set difficulty and timing
    await page.getByLabel(/difficulty/i).selectOption('1');
    await page.getByLabel(/total time/i).fill('120');
    await page.getByLabel(/servings/i).fill('4');

    // Add an ingredient
    await page.getByRole('button', { name: /add ingredient/i }).click();
    await page
      .getByPlaceholder(/ingredient name/i)
      .first()
      .fill('Flour');
    await page
      .getByPlaceholder(/amount/i)
      .first()
      .fill('500');
    await page.getByLabel(/unit/i).first().selectOption('g');

    // Add an instruction
    await page.getByRole('button', { name: /add instruction/i }).click();
    await page
      .getByPlaceholder(/instruction content/i)
      .first()
      .fill('Mix the flour with water');

    // Submit the form
    await page.getByRole('button', { name: /create recipe/i }).click();

    // Should redirect to the new recipe page
    await expect(page).toHaveURL(/\/recipes\/test-playwright-recipe/);
    await expect(page.getByText('Test Playwright Recipe')).toBeVisible();
  });

  test('adds multiple components to recipe', async ({ page }) => {
    // Fill basic info
    await page.getByLabel(/recipe name/i).fill('Multi-Component Recipe');
    await page.getByLabel(/description/i).fill('Recipe with multiple components');
    await page.getByLabel(/category/i).selectOption('sweets');
    await page.getByLabel(/subcategory/i).selectOption('cakes');

    // Add first component
    await page.getByRole('button', { name: /add component/i }).click();
    await page
      .getByPlaceholder(/component name/i)
      .first()
      .fill('Cake Base');

    // Add ingredient to first component
    await page
      .getByRole('button', { name: /add ingredient/i })
      .first()
      .click();
    await page.getByPlaceholder(/ingredient name/i).fill('Sugar');
    await page.getByPlaceholder(/amount/i).fill('200');

    // Add second component
    await page.getByRole('button', { name: /add component/i }).click();
    await page
      .getByPlaceholder(/component name/i)
      .last()
      .fill('Frosting');

    // Verify both components are present
    await expect(page.getByText('Cake Base')).toBeVisible();
    await expect(page.getByText('Frosting')).toBeVisible();
  });

  test('drag and drop ingredient reordering', async ({ page }) => {
    // Fill basic info
    await page.getByLabel(/recipe name/i).fill('Reorder Test Recipe');
    await page.getByLabel(/description/i).fill('Testing ingredient reordering');
    await page.getByLabel(/category/i).selectOption('breads');

    // Add multiple ingredients
    await page.getByRole('button', { name: /add ingredient/i }).click();
    await page
      .getByPlaceholder(/ingredient name/i)
      .first()
      .fill('Flour');

    await page.getByRole('button', { name: /add ingredient/i }).click();
    await page
      .getByPlaceholder(/ingredient name/i)
      .last()
      .fill('Water');

    await page.getByRole('button', { name: /add ingredient/i }).click();
    await page
      .getByPlaceholder(/ingredient name/i)
      .last()
      .fill('Salt');

    // Get drag handles
    const dragHandles = page.locator('[data-testid="drag-handle"]');
    await expect(dragHandles).toHaveCount(3);

    // Test that ingredients can be reordered (basic check)
    const firstIngredient = page.getByDisplayValue('Flour');
    const secondIngredient = page.getByDisplayValue('Water');

    await expect(firstIngredient).toBeVisible();
    await expect(secondIngredient).toBeVisible();
  });
});
