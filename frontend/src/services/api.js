/**
 * api.js - Centralized API Service
 * All frontend components should import from here to communicate with the backend.
 * Team members (Rohit, Purvas) do NOT need to write fetch logic manually.
 */

// We rely on Vite proxy (vite.config.js) to route `/api` to the backend.
const BASE_URL = '/api';

/**
 * Helper to automatically attach the JWT token to requests.
 */
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

/**
 * Helper to handle API responses and throw readable errors.
 */
async function handleResponse(response) {
    if (!response.ok) {
        let errorMsg = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorMsg;
        } catch (e) {
            errorMsg = response.statusText;
        }
        throw new Error(errorMsg);
    }
    return response.json();
}

// ==========================================
// AUTHENTICATION
// ==========================================

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 expects 'username' field
  formData.append('password', password);

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  return handleResponse(response);
}

export async function getMe() {
    const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
}

// ==========================================
// STUDENT / PUBLIC
// ==========================================

export async function getZones() {
    const response = await fetch(`${BASE_URL}/zones/`, { headers: getHeaders() });
    return handleResponse(response);
}

export async function getRecommendation() {
    const response = await fetch(`${BASE_URL}/recommendation/`, { headers: getHeaders() });
    return handleResponse(response);
}

// ==========================================
// SECURITY GUARD
// ==========================================

export async function recordEntry(regNumber, zoneName) {
    const response = await fetch(`${BASE_URL}/vehicles/entry`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reg_number: regNumber, zone_name: zoneName }),
    });
    return handleResponse(response);
}

export async function recordExit(regNumber) {
    const response = await fetch(`${BASE_URL}/vehicles/exit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reg_number: regNumber }),
    });
    return handleResponse(response);
}

export async function searchVehicle(regNumber) {
  const response = await fetch(`${BASE_URL}/vehicles/search?regNumber=${encodeURIComponent(regNumber)}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function markMisParked(regNumber) {
  const response = await fetch(`${ BASE_URL } /vehicles/${ encodeURIComponent(regNumber) }/mispark`, {
method: 'PATCH',
    headers: getHeaders(),
  });
return handleResponse(response);
}

export async function getMisParked() {
    const response = await fetch(`${BASE_URL}/vehicles/misparked`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
}

// ==========================================
// MANAGER
// ==========================================

export async function getLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.zone_name) queryParams.append('zone_name', filters.zone_name);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.reg_number) queryParams.append('reg_number', filters.reg_number);

    const response = await fetch(`${BASE_URL}/logs/?${queryParams.toString()}`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
}

export async function getAnalytics() {
    const response = await fetch(`${BASE_URL}/logs/analytics`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
}
