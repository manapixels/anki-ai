import { Recipe } from '@/types/recipe';
import { Profile } from '@/types/profile';
import { getRecipeImageURL, getAvatarURL } from '@/utils/url';

export interface RecipeHearts {
  total_hearts: number;
}

export interface RecipeStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Recipe';
  name: string;
  image?: string[];
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  datePublished?: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  keywords?: string;
  recipeYield?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  nutrition?: {
    '@type': 'NutritionInformation';
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
    fiberContent?: string;
    sugarContent?: string;
    sodiumContent?: string;
    servingSize?: string;
  };
  recipeIngredient?: string[];
  recipeInstructions?: Array<{
    '@type': 'HowToStep';
    text: string;
    name?: string;
    url?: string;
  }>;
}

/**
 * Generates Schema.org structured data for a recipe
 */
export function generateRecipeStructuredData(
  recipe: Recipe & { author: Profile },
  hearts?: RecipeHearts,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
): RecipeStructuredData {
  const structuredData: RecipeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    author: {
      '@type': 'Person',
      name: recipe.author?.name || recipe.author?.username || 'Unknown Author',
      url: recipe.author?.username ? `${baseUrl}/profiles/${recipe.author.username}` : undefined,
    },
    datePublished: recipe.created_at,
    description: recipe.description || undefined,
    keywords: [recipe.category, recipe.subcategory].filter(Boolean).join(', '),
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeCategory: recipe.category || undefined,
  };

  // Add images if available
  const imageUrl = getRecipeImageURL(recipe.image_url, 'image', recipe.updated_at);
  if (imageUrl) {
    structuredData.image = [imageUrl];
  }

  // Add timing information
  if (recipe.total_time && recipe.total_time > 0) {
    structuredData.totalTime = `PT${recipe.total_time}M`; // ISO 8601 duration format
  }

  // Add hearts as popularity indicator (using a simple rating system)
  if (hearts && hearts.total_hearts > 0) {
    // Convert hearts to a rating-like system for SEO
    const ratingValue = Math.min(5, Math.max(1, Math.ceil(hearts.total_hearts / 10))); // 1-5 scale based on hearts
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: hearts.total_hearts,
    };
  }

  // Add nutrition information if available
  if (recipe.nutrition_info) {
    const nutrition = recipe.nutrition_info;
    structuredData.nutrition = {
      '@type': 'NutritionInformation',
      servingSize: recipe.servings ? `1 serving (of ${recipe.servings})` : undefined,
    };

    // Add nutrition values if they exist (handle NutrientValue objects)
    if (nutrition.calories) {
      const caloriesValue =
        typeof nutrition.calories === 'object' ? nutrition.calories.value : nutrition.calories;
      structuredData.nutrition.calories = `${caloriesValue} calories`;
    }
    if (nutrition.proteinContent) {
      const proteinValue =
        typeof nutrition.proteinContent === 'object'
          ? nutrition.proteinContent.value
          : nutrition.proteinContent;
      structuredData.nutrition.proteinContent = `${proteinValue}g`;
    }
    if (nutrition.carbohydrateContent) {
      const carbValue =
        typeof nutrition.carbohydrateContent === 'object'
          ? nutrition.carbohydrateContent.value
          : nutrition.carbohydrateContent;
      structuredData.nutrition.carbohydrateContent = `${carbValue}g`;
    }
    if (nutrition.fatContent) {
      const fatValue =
        typeof nutrition.fatContent === 'object'
          ? nutrition.fatContent.value
          : nutrition.fatContent;
      structuredData.nutrition.fatContent = `${fatValue}g`;
    }
    if (nutrition.fiberContent) {
      const fiberValue =
        typeof nutrition.fiberContent === 'object'
          ? nutrition.fiberContent.value
          : nutrition.fiberContent;
      structuredData.nutrition.fiberContent = `${fiberValue}g`;
    }
    if (nutrition.sugarContent) {
      const sugarValue =
        typeof nutrition.sugarContent === 'object'
          ? nutrition.sugarContent.value
          : nutrition.sugarContent;
      structuredData.nutrition.sugarContent = `${sugarValue}g`;
    }
    if (nutrition.sodiumContent) {
      const sodiumValue =
        typeof nutrition.sodiumContent === 'object'
          ? nutrition.sodiumContent.value
          : nutrition.sodiumContent;
      structuredData.nutrition.sodiumContent = `${sodiumValue}mg`;
    }
  }

  // Add ingredients
  if (recipe.components && recipe.components.length > 0) {
    structuredData.recipeIngredient = [];

    recipe.components.forEach(component => {
      if (
        component &&
        typeof component === 'object' &&
        'ingredients' in component &&
        component.ingredients
      ) {
        const ingredients = component.ingredients;
        if (Array.isArray(ingredients)) {
          ingredients.forEach(ingredient => {
            if (ingredient && typeof ingredient === 'object' && !Array.isArray(ingredient)) {
              const ingredientObj = ingredient as any;
              const ingredientString = [
                ingredientObj.amount,
                ingredientObj.unit,
                ingredientObj.name,
              ]
                .filter(Boolean)
                .join(' ');

              structuredData.recipeIngredient!.push(ingredientString);
            }
          });
        }
      }
    });
  }

  // Add instructions
  if (recipe.instructions && recipe.instructions.length > 0) {
    structuredData.recipeInstructions = recipe.instructions.map((instruction, index) => ({
      '@type': 'HowToStep',
      text: typeof instruction === 'object' ? instruction.content : instruction,
      name: `Step ${index + 1}`,
    }));
  }

  return structuredData;
}

/**
 * Generates Schema.org structured data for a person/profile
 */
export function generatePersonStructuredData(
  profile: Profile,
  recipesCreated?: number,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
): object {
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: `${baseUrl}/profiles/${profile.username}`,
    identifier: profile.username,
  };

  // Add profile image if available
  const avatarUrl = getAvatarURL(profile.avatar_url);
  if (avatarUrl) {
    structuredData.image = avatarUrl;
  }

  // Add additional context if they're a content creator
  if (recipesCreated && recipesCreated > 0) {
    structuredData.jobTitle = 'Recipe Creator';
    structuredData.knowsAbout = ['Cooking', 'Recipe Development', 'Food'];
  }

  return structuredData;
}

/**
 * Generates a JSON-LD script tag for structured data
 */
export function generateStructuredDataScript(data: object): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
