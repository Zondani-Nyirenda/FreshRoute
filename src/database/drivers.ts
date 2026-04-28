import db from './database';

export type Driver = {
  id: number;
  name: string;
  phone_number: string;
  area_zone: string;
  pin: string;
  is_active: number;
  created_at: string;
};

export const createDriver = async (
  name: string,
  phone_number: string,
  area_zone: string,
  pin: string
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO drivers (name, phone_number, area_zone, pin) VALUES (?, ?, ?, ?)`,
    [name, phone_number, area_zone, pin]
  );
  return result.lastInsertRowId;
};

export const getDriverByPhone = async (phone_number: string): Promise<Driver | null> => {
  return await db.getFirstAsync<Driver>(
    'SELECT * FROM drivers WHERE phone_number = ?',
    [phone_number]
  );
};

export const getDriverById = async (id: number): Promise<Driver | null> => {
  return await db.getFirstAsync<Driver>('SELECT * FROM drivers WHERE id = ?', [id]);
};

export const getActiveDriver = async (): Promise<Driver | null> => {
  return await db.getFirstAsync<Driver>(
    'SELECT * FROM drivers WHERE is_active = 1 LIMIT 1'
  );
};