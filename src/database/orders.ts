import db from './database';

export type OrderStatus = 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type Order = {
  id: number;
  shop_id: number;
  status: OrderStatus;
  note_to_driver: string;
  driver_id: number | null;
  created_at: string;
  updated_at: string;
  shop_name?: string;
  owner_name?: string;
  area_zone?: string;
  phone_number?: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name?: string;
};

export const createOrder = async (
  shop_id: number,
  items: { product_id: number; quantity: number; unit_price: number }[],
  note_to_driver: string
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO orders (shop_id, note_to_driver, status) VALUES (?, ?, 'pending')`,
    [shop_id, note_to_driver]
  );
  const orderId = result.lastInsertRowId;

  for (const item of items) {
    await db.runAsync(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
      [orderId, item.product_id, item.quantity, item.unit_price]
    );
  }
  return orderId;
};

export const getOrdersByShop = async (shop_id: number): Promise<Order[]> => {
  return await db.getAllAsync<Order>(
    `SELECT * FROM orders WHERE shop_id = ? ORDER BY created_at DESC`,
    [shop_id]
  );
};

export const getAllOrdersWithShop = async (): Promise<Order[]> => {
  return await db.getAllAsync<Order>(`
    SELECT o.*, s.shop_name, s.owner_name, s.area_zone, s.phone_number
    FROM orders o
    JOIN shops s ON o.shop_id = s.id
    ORDER BY o.created_at DESC
  `);
};

export const getPendingOrders = async (): Promise<Order[]> => {
  return await db.getAllAsync<Order>(`
    SELECT o.*, s.shop_name, s.owner_name, s.area_zone, s.phone_number
    FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE o.status = 'pending'
    ORDER BY o.created_at ASC
  `);
};

export const getOrderItems = async (order_id: number): Promise<OrderItem[]> => {
  return await db.getAllAsync<OrderItem>(`
    SELECT oi.*, p.name as product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `, [order_id]);
};

export const updateOrderStatus = async (
  id: number,
  status: OrderStatus,
  driver_id?: number
): Promise<void> => {
  await db.runAsync(
    `UPDATE orders SET status = ?, driver_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, driver_id ?? null, id]
  );
};