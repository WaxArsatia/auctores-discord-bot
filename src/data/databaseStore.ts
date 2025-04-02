import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

interface UserBalance {
  userId: string;
  username: string;
  balance: number;
  lastStolenBy?: string;
  cooldownSteal?: number;
  protectedUntil?: number;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.json');
const DEFAULT_STARTING_BALANCE = 1000;

// Initialize database if it doesn't exist
const initializeDatabase = () => {
  try {
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true });
    }
    if (!existsSync(DB_PATH)) {
      writeFileSync(DB_PATH, JSON.stringify({ balances: [] }), 'utf-8');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Read database
const readDatabase = (): { balances: UserBalance[] } => {
  try {
    const data = readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read database:', error);
    return { balances: [] };
  }
};

// Write database
const writeDatabase = (data: { balances: UserBalance[] }) => {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database:', error);
  }
};

// Initialize database on module load
initializeDatabase();

export const getUserBalance = (
  userId: string,
  username: string
): UserBalance => {
  const db = readDatabase();
  let user = db.balances.find((u) => u.userId === userId);

  if (!user) {
    user = {
      userId,
      username,
      balance: DEFAULT_STARTING_BALANCE,
    };
    db.balances.push(user);
    writeDatabase(db);
  }

  // Update username if it changed
  if (user.username !== username) {
    user.username = username;
    writeDatabase(db);
  }

  return user;
};

export const updateUserBalance = (userId: string, newBalance: number): void => {
  const db = readDatabase();
  const userIndex = db.balances.findIndex((u) => u.userId === userId);
  if (userIndex !== -1) {
    db.balances[userIndex]!.balance = newBalance;
    writeDatabase(db);
  }
};

export const setLastStolenBy = (userId: string, thiefId: string): void => {
  const db = readDatabase();
  const userIndex = db.balances.findIndex((u) => u.userId === userId);
  if (userIndex !== -1) {
    db.balances[userIndex]!.lastStolenBy = thiefId;
    writeDatabase(db);
  }
};

export const setStealCooldown = (userId: string, timestamp: number): void => {
  const db = readDatabase();
  const userIndex = db.balances.findIndex((u) => u.userId === userId);
  if (userIndex !== -1) {
    db.balances[userIndex]!.cooldownSteal = timestamp;
    writeDatabase(db);
  }
};

export const setProtection = (userId: string, timestamp: number): void => {
  const db = readDatabase();
  const userIndex = db.balances.findIndex((u) => u.userId === userId);
  if (userIndex !== -1) {
    db.balances[userIndex]!.protectedUntil = timestamp;
    writeDatabase(db);
  }
};

export const isProtected = (userId: string): boolean => {
  const db = readDatabase();
  const user = db.balances.find((u) => u.userId === userId);
  if (!user?.protectedUntil) return false;
  return Date.now() < user.protectedUntil;
};

export const getTop10Balances = (): UserBalance[] => {
  const db = readDatabase();
  return [...db.balances].sort((a, b) => b.balance - a.balance).slice(0, 10);
};

export const getAllBalances = (): UserBalance[] => {
  const db = readDatabase();
  return [...db.balances];
};
