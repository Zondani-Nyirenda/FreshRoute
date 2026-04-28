import db from './database';

export type Product = {
  id: number;
  name: string;
  unit_description: string;
  price: number;
  is_available: number;
};

export const getAllProducts = async (): Promise<Product[]> => {
  return await db.getAllAsync<Product>(
    'SELECT * FROM products WHERE is_available = 1 ORDER BY name ASC'
  );
};

export const updateProductAvailability = async (
  id: number,
  is_available: number
): Promise<void> => {
  await db.runAsync('UPDATE products SET is_available = ? WHERE id = ?', [is_available, id]);
};