const crypto = require('crypto');
const sharp = require('sharp');
const { supabase } = require('../config/supabase');
const env = require('../config/env');

const stripDataPrefix = (value) => value.replace(/^data:image\/\w+;base64,/, '');

const uploadProductImage = async ({ sellerId, productId, image, sortOrder = 0 }) => {
  const buffer = Buffer.from(stripDataPrefix(image.base64), 'base64');
  const uuid = crypto.randomUUID();

  const variants = [
    { name: 'thumbnail', width: 200, height: 200 },
    { name: 'mobile', width: 800, height: 800 },
    { name: 'desktop', width: 1200, height: 1200 },
  ];

  const results = {};

  const uploadPromises = variants.map(async (variant) => {
    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: variant.width, height: variant.height, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const storagePath = `products/${sellerId}/${productId}/${sortOrder}-${variant.name}-${uuid}.webp`;
    const { error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false,
        cacheControl: '31536000',
      });

    if (error) {
      throw new Error(`Image upload failed for ${variant.name}: ${error.message}`);
    }

    const { data } = env.SUPABASE_STORAGE_PUBLIC
      ? supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath)
      : await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    results[`${variant.name}Url`] = env.SUPABASE_STORAGE_PUBLIC ? data.publicUrl : data.signedUrl;
    results[`${variant.name}Path`] = storagePath;
  });

  await Promise.all(uploadPromises);

  return {
    imageUrl: results.desktopUrl,
    storagePath: results.desktopPath,
    thumbnailUrl: results.thumbnailUrl,
    thumbnailPath: results.thumbnailPath,
    mobileUrl: results.mobileUrl,
    mobilePath: results.mobilePath,
    desktopUrl: results.desktopUrl,
    desktopPath: results.desktopPath,
  };
};

const removeProductImage = async (storagePaths) => {
  if (!storagePaths) {
    return;
  }

  const paths = Array.isArray(storagePaths) ? storagePaths : [storagePaths];
  const validPaths = paths.filter(Boolean);

  if (validPaths.length === 0) return;

  const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).remove(validPaths);
  if (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

module.exports = { uploadProductImage, removeProductImage };