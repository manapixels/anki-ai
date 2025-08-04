const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const seedData = require('./seed-recipes.json');
require('dotenv').config({ path: '.env.prod' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for uploads
const supabase = createClient(supabaseUrl, supabaseKey);

const pathToRecipeImages = 'public/recipes';
const pathToUserImages = 'public/users';

async function uploadImage(bucket, filePath, forceOverride = true) {
  const fileName = path.basename(filePath);

  // Check if local file exists
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Local file not found, skipping:', filePath);
    return;
  }

  const fileContent = fs.readFileSync(filePath);

  // Check if file exists in storage
  const { data: existingFile } = await supabase.storage.from(bucket).list('', {
    search: fileName,
  });

  const fileExists = existingFile && existingFile.length > 0;

  if (fileExists && !forceOverride) {
    console.log('File already exists in storage, skipping:', fileName);
    return;
  }

  // Determine MIME type based on file extension
  const fileExtension = path.extname(fileName).toLowerCase();
  let contentType = 'application/octet-stream'; // default

  if (fileExtension === '.png') {
    contentType = 'image/png';
  } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (fileExtension === '.webp') {
    contentType = 'image/webp';
  } else if (fileExtension === '.svg') {
    contentType = 'image/svg+xml';
  }

  const { data, error } = await supabase.storage.from(bucket).upload(`${fileName}`, fileContent, {
    cacheControl: '3600',
    upsert: true, // This enables overriding existing files
    contentType: contentType,
  });

  if (error) {
    console.error('Upload error for', fileName, ':', error.message);
    return;
  }

  if (fileExists) {
    console.log('✅ Overridden existing file:', fileName);
  } else {
    console.log('✅ Uploaded new file:', fileName);
  }
}

// Generate images list from JSON data
const imagesToUpload = [];

// Add user avatar
imagesToUpload.push({
  bucket: 'avatars',
  filePath: `${pathToUserImages}/${seedData.user.avatar_url}`,
});

// Add recipe images from JSON
seedData.recipes.forEach(recipe => {
  // Add single recipe image
  imagesToUpload.push({
    bucket: 'recipe_images',
    filePath: `${pathToRecipeImages}/${recipe.image_url}`,
  });
});

async function uploadAllImages() {
  for (const { bucket, filePath } of imagesToUpload) {
    await uploadImage(bucket, filePath);
  }
}

uploadAllImages().catch(console.error);
