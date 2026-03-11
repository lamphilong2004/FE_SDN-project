const express = require('express');
const router = express.Router();
const { api, formatApiError } = require('../lib/apiClient');

function normalizeReturnTo(value) {
    if (typeof value !== 'string') return '/';
    const trimmed = value.trim();
    if (!trimmed) return '/';

    // Prevent open-redirects: only allow local paths.
    if (!trimmed.startsWith('/')) return '/';
    if (trimmed.startsWith('//')) return '/';

    return trimmed;
}

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        returnTo: normalizeReturnTo(req.query.returnTo)
    });
});

router.get('/register', (req, res) => {
    res.render('auth/register', {
        title: 'Register',
        returnTo: normalizeReturnTo(req.query.returnTo)
    });
});

router.post('/login', async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const returnTo = normalizeReturnTo(req.body?.returnTo);

    if (!username || !password) {
        return res.status(400).render('auth/login', {
            title: 'Login',
            returnTo,
            error: 'Please enter username and password.'
        });
    }

    try {
        const response = await api.post('/users/login', { username, password });
        const token = response?.data?.token;

        if (!token) {
            return res.status(500).render('auth/login', {
                title: 'Login',
                returnTo,
                error: 'Login succeeded but no token returned from API.'
            });
        }

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProd
        });

        res.redirect(returnTo);
    } catch (error) {
        const status = error?.response?.status;
        const message = status === 401
            ? 'Invalid username or password.'
            : formatApiError(error);

        res.status(500).render('auth/login', {
            title: 'Login',
            returnTo,
            error: message
        });
    }
});

router.post('/register', async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const admin = req.body?.admin === 'on' || req.body?.admin === 'true' || req.body?.admin === true;
    const returnTo = normalizeReturnTo(req.body?.returnTo);

    if (!username || !password) {
        return res.status(400).render('auth/register', {
            title: 'Register',
            returnTo,
            error: 'Please enter username and password.'
        });
    }

    try {
        await api.post('/users/signup', { username, password, admin });

        // Auto-login after successful registration.
        const loginResponse = await api.post('/users/login', { username, password });
        const token = loginResponse?.data?.token;

        if (!token) {
            return res.status(500).render('auth/login', {
                title: 'Login',
                returnTo,
                error: 'Registered successfully, but could not retrieve token. Please login.'
            });
        }

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProd
        });

        res.redirect(returnTo);
    } catch (error) {
        const apiMessage = error?.response?.data?.err?.message;
        const message = typeof apiMessage === 'string' && apiMessage.trim()
            ? apiMessage
            : formatApiError(error);

        res.status(500).render('auth/register', {
            title: 'Register',
            returnTo,
            error: message
        });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/');
});

module.exports = router;
