/**
 * Simple in-memory balance store for users
 */

interface UserBalance {
  userId: string;
  username: string;
  balance: number;
  lastStolenBy?: string;
  cooldownSteal?: number;
  protectedUntil?: number; // Add this new field
}

// In-memory database that will reset on app restart
const balances: UserBalance[] = [];

// Default starting balance for new users
const DEFAULT_STARTING_BALANCE = 1000;

/**
 * Get user balance or create new entry if not found
 */
export const getUserBalance = (
  userId: string,
  username: string
): UserBalance => {
  const existingUser = balances.find((user) => user.userId === userId);

  if (existingUser) {
    return existingUser;
  }

  // Register new user with default balance
  const newUser: UserBalance = {
    userId,
    username,
    balance: DEFAULT_STARTING_BALANCE,
  };

  balances.push(newUser);
  return newUser;
};

export const getTop10Balances = (): UserBalance[] => {
  // Sort balances in descending order and get top 10
  return [...balances].sort((a, b) => b.balance - a.balance).slice(0, 10);
};

/**
 * Update user balance
 */
export const updateUserBalance = (userId: string, newBalance: number): void => {
  const userIndex = balances.findIndex((user) => user.userId === userId);

  if (userIndex !== -1) {
    balances[userIndex]!.balance = newBalance;
  }
};

/**
 * Set the last stolen by property for a user
 */
export const setLastStolenBy = (userId: string, thiefId: string): void => {
  const userIndex = balances.findIndex((user) => user.userId === userId);

  if (userIndex !== -1) {
    balances[userIndex]!.lastStolenBy = thiefId;
  }
};

/**
 * Set cooldown for a user's steal attempt
 */
export const setStealCooldown = (userId: string, timestamp: number): void => {
  const userIndex = balances.findIndex((user) => user.userId === userId);

  if (userIndex !== -1) {
    balances[userIndex]!.cooldownSteal = timestamp;
  }
};

/**
 * Set protection for a user after being stolen from
 */
export const setProtection = (userId: string, timestamp: number): void => {
  const userIndex = balances.findIndex((user) => user.userId === userId);

  if (userIndex !== -1) {
    balances[userIndex]!.protectedUntil = timestamp;
  }
};

/**
 * Check if a user is currently protected
 */
export const isProtected = (userId: string): boolean => {
  const user = balances.find((u) => u.userId === userId);
  if (!user?.protectedUntil) return false;
  return Date.now() < user.protectedUntil;
};

/**
 * Get all balances (for debugging)
 */
export const getAllBalances = (): UserBalance[] => {
  return [...balances];
};
