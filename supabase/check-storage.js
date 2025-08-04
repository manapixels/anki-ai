const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.prod' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  console.log('🔍 Checking production storage...\n');

  const buckets = ['recipe_images', 'avatars'];

  for (const bucket of buckets) {
    console.log(`📁 Checking bucket: ${bucket}`);

    const { data: files, error } = await supabase.storage.from(bucket).list('', { limit: 100 });

    if (error) {
      console.error(`❌ Error listing ${bucket}:`, error.message);
    } else if (files && files.length > 0) {
      console.log(`✅ Found ${files.length} files in ${bucket}:`);
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`);
      });
    } else {
      console.log(`⚠️  No files found in ${bucket}`);
    }
    console.log('');
  }

  // Test direct URL access
  console.log('🌐 Testing direct image URLs:');
  const testUrl = `${supabaseUrl}/storage/v1/object/public/recipe_images/f0f1f2f3-f4f5-f6f7-f8f9-fafbfcfdfeff-thumbnail.png`;
  console.log(`Test URL: ${testUrl}`);

  try {
    const response = await fetch(testUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      console.log('❌ Image not accessible via direct URL');
    } else {
      console.log('✅ Image accessible via direct URL');
    }
  } catch (error) {
    console.error('Error fetching image:', error.message);
  }
}

checkStorage().catch(console.error);
