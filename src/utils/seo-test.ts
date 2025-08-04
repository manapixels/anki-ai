import { Recipe } from '@/types/recipe';
import { Profile } from '@/types/profile';
import { generateRecipeStructuredData, generatePersonStructuredData } from './seo';

// Test recipe data with proper types
const testRecipe: Recipe & { author: Profile } = {
  id: 'test-recipe-id',
  name: 'Perfect Chocolate Chip Cookies',
  original_name: null,
  original_language: null,
  description:
    'Crispy on the outside, chewy on the inside chocolate chip cookies that are perfect for any occasion.',
  category: 'sweets',
  subcategory: 'cookies',
  slug: 'perfect-chocolate-chip-cookies',
  status: 'published',
  total_time: 30,
  servings: 24,
  difficulty: 2,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  created_by: 'test-user-id',
  image_url: 'chocolate-chip-cookies.jpg',
  metadata: null,
  version_id: null,
  components: [
    {
      id: 'dry-ingredients',
      name: 'Dry Ingredients',
      order: 1,
      ingredients: [
        { name: 'All-purpose flour', amount: '500', unit: 'g' },
        { name: 'Baking soda', amount: '5', unit: 'g' },
        { name: 'Salt', amount: '5', unit: 'g' },
      ],
    },
    {
      id: 'wet-ingredients',
      name: 'Wet Ingredients',
      order: 2,
      ingredients: [
        { name: 'Butter', amount: '250', unit: 'g' },
        { name: 'Brown sugar', amount: '150', unit: 'g' },
        { name: 'White sugar', amount: '150', unit: 'g' },
        { name: 'Eggs', amount: '100', unit: 'g' },
        { name: 'Vanilla extract', amount: '10', unit: 'ml' },
        { name: 'Chocolate chips', amount: '200', unit: 'g' },
      ],
    },
  ],
  instruction_sections: [
    {
      id: 'main',
      name: 'Instructions',
      order: 1,
      steps: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
  ],
  instructions: [
    { step: 1, content: 'Preheat oven to 375°F (190°C).' },
    { step: 2, content: 'Mix flour, baking soda, and salt in a bowl.' },
    { step: 3, content: 'In another bowl, beat butter and sugars until creamy.' },
    { step: 4, content: 'Beat in eggs and vanilla.' },
    { step: 5, content: 'Gradually mix in flour mixture.' },
    { step: 6, content: 'Stir in chocolate chips.' },
    { step: 7, content: 'Drop rounded tablespoons of dough onto ungreased cookie sheets.' },
    { step: 8, content: 'Bake for 9-11 minutes until golden brown.' },
    { step: 9, content: 'Cool on baking sheet for 2 minutes; remove to wire rack.' },
  ],
  preparation: ['Room temperature ingredients work best for even mixing.'],
  nutrition_info: {
    calories: { value: 195, unit: 'kcal' },
    fatContent: { value: 9, unit: 'g' },
    carbohydrateContent: { value: 28, unit: 'g' },
    proteinContent: { value: 2, unit: 'g' },
    fiberContent: { value: 1, unit: 'g' },
    sugarContent: { value: 18, unit: 'g' },
    sodiumContent: { value: 140, unit: 'mg' },
  },
  author: {
    id: 'test-user-id',
    name: 'Jane Baker',
    username: 'janebaker',
    avatar_url: 'jane-avatar.jpg',
    preferred_unit_system: 'metric',
    updated_at: '2024-01-15T10:00:00Z',
  },
};

// Test profile data with proper types
const testProfile: Profile = {
  id: 'test-user-id',
  name: 'Jane Baker',
  username: 'janebaker',
  avatar_url: 'jane-avatar.jpg',
  preferred_unit_system: 'metric',
  updated_at: '2024-01-15T10:00:00Z',
};

// Test hearts data
const testHearts = {
  total_hearts: 156,
};

/**
 * Test function to validate recipe structured data
 */
export function testRecipeStructuredData() {
  console.log('Testing Recipe Structured Data...');

  try {
    const structuredData = generateRecipeStructuredData(testRecipe, testHearts);

    console.log('Generated Recipe Structured Data:');
    console.log(JSON.stringify(structuredData, null, 2));

    // Basic validation
    const validationErrors: string[] = [];

    if (!structuredData['@context']) validationErrors.push('Missing @context');
    if (!structuredData['@type']) validationErrors.push('Missing @type');
    if (!structuredData.name) validationErrors.push('Missing name');
    if (!structuredData.author) validationErrors.push('Missing author');
    if (!structuredData.recipeIngredient?.length) validationErrors.push('Missing ingredients');
    if (!structuredData.recipeInstructions?.length) validationErrors.push('Missing instructions');

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return false;
    }

    console.log('✅ Recipe structured data validation passed!');
    return true;
  } catch (error) {
    console.error('Error generating recipe structured data:', error);
    return false;
  }
}

/**
 * Test function to validate profile structured data
 */
export function testProfileStructuredData() {
  console.log('Testing Profile Structured Data...');

  try {
    const structuredData = generatePersonStructuredData(testProfile, 25);

    console.log('Generated Profile Structured Data:');
    console.log(JSON.stringify(structuredData, null, 2));

    // Basic validation
    const validationErrors: string[] = [];

    if (!structuredData['@context']) validationErrors.push('Missing @context');
    if (!structuredData['@type']) validationErrors.push('Missing @type');
    if (!(structuredData as any).name) validationErrors.push('Missing name');
    if (!(structuredData as any).url) validationErrors.push('Missing url');

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return false;
    }

    console.log('✅ Profile structured data validation passed!');
    return true;
  } catch (error) {
    console.error('Error generating profile structured data:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export function runAllSEOTests() {
  console.log('=== Running SEO Structured Data Tests ===\n');

  const recipeTest = testRecipeStructuredData();
  console.log('');
  const profileTest = testProfileStructuredData();

  console.log('\n=== Test Results ===');
  console.log(`Recipe Test: ${recipeTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Profile Test: ${profileTest ? '✅ PASSED' : '❌ FAILED'}`);

  if (recipeTest && profileTest) {
    console.log('\n🎉 All SEO tests passed!');
    console.log('\nNext steps:');
    console.log(
      '1. Test with Google Rich Results Test: https://search.google.com/test/rich-results'
    );
    console.log('2. Test with Schema.org validator: https://validator.schema.org/');
    console.log('3. Monitor search console for rich snippets appearance');
  } else {
    console.log('\n❌ Some tests failed. Please check the validation errors above.');
  }

  return recipeTest && profileTest;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllSEOTests();
}
