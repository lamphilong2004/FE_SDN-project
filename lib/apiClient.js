const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS || 8000);

const api = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT_MS
});

function getAuthToken(req) {
    const token = req?.cookies?.authToken;
    return typeof token === 'string' && token.trim() ? token.trim() : null;
}

function apiFor(req) {
    const token = getAuthToken(req);
    const instance = axios.create({
        baseURL: API_URL,
        timeout: API_TIMEOUT_MS
    });

    if (token) {
        instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    return instance;
}

function formatApiError(error) {
    const base = `Cannot reach Assignment 1 API at ${API_URL}.`;

    if (!error) return base;

    if (error.code === 'ECONNREFUSED') {
        return `${base} Connection refused (is the API running?).`;
    }

    if (error.code === 'ENOTFOUND') {
        return `${base} Host not found (check API_URL).`;
    }

    if (error.response) {
        const status = error.response.status;
        const baseMsg = `Assignment 1 API error: ${status} ${error.response.statusText}`;
        if (status === 401 || status === 403) {
            return `${baseMsg}. Please login at /login (or register at /register) and try again.`;
        }
        return baseMsg;
    }

    return `${base} ${error.message || ''}`.trim();
}

async function getFirst(paths) {
    return requestFirst(paths.map((url) => ({ method: 'get', url })));
}

async function requestFirst(requests, apiInstance) {
    let lastError;
    const client = apiInstance || api;

    for (const req of requests) {
        try {
            return await client.request(req);
        } catch (error) {
            lastError = error;
            if (error?.response?.status === 404) continue;
            break;
        }
    }

    throw lastError;
}

module.exports = {
    api,
    apiFor,
    API_URL,
    API_TIMEOUT_MS,
    getAuthToken,
    formatApiError,
    getFirst,
    requestFirst
};
