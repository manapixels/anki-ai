import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { fetchUserProfileWithRecipes } from '@/api/profile';
import { getMultipleRecipeHeartStats, getUserHeartsForRecipes } from '@/api/recipe';
import { RecipeHeartStats } from '@/types/hearts';
import { ProfileWithRecipes } from '@/types/profile';
import { Recipe } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';
import { createClient } from '@/utils/supabase/server';
import { generatePersonStructuredData } from '@/utils/seo';
import { StructuredData } from '@/_components/seo/StructuredData';
import RecipeListItemInProfile from './_components/RecipeListItemInProfile';
import ProfileTabs from './_components/ProfileTabs';

export async function generateMetadata({
  params: { username },
}: {
  params: { username: string };
}): Promise<Metadata> {
  try {
    const profile = (await fetchUserProfileWithRecipes({
      username,
    })) as ProfileWithRecipes;

    if (!profile) {
      return {
        title: 'Profile Not Found',
      };
    }

    const imageUrl = profile.avatar_url ? `${BUCKET_URL}/avatars/${profile.avatar_url}` : undefined;

    const recipesCount = (profile.recipes_created as Recipe[])?.length || 0;

    return {
      title: `${profile.name} (@${profile.username}) | Recipe App`,
      description:
        profile.bio || `${profile.name} has shared ${recipesCount} recipes on Recipe App`,
      openGraph: {
        title: profile.name,
        description: profile.bio || `${profile.name} has shared ${recipesCount} recipes`,
        type: 'profile',
        username: profile.username,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
      twitter: {
        card: 'summary',
        title: profile.name,
        description: profile.bio || `${profile.name} has shared ${recipesCount} recipes`,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Profile | Recipe App',
    };
  }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const { data: authUser } = await supabase.auth.getUser();
  const profile = (await fetchUserProfileWithRecipes({
    username: params.username,
  })) as ProfileWithRecipes;

  if (!profile) {
    return <div className="text-center py-10">Profile not found.</div>;
  }

  const createdRecipes = (profile?.recipes_created as Recipe[]) || [];
  const favoritedRecipes = (profile?.favorite_recipes as Recipe[]) || [];
  const isOwnProfile = authUser?.user?.id === profile?.id;
  const bio = profile.bio || "This user hasn't set a bio yet.";

  // Fetch heart stats for all recipes
  const allRecipes = [...createdRecipes, ...favoritedRecipes];
  let heartStats: RecipeHeartStats[] = [];
  let heartedRecipeIds: Set<string> = new Set();

  if (allRecipes.length > 0) {
    const recipeIds = allRecipes.map(recipe => recipe.id);
    const heartStatsResult = await getMultipleRecipeHeartStats(recipeIds);

    if (!(heartStatsResult instanceof Error)) {
      heartStats = heartStatsResult;
    }

    // Fetch user's heart status for all recipes
    const userHeartsResult = await getUserHeartsForRecipes(recipeIds);
    if (!(userHeartsResult instanceof Error)) {
      heartedRecipeIds = userHeartsResult;
    }
  }

  // Helper function to get heart count for a recipe
  const getHeartCount = (recipeId: string): number => {
    const stats = heartStats.find(stat => stat.id === recipeId);
    return stats?.total_hearts || 0;
  };

  const createdRecipesContent = (
    <>
      {isOwnProfile && !createdRecipes.length && (
        <div className="text-center text-gray-500 py-6">
          <p>You haven&apos;t created any recipes yet.</p>
          <Link
            href="/recipes/create"
            className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-700"
          >
            Create Your First Recipe
          </Link>
        </div>
      )}
      {!isOwnProfile && !createdRecipes.length && (
        <div className="text-center text-gray-500 py-10">
          <p>{`${profile.name || 'This user'} hasn't`} created any recipes yet.</p>
        </div>
      )}
      {createdRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {createdRecipes.map(recipe => (
            <RecipeListItemInProfile
              recipe={recipe}
              key={recipe.id}
              hearts={getHeartCount(recipe.id)}
              initialIsHearted={heartedRecipeIds.has(recipe.id)}
            />
          ))}
        </div>
      )}
    </>
  );

  const favoritedRecipesContent = (
    <>
      {isOwnProfile && !favoritedRecipes.length && (
        <div className="text-center text-gray-500 py-6">
          <p>You haven&apos;t favorited any recipes yet.</p>
          <Link
            href="/recipes"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
          >
            Discover Recipes
          </Link>
        </div>
      )}
      {!isOwnProfile && !favoritedRecipes.length && (
        <div className="text-center text-gray-500 py-10">
          <p>{`${profile.name || 'This user'} hasn't`} favorited any recipes yet.</p>
        </div>
      )}
      {favoritedRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritedRecipes.map(recipe => (
            <RecipeListItemInProfile
              recipe={recipe}
              key={recipe.id}
              hearts={getHeartCount(recipe.id)}
              initialIsHearted={heartedRecipeIds.has(recipe.id)}
            />
          ))}
        </div>
      )}
    </>
  );

  // Generate structured data for SEO
  const structuredData = generatePersonStructuredData(profile, createdRecipes.length);

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData data={structuredData} id="profile-structured-data" />

      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-12">
          <Image
            src={
              profile.avatar_url
                ? `${BUCKET_URL}/avatars/${profile.avatar_url}`
                : '/users/placeholder-avatar.svg'
            }
            alt={`${profile.name || profile.username}'s avatar`}
            width={150}
            height={150}
            className="rounded-full object-cover flex-shrink-0 shadow-md"
          />
          <div className="text-center md:text-left flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-center mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.name || profile.username}
                </h1>
                <p className="text-md text-gray-500 dark:text-gray-400">@{profile.username}</p>
              </div>
              {isOwnProfile && (
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2 items-center">
                  <Link
                    href="/account/settings"
                    className="text-sm text-indigo-600 hover:text-indigo-500 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-700"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/recipes/manage"
                    className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg px-3 py-1.5 transition-colors duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-700"
                  >
                    Manage My Recipes
                  </Link>
                </div>
              )}
            </div>
            <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm md:text-base">{bio}</p>
          </div>
        </div>

        <ProfileTabs
          createdRecipesContent={createdRecipesContent}
          favoritedRecipesContent={favoritedRecipesContent}
        />
      </div>
    </>
  );
}
