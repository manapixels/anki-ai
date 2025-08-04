export const getURL = (path: string = '') => {
  // Check if NEXT_PUBLIC_SITE_URL is set and non-empty. Set this to your site URL in production env.
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== ''
      ? process.env.NEXT_PUBLIC_SITE_URL
      : // If not set, check for NEXT_PUBLIC_VERCEL_URL, which is automatically set by Vercel.
        process?.env?.NEXT_PUBLIC_VERCEL_URL && process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ''
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : // If neither is set, default to localhost for local development.
          'http://localhost:3000/';

  // Trim the URL and remove trailing slash if exists.
  url = url.replace(/\/+$/, '');
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Ensure path starts without a slash to avoid double slashes in the final URL.
  path = path.replace(/^\/+/, '');

  // Concatenate the URL and the path.
  return path ? `${url}/${path}` : url;
};

/**
 * Get the correct image URL for recipe images.
 * In development, serves images from /public/recipes/
 * In production, serves images from Supabase storage recipe_images bucket
 */
export const getRecipeImageURL = (
  filename: string | null | undefined,
  type: 'thumbnail' | 'banner' | 'image' = 'image',
  updatedAt?: string | null
): string | null => {
  if (!filename) return null;

  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost');

  if (isDevelopment) {
    // In development, serve from /public/recipes/
    return `/recipes/${filename}`;
  } else {
    // In production, serve from Supabase storage
    // Use consolidated 'recipe_images' bucket for all new images
    // Keep legacy support for old bucket references during transition
    const bucketName = type === 'image' ? 'recipe_images' : 'recipe_images';
    const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

    // Use updated_at timestamp for cache busting - only changes when recipe is actually updated
    let url = `${bucketUrl}/${bucketName}/${filename}`;
    if (updatedAt) {
      const timestamp = new Date(updatedAt).getTime();
      url += `?t=${timestamp}`;
    }

    return url;
  }
};

/**
 * Get the correct avatar URL for user avatars.
 * In development, serves images from /public/users/
 * In production, serves images from Supabase storage avatars bucket
 */
export const getAvatarURL = (filename: string | null | undefined): string | null => {
  if (!filename) return null;

  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost');

  if (isDevelopment) {
    // In development, serve from /public/users/
    return `/users/${filename}`;
  } else {
    // In production, serve from Supabase storage
    const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;
    return `${bucketUrl}/avatars/${filename}`;
  }
};
