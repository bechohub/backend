-- Create the search vector column and keep it updated through a trigger.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'english',
    coalesce(NEW.product_name, '') || ' ' || coalesce(NEW.location, '') || ' ' || coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_search_vector_update ON products;

CREATE TRIGGER trg_products_search_vector_update
BEFORE INSERT OR UPDATE OF product_name, location, description
ON products
FOR EACH ROW
EXECUTE FUNCTION products_search_vector_update();

UPDATE products
SET search_vector = to_tsvector(
  'english',
  coalesce(product_name, '') || ' ' || coalesce(location, '') || ' ' || coalesce(description, '')
);

CREATE INDEX IF NOT EXISTS idx_products_search_vector
ON products
USING GIN (search_vector);