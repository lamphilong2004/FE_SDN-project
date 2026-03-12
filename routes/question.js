const express = require('express');
const router = express.Router();
const { apiFor, formatApiError, requestFirst } = require('../lib/apiClient');
const { requireAdmin } = require('../middleware/auth');

// Only admins can manage questions in the UI.
router.use(requireAdmin);

function normalizeQuestionPayload(body) {
    const optionsRaw = body?.options || body?.['options[]'] || [];
    const options = (Array.isArray(optionsRaw) ? optionsRaw : [optionsRaw])
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v) => typeof v === 'string' && v.length > 0);

    const correctAnswerIndex = Number(body?.correctAnswerIndex);

    const payload = {
        text: typeof body?.text === 'string' ? body.text.trim() : body?.text,
        options,
        correctAnswerIndex
    };

    if (typeof body?.keywords === 'string' && body.keywords.trim()) {
        payload.keywords = body.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
    }

    return payload;
}

// List questions
router.get('/', async (req, res) => {
    try {
        const api = apiFor(req);
        const response = await api.get('/questions');
        res.render('questions/list', { questions: response.data, title: 'Question List' });
    } catch (error) {
        console.error(error);
        res.render('questions/list', {
            questions: [],
            title: 'Question List',
            error: formatApiError(error)
        });
    }
});

// Render create form
router.get('/create', async (req, res) => {
    try {
        const api = apiFor(req);
        const quizzesResponse = await api.get('/quizzes');
        res.render('questions/create', {
            quizzes: quizzesResponse.data,
            quizId: req.query.quizId || null,
            title: 'Create Question'
        });
    } catch (error) {
        res.render('questions/create', {
            quizzes: [],
            quizId: req.query.quizId || null,
            title: 'Create Question',
            error: formatApiError(error)
        });
    }
});

// Create question
router.post('/', async (req, res) => {
    try {
        const api = apiFor(req);
        const { quizId } = req.body;
        const questionData = normalizeQuestionPayload(req.body);

        if (!Number.isInteger(questionData.correctAnswerIndex) || questionData.correctAnswerIndex < 0) {
            return res.status(400).render('questions/create', {
                quizzes: [],
                quizId: quizId || null,
                title: 'Create Question',
                error: 'Please choose a valid correct answer option.'
            });
        }

        if (quizId) {
            // If quizId is provided, add question to specific quiz
            await requestFirst([
                { method: 'post', url: `/quizzes/${quizId}/question`, data: questionData },
                { method: 'post', url: `/quizzes/${quizId}/questions`, data: questionData }
            ], api);
            res.redirect(`/quizzes/${quizId}`);
        } else {
            await api.post('/questions', questionData);
            res.redirect('/questions');
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('questions/create', {
            quizzes: [],
            quizId: req.body.quizId || null,
            title: 'Create Question',
            error: formatApiError(error)
        });
    }
});

// View question details
router.get('/:id', async (req, res) => {
    try {
        const api = apiFor(req);
        const response = await api.get(`/questions/${req.params.id}`);
        res.render('questions/details', { question: response.data, title: 'Question Details' });
    } catch (error) {
        console.error(error);
        res.status(500).render('questions/details', {
            question: { _id: req.params.id, text: '', options: [], correctAnswerIndex: 0 },
            title: 'Question Details',
            error: formatApiError(error)
        });
    }
});

// Render edit form
router.get('/:id/edit', async (req, res) => {
    try {
        const api = apiFor(req);
        const response = await api.get(`/questions/${req.params.id}`);
        res.render('questions/edit', { question: response.data, title: 'Edit Question' });
    } catch (error) {
        console.error(error);
        res.status(500).render('questions/edit', {
            question: { _id: req.params.id, text: '', options: ['', '', '', ''], correctAnswerIndex: 0 },
            title: 'Edit Question',
            error: formatApiError(error)
        });
    }
});

// Update question
router.put('/:id', async (req, res) => {
    try {
        const api = apiFor(req);
        const questionData = normalizeQuestionPayload(req.body);
        await api.put(`/questions/${req.params.id}`, questionData);
        res.redirect('/questions');
    } catch (error) {
        console.error(error);
        res.status(500).redirect(`/questions/${req.params.id}/edit`);
    }
});

// Delete question
router.delete('/:id', async (req, res) => {
    try {
        const api = apiFor(req);
        await api.delete(`/questions/${req.params.id}`);
        res.redirect('/questions');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/questions');
    }
});

module.exports = router;
