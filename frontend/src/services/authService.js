const API_BASE_URL = 'http://localhost:5000/api/auth';

// ==========================================
// REGISTER
// ==========================================

const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Registration failed.',
    );
  }

  return data;
};

// ==========================================
// LOGIN
// ==========================================

const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Login failed.',
    );
  }

  return data;
};

// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = async (token) => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to fetch user.',
    );
  }

  return data;
};

// ==========================================
// EXPORT
// ==========================================

export {
  register,
  login,
  getMe,
};