const { applySparseFieldset } = require('../src/utils/dto');
const { performance } = require('perf_hooks');

// 1. Generate Dummy Data
const generateData = (count) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: `prod_${i}`,
      sellerId: `seller_${i % 100}`,
      productName: `Product ${i}`,
      quantity: 10 + (i % 50),
      price: 100 + (i % 200),
      location: `Location ${i % 10}`,
      description: 'This is a very long description that might take up a lot of space in the payload. '.repeat(20),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seller: {
        id: `seller_${i % 100}`,
        businessName: `Business ${i % 100}`,
        displayName: `Display ${i % 100}`,
        contactEmail: `contact${i}@example.com`,
        contactPhone: `+123456789${i%10}`,
        createdAt: new Date().toISOString(),
        user: {
          id: `user_${i}`,
          email: `user${i}@example.com`,
          firstName: 'John',
          lastName: 'Doe',
          companyName: `Company ${i}`,
        }
      },
      images: [
        { id: `img1_${i}`, imageUrl: `https://example.com/img1_${i}.png`, sortOrder: 0 },
        { id: `img2_${i}`, imageUrl: `https://example.com/img2_${i}.png`, sortOrder: 1 },
      ]
    });
  }
  return data;
};

const ITEMS_COUNT = 10000;
console.log(`Generating ${ITEMS_COUNT} complex product items...`);
const mockDatabaseResult = generateData(ITEMS_COUNT);

// 2. Benchmark Full Payload
console.log('\n--- Test 1: Full Payload (No Sparse Fieldsets) ---');
const startFull = performance.now();
const fullPayloadString = JSON.stringify({ success: true, data: mockDatabaseResult });
const endFull = performance.now();

const fullTime = (endFull - startFull).toFixed(2);
const fullSizeBytes = Buffer.byteLength(fullPayloadString, 'utf8');
const fullSizeMB = (fullSizeBytes / (1024 * 1024)).toFixed(2);

console.log(`Time to serialize: ${fullTime} ms`);
console.log(`Payload Size: ${fullSizeMB} MB (${fullSizeBytes} bytes)`);

// 3. Benchmark Sparse Fieldsets Payload
console.log('\n--- Test 2: Sparse Fieldsets (?fields=id,productName,price) ---');
const fieldsToKeep = 'id,productName,price';
const startSparse = performance.now();

// Apply the utility
const optimizedData = applySparseFieldset(mockDatabaseResult, fieldsToKeep);
const sparsePayloadString = JSON.stringify({ success: true, data: optimizedData });

const endSparse = performance.now();

const sparseTime = (endSparse - startSparse).toFixed(2);
const sparseSizeBytes = Buffer.byteLength(sparsePayloadString, 'utf8');
const sparseSizeMB = (sparseSizeBytes / (1024 * 1024)).toFixed(2);

console.log(`Time to filter + serialize: ${sparseTime} ms`);
console.log(`Payload Size: ${sparseSizeMB} MB (${sparseSizeBytes} bytes)`);

// 4. Print Summary
console.log('\n--- Summary ---');
console.log(`Time Saved: ${(fullTime - sparseTime).toFixed(2)} ms`);
const sizeReducedPct = (((fullSizeBytes - sparseSizeBytes) / fullSizeBytes) * 100).toFixed(2);
console.log(`Payload Size Reduced by: ${sizeReducedPct}%`);
