/**
 * Applies a sparse fieldset to an object or array of objects.
 * If fieldsString is provided, it returns a new object (or array of objects)
 * containing only the specified fields.
 * 
 * @param {Object|Array} data - The object or array of objects to filter.
 * @param {string} fieldsString - Comma-separated list of fields to include.
 * @returns {Object|Array} - The filtered data.
 */
const applySparseFieldset = (data, fieldsString) => {
  if (!fieldsString || typeof fieldsString !== 'string') {
    return data;
  }

  const fields = fieldsString.split(',').map((f) => f.trim()).filter(Boolean);

  if (fields.length === 0) {
    return data;
  }

  const filterObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const filtered = {};
    for (const field of fields) {
      if (obj[field] !== undefined) {
        filtered[field] = obj[field];
      }
    }
    return filtered;
  };

  if (Array.isArray(data)) {
    return data.map(filterObject);
  }

  return filterObject(data);
};

module.exports = {
  applySparseFieldset,
};
