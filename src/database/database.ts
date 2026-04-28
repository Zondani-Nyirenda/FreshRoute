import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('freshroute.db');

export const initDatabase = async (): Promise<void> => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      area_zone TEXT,
      pin TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      area_zone TEXT NOT NULL,
      address_description TEXT,
      pin TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit_description TEXT,
      price REAL NOT NULL,
      is_available INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      note_to_driver TEXT,
      driver_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id),
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  await seedProducts();
  await seedTestDriver();
};

// Seed default products if none exist
const seedProducts = async (): Promise<void> => {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM products'
  );
  if (result && result.count === 0) {
    await db.execAsync(`
      INSERT INTO products (name, unit_description, price) VALUES
        ('Tray of Eggs (x30)', 'per tray', 45.00),
        ('Half Tray of Eggs (x15)', 'per half tray', 23.00),
        ('White Bread Loaf', 'per loaf', 8.50),
        ('Brown Bread Loaf', 'per loaf', 9.00),
        ('Rolls (x6)', 'per pack', 12.00);
    `);
  }
};
const seedTestDriver = async (): Promise<void> => {
  const existing = await db.getFirstAsync('SELECT id FROM drivers LIMIT 1');
  if (!existing) {
    await db.runAsync(
      `INSERT INTO drivers (name, phone_number, area_zone, pin) VALUES (?, ?, ?, ?)`,
      ['Test Driver', '0950000001', 'Woodlands', '1234']
    );
  }
};

export default db;