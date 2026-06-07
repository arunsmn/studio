import { openDB, type IDBPDatabase } from "idb";
import type { Expense } from "./types";

const DB_NAME = "hisaab-db";
const DB_VERSION = 1;
const STORE_NAME = "expenses";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-date", "date");
        store.createIndex("by-category", "category");
      },
    });
  }
  return dbPromise;
}

export async function addExpense(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, expense);
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllExpenses(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) =>
    (b as Expense).createdAt.localeCompare((a as Expense).createdAt),
  );
}
