'use client';

interface StoredUser {
  email: string;
  password: string;
  createdAt: number;
}

const USERS_KEY = 'traders-diary-users';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readUsers(): StoredUser[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
      return [];
    }

    const parsed = JSON.parse(storedUsers) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(email: string, password: string) {
  const users = readUsers();
  const normalizedEmail = normalizeEmail(email);
  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return {
      ok: false as const,
      message: 'An account with this email already exists.',
    };
  }

  const nextUsers = [
    ...users,
    {
      email: normalizedEmail,
      password,
      createdAt: Date.now(),
    },
  ];

  writeUsers(nextUsers);

  return {
    ok: true as const,
  };
}

export function validateUserCredentials(email: string, password: string) {
  const users = readUsers();
  const normalizedEmail = normalizeEmail(email);
  const user = users.find((storedUser) => storedUser.email === normalizedEmail);

  if (!user) {
    return {
      ok: false as const,
      message: 'No account found for this email.',
    };
  }

  if (user.password !== password) {
    return {
      ok: false as const,
      message: 'Incorrect password.',
    };
  }

  return {
    ok: true as const,
    email: user.email,
  };
}
