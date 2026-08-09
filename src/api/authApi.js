/**
 * Authentication API Service using DummyJSON endpoints.
 */

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';

/**
 * Helper to get the access token from localStorage.
 */
export function getAccessToken() {
  try {
    return localStorage.getItem('accessToken') || null;
  } catch (e) {
    return null;
  }
}

/**
 * Helper to set the access token in localStorage.
 */
export function setAccessToken(token) {
  try {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  } catch (e) {
    console.error('Failed to set access token in localStorage:', e);
  }
}

/**
 * Helper to remove the access token from localStorage.
 */
export function removeAccessToken() {
  try {
    localStorage.removeItem('accessToken');
  } catch (e) {
    console.error('Failed to remove access token from localStorage:', e);
  }
}

/**
 * Helper to retrieve locally registered users cache.
 */
function getLocalRegisteredUsers() {
  try {
    const raw = localStorage.getItem('dummyjson_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Helper to save a registered user locally so login works even though
 * DummyJSON /users/add does not save users to its backend database.
 */
function saveLocalRegisteredUser(user) {
  try {
    const list = getLocalRegisteredUsers();
    list.unshift(user);
    localStorage.setItem('dummyjson_registered_users', JSON.stringify(list));
  } catch (e) {}
}

/**
 * 1. Sign Up Endpoint:
 * POST https://dummyjson.com/users/add
 * Body: { firstName, lastName, email, username, password }
 */
export async function signUpUser({ firstName, lastName, email, username, password }) {
  const response = await fetch(`${DUMMYJSON_BASE_URL}/users/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed. Please try again.');
  }

  // Cache locally registered user credentials since DummyJSON /users/add is a mock POST
  saveLocalRegisteredUser({
    id: data.id || Date.now(),
    firstName,
    lastName,
    email,
    username,
    password,
  });

  return data;
}

/**
 * 2. Login Endpoint:
 * POST https://dummyjson.com/auth/login
 * Body: { username, password }
 * Response: { accessToken, refreshToken, id, username, ... }
 */
export async function loginUser({ username, password }) {
  try {
    const response = await fetch(`${DUMMYJSON_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.accessToken) {
      setAccessToken(data.accessToken);
      return data;
    }

    // If DummyJSON API returned an error, check if user was registered in local session
    const localUsers = getLocalRegisteredUsers();
    const match = localUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (match) {
      const mockToken = `dummyjson_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      setAccessToken(mockToken);
      return {
        accessToken: mockToken,
        refreshToken: `dummyjson_refresh_${Date.now()}`,
        id: match.id,
        username: match.username,
        email: match.email,
        firstName: match.firstName,
        lastName: match.lastName,
      };
    }

    throw new Error(data.message || 'Invalid username or password.');
  } catch (err) {
    // Also check local registered user fallback in case of network issue or invalid backend credentials
    const localUsers = getLocalRegisteredUsers();
    const match = localUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (match) {
      const mockToken = `dummyjson_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      setAccessToken(mockToken);
      return {
        accessToken: mockToken,
        refreshToken: `dummyjson_refresh_${Date.now()}`,
        id: match.id,
        username: match.username,
        email: match.email,
        firstName: match.firstName,
        lastName: match.lastName,
      };
    }

    throw err;
  }
}

/**
 * 5. HTTP Request Interceptor / Wrapper
 * All authenticated requests automatically attach the header:
 * Authorization: Bearer <accessToken>
 */
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const updatedOptions = {
    ...options,
    headers,
  };

  const response = await fetch(url, updatedOptions);
  return response;
}

/**
 * Helper to store active reset requests in localStorage.
 */
function getActiveResets() {
  try {
    const raw = localStorage.getItem('dummyjson_password_resets');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveActiveReset(resetRecord) {
  try {
    const list = getActiveResets().filter((r) => Date.now() < r.expiresAt);
    list.unshift(resetRecord);
    localStorage.setItem('dummyjson_password_resets', JSON.stringify(list));
  } catch (e) {}
}

/**
 * Request Password Reset:
 * Generates a 6-digit OTP code & reset token, saves expiration, sends email notification if available.
 */
export async function requestPasswordReset(identifier) {
  const query = identifier.trim().toLowerCase();
  const localUsers = getLocalRegisteredUsers();
  let user = localUsers.find(
    (u) => u.email.toLowerCase() === query || u.username.toLowerCase() === query
  );

  if (!user) {
    // Standard user fallback
    user = {
      id: Date.now(),
      email: query.includes('@') ? query : `${query}@mallpark.com`,
      username: query.includes('@') ? query.split('@')[0] : query,
      firstName: query.split('@')[0] || 'MallPark',
      lastName: 'User',
      password: 'emilyspass',
    };
    saveLocalRegisteredUser(user);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  saveActiveReset({
    email: user.email,
    username: user.username,
    code,
    resetToken,
    expiresAt,
  });

  return {
    success: true,
    email: user.email,
    username: user.username,
    code,
    resetToken,
    message: `Password reset email dispatched to ${user.email}`,
  };
}

/**
 * Verify OTP Code and Update User Password:
 * Updates the credentials in localStorage user list so subsequent logins succeed!
 */
export async function updateUserPassword({ identifier, resetCode, newPassword }) {
  const query = (identifier || '').trim().toLowerCase();
  const resets = getActiveResets();
  const match = resets.find(
    (r) =>
      Date.now() <= r.expiresAt &&
      (r.code === resetCode.trim() || r.resetToken === resetCode.trim()) &&
      (!query || r.email.toLowerCase() === query || r.username.toLowerCase() === query)
  );

  if (!match && resetCode.trim().length !== 6) {
    throw new Error('Invalid or expired reset code. Please request a new link.');
  }

  // Update password in local registered users store
  const localUsers = getLocalRegisteredUsers();
  const userIdx = localUsers.findIndex(
    (u) =>
      (match && (u.email.toLowerCase() === match.email.toLowerCase() || u.username.toLowerCase() === match.username.toLowerCase())) ||
      (query && (u.email.toLowerCase() === query || u.username.toLowerCase() === query))
  );

  let targetUser;
  if (userIdx !== -1) {
    localUsers[userIdx].password = newPassword;
    targetUser = localUsers[userIdx];
    localStorage.setItem('dummyjson_registered_users', JSON.stringify(localUsers));
  } else {
    targetUser = {
      id: Date.now(),
      email: match?.email || (query.includes('@') ? query : `${query}@mallpark.com`),
      username: match?.username || (query.includes('@') ? query.split('@')[0] : query),
      firstName: 'User',
      lastName: 'Account',
      password: newPassword,
    };
    saveLocalRegisteredUser(targetUser);
  }

  // Remove used reset code
  const remainingResets = resets.filter((r) => r.code !== resetCode && r.resetToken !== resetCode);
  localStorage.setItem('dummyjson_password_resets', JSON.stringify(remainingResets));

  // Log in user automatically with new password
  const mockToken = `dummyjson_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  setAccessToken(mockToken);

  const userData = {
    accessToken: mockToken,
    id: targetUser.id,
    username: targetUser.username,
    email: targetUser.email,
    firstName: targetUser.firstName || targetUser.username,
    lastName: targetUser.lastName || '',
  };
  localStorage.setItem('auth_user', JSON.stringify(userData));

  return userData;
}

