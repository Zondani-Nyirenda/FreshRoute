import db from './database';

export type Shop = {
  id: number;
  shop_name: string;
  owner_name: string;
  phone_number: string;
  area_zone: string;
  address_description: string;
  pin: string;
  created_at: string;
};

export const createShop = async (
  shop_name: string,
  owner_name: string,
  phone_number: string,
  area_zone: string,
  address_description: string,
  pin: string
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO shops (shop_name, owner_name, phone_number, area_zone, address_description, pin)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [shop_name, owner_name, phone_number, area_zone, address_description, pin]
  );
  return result.lastInsertRowId;
};

export const getShopByPhone = async (phone_number: string): Promise<Shop | null> => {
  return await db.getFirstAsync<Shop>(
    'SELECT * FROM shops WHERE phone_number = ?',
    [phone_number]
  );
};

export const getShopById = async (id: number): Promise<Shop | null> => {
  return await db.getFirstAsync<Shop>('SELECT * FROM shops WHERE id = ?', [id]);
};

export const getAllShops = async (): Promise<Shop[]> => {
  return await db.getAllAsync<Shop>('SELECT * FROM shops ORDER BY shop_name ASC');
};

export const updateShop = async (
  id: number,
  shop_name: string,
  owner_name: string,
  area_zone: string,
  address_description: string
): Promise<void> => {
  await db.runAsync(
    `UPDATE shops SET shop_name=?, owner_name=?, area_zone=?, address_description=? WHERE id=?`,
    [shop_name, owner_name, area_zone, address_description, id]
  );
};