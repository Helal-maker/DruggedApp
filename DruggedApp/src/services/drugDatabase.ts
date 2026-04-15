import { Platform } from 'react-native';
import { documentDirectory, getInfoAsync, copyAsync } from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

export interface Drug {
  id: number;
  trade_name: string;
  active_ingredient: string;
  price: number;
  price_old: number | null;
  manufacturer: string | null;
  distributor: string | null;
  category: string | null;
  subcategory: string | null;
  subcategory2: string | null;
  route: string | null;
  search_index: string | null;
}

export type SearchField =
  | 'all'
  | 'trade_name'
  | 'active_ingredient'
  | 'category'
  | 'subcategory'
  | 'manufacturer'
  | 'distributor'
  | 'route';

const DB_NAME = 'drugged.db';
let db: SQLite.SQLiteDatabase | null = null;

const dbAsset = require('../assets/drugged.db');

async function loadAssetAsUint8Array(): Promise<Uint8Array> {
  const asset = Asset.fromModule(dbAsset);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error('Failed to download drugged.db asset');
  }
  const response = await fetch(asset.localUri);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function getNativeDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  console.log('[DB] Opening database on:', Platform.OS);

  if (Platform.OS === 'web') {
    const serializedData = await loadAssetAsUint8Array();
    db = await SQLite.deserializeDatabaseAsync(serializedData);
    console.log('[DB] Web database opened with serialized data');
    return db;
  }

  if (!documentDirectory) {
    throw new Error('documentDirectory is null');
  }

  const destPath = documentDirectory + DB_NAME;
  const destInfo = await getInfoAsync(destPath);
  if (!destInfo.exists) {
    const asset = Asset.fromModule(dbAsset);
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error('Failed to load drugged.db asset');
    await copyAsync({ from: asset.localUri, to: destPath });
  }
  const absPath = destPath.startsWith('file://') ? destPath.slice(7) : destPath;
  db = await SQLite.openDatabaseAsync(absPath);
  console.log('[DB] Native database opened successfully');
  return db;
}

export async function initDatabase(): Promise<void> {
  await getNativeDb();
}

export async function searchDrugs(
  query: string,
  field: SearchField = 'all'
): Promise<Drug[]> {
  const q = query.trim();
  if (!q) return [];

  console.log('[DEBUG] Platform.OS:', Platform.OS, '| field:', field, '| query:', q);

  const database = await getNativeDb();
  const pattern = `%${q}%`;
  const startPattern = `${q}%`;

  let querySQL: string;
  let params: string[];

  if (field === 'all') {
    querySQL = `
      SELECT * FROM drugs
      WHERE trade_name LIKE ? COLLATE NOCASE
         OR active_ingredient LIKE ? COLLATE NOCASE
         OR category LIKE ? COLLATE NOCASE
         OR manufacturer LIKE ? COLLATE NOCASE
         OR search_index LIKE ? COLLATE NOCASE
      ORDER BY
        CASE WHEN trade_name LIKE ? THEN 0
             WHEN active_ingredient LIKE ? THEN 1
             ELSE 2 END,
        trade_name
      LIMIT 50
    `;
    params = [pattern, pattern, pattern, pattern, pattern, startPattern, startPattern];
  } else {
    querySQL = `
      SELECT * FROM drugs
      WHERE ${field} LIKE ? COLLATE NOCASE
      ORDER BY
        CASE WHEN ${field} LIKE ? THEN 0 ELSE 1 END,
        trade_name
      LIMIT 50
    `;
    params = [pattern, startPattern];
  }

  console.log('[DB] Executing query');
  
  const results = await database.getAllAsync<Drug>(querySQL, params);
  console.log('[DB] Results:', results.length);
  
  return results;
}

export async function getDrugById(id: number): Promise<Drug | null> {
  const db = await getNativeDb();
  return db.getFirstAsync<Drug>('SELECT * FROM drugs WHERE id = ?', [id]);
}

export async function getDrugsByActiveIngredient(ingredient: string): Promise<Drug[]> {
  const db = await getNativeDb();
  return db.getAllAsync<Drug>(
    'SELECT * FROM drugs WHERE active_ingredient = ? ORDER BY price ASC',
    [ingredient]
  );
}

export async function getAlternativeDrugs(drugId: number): Promise<Drug[]> {
  const db = await getNativeDb();
  const source = await db.getFirstAsync<{ active_ingredient: string }>(
    'SELECT active_ingredient FROM drugs WHERE id = ?', [drugId]
  );
  if (!source?.active_ingredient) return [];

  return db.getAllAsync<Drug>(
    `SELECT * FROM drugs
     WHERE active_ingredient = ? AND id != ?
     ORDER BY price ASC`,
    [source.active_ingredient, drugId]
  );
}

export async function getDrugsByCategory(category: string, limit = 50): Promise<Drug[]> {
  const db = await getNativeDb();
  return db.getAllAsync<Drug>(
    'SELECT * FROM drugs WHERE category = ? ORDER BY trade_name LIMIT ?',
    [category, limit]
  );
}

export async function getCategories(): Promise<{ category: string; count: number }[]> {
  const db = await getNativeDb();
  return db.getAllAsync<{ category: string; count: number }>(
    `SELECT category, COUNT(*) as count FROM drugs
     WHERE category IS NOT NULL
     GROUP BY category
     ORDER BY count DESC`
  );
}

export async function getPriceDrops(limit = 20): Promise<Drug[]> {
  const db = await getNativeDb();
  return db.getAllAsync<Drug>(
    `SELECT * FROM drugs
     WHERE price_old IS NOT NULL AND price_old > price
     ORDER BY (price_old - price) DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getDrugCount(): Promise<number> {
  try {
    const db = await getNativeDb();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM drugs');
    console.log('[DB] Drug count:', result?.count);
    return result?.count ?? 0;
  } catch (error) {
    console.error('[DB] getDrugCount error:', error);
    return 0;
  }
}