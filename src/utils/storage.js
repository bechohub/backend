const crypto = require('crypto');
const sharp = require('sharp');
const { supabase } = require('../config/supabase');
const env = require('../config/env');

const stripDataPrefix = (value) => value.replace(/^data:image\/\w+;base64,/, '');

const uploadProductImage = async ({ sellerId, productId, image, sortOrder = 0 }) => {
  const buffer = Buffer.from(stripDataPrefix(image.base64), 'base64');
  const optimizedBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const storagePath = `products/${sellerId}/${productId}/${sortOrder}-${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: false,
      cacheControl: '31536000',
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = env.SUPABASE_STORAGE_PUBLIC
    ? supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath)
    : await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).createSignedUrl(storagePath, 60 * 60 * 24 * 365);

  return {
    imageUrl: env.SUPABASE_STORAGE_PUBLIC ? data.publicUrl : data.signedUrl,
    storagePath,
  };
};

const removeProductImage = async (storagePath) => {
  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([storagePath]);
  if (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

module.exports = { uploadProductImage, removeProductImage };