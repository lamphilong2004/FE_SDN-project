const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    timeout: Number(process.env.API_TIMEOUT_MS || 8000)
});

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
        return `Assignment 1 API error: ${error.response.status} ${error.response.statusText}`;
    }

    return `${base} ${error.message || ''}`.trim();
}

async function getFirst(paths) {
    return requestFirst(paths.map((url) => ({ method: 'get', url })));
}

async function requestFirst(requests) {
    let lastError;

    for (const req of requests) {
        try {
            return await api.request(req);
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
    API_URL,
    formatApiError,
    getFirst,
    requestFirst
};
