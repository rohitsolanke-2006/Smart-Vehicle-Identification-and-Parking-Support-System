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
            if (Array.isArray(errorData.detail)) {
                errorMsg = errorData.detail[0].msg;
            } else {
                errorMsg = errorData.detail || errorMsg;
            }
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
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function register(payload) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

export async function getMyVehicle() {
    const response = await fetch(`${BASE_URL}/vehicles/my`, { headers: getHeaders() });
    if (response.status === 404) return null;
    return handleResponse(response);
}

export async function selfCheckout() {
    const response = await fetch(`${BASE_URL}/vehicles/self-checkout`, {
        method: 'POST',
        headers: getHeaders(),
    });
    return handleResponse(response);
}

// ==========================================
// BOOKINGS
// ==========================================

export async function createBooking(zone_name, vehicle_reg) {
    const response = await fetch(`${BASE_URL}/bookings/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ zone_name, vehicle_reg }),
    });
    return handleResponse(response);
}

export async function getMyBooking() {
    const response = await fetch(`${BASE_URL}/bookings/my`, { headers: getHeaders() });
    if (response.status === 204 || response.status === 200) {
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }
    return handleResponse(response);
}

export async function cancelMyBooking() {
    const response = await fetch(`${BASE_URL}/bookings/my`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
}

export async function getAllBookings() {
    const response = await fetch(`${BASE_URL}/bookings/`, { headers: getHeaders() });
    return handleResponse(response);
}

export async function confirmBooking(id) {
    const response = await fetch(`${BASE_URL}/bookings/${id}/confirm`, {
        method: 'PATCH',
        headers: getHeaders(),
    });
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
  const response = await fetch(`${BASE_URL}/vehicles/search?reg_number=${encodeURIComponent(regNumber)}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function markMisParked(regNumber) {
  const response = await fetch(`${BASE_URL}/vehicles/${encodeURIComponent(regNumber)}/mispark`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// lowercase alias used in EntryExit.jsx
export const markMisparked = markMisParked;

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

// ==========================================
// FEATURE: ANPR — Plate Scanning
// ==========================================

export async function scanPlate(imageFile) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', imageFile);
    const response = await fetch(`${BASE_URL}/vision/scan`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
    });
    return handleResponse(response);
}

// ==========================================
// FEATURE: Virtual Queue
// ==========================================

export async function joinQueue(zoneName) {
    const response = await fetch(`${BASE_URL}/queue/join`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ zone_name: zoneName }),
    });
    return handleResponse(response);
}

export async function getQueueStatus() {
    const response = await fetch(`${BASE_URL}/queue/my-status`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
}

export async function leaveQueue(zoneName) {
    const response = await fetch(`${BASE_URL}/queue/leave/${encodeURIComponent(zoneName)}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to leave queue');
    }
}

// ==========================================
// FEATURE: Heatmap Analytics
// ==========================================

export async function getHeatmap(zone = 'all') {
    const response = await fetch(`${BASE_URL}/logs/heatmap?zone=${encodeURIComponent(zone)}`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
}

export async function getPrediction() {
    const response = await fetch(`${BASE_URL}/logs/predict`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
}

// ==========================================
// FEATURE: PDF Export
// ==========================================

export async function exportPdf() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/logs/export-pdf`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parking_report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}
