const express = require('express');
const router = express.Router();
const { apiFor, formatApiError } = require('../lib/apiClient');
const { requireAuth, requireAdmin } = require('../middleware/auth');

function toId(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

// List quizzes
router.get('/', requireAuth, async (req, res) => {
    try {
        const api = apiFor(req);
        const response = await api.get('/quizzes');
        res.render('quiz/list', { quizzes: response.data, title: 'Quiz List' });
    } catch (error) {
        console.error(error);
        res.render('quiz/list', {
            quizzes: [],
            title: 'Quiz List',
            error: formatApiError(error)
        });
    }
});

// Render create form
router.get('/create', requireAdmin, (req, res) => {
    res.render('quiz/create', { title: 'Create Quiz' });
});

// Create quiz
router.post('/', requireAdmin, async (req, res) => {
    try {
        const api = apiFor(req);
        const title = typeof req.body?.title === 'string' ? req.body.title.trim() : req.body?.title;
        const descriptionRaw = typeof req.body?.description === 'string' ? req.body.description.trim() : req.body?.description;

        const payload = { title };
        if (typeof descriptionRaw === 'string' && descriptionRaw.length > 0) {
            payload.description = descriptionRaw;
        }

        await api.post('/quizzes', payload);
        res.redirect('/quizzes');
    } catch (error) {
        console.error(error);
        res.status(500).render('quiz/create', {
            title: 'Create Quiz',
            error: formatApiError(error)
        });
    }
});

// View quiz details
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const api = apiFor(req);
        const quizResponse = await api.get(`/quizzes/${req.params.id}`);
        const quiz = quizResponse.data;
        const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];

        if (process.env.DEBUG_UI === '1') {
            console.log('[UI] GET /quizzes/%s -> api questions=%s', req.params.id, Array.isArray(quiz?.questions) ? quiz.questions.length : typeof quiz?.questions);
        }

        res.render('quiz/details', {
            quiz,
            questions,
            title: 'Quiz Details'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('quiz/details', {
            quiz: { _id: req.params.id, title: 'Quiz', description: '' },
            questions: [],
            title: 'Quiz Details',
            error: formatApiError(error)
        });
    }
});

// Render attach-existing-questions page
router.get('/:id/attach-questions', requireAdmin, async (req, res) => {
    try {
        const api = apiFor(req);
        const [quizResponse, questionsResponse] = await Promise.all([
            api.get(`/quizzes/${req.params.id}`),
            api.get('/questions')
        ]);

        const quiz = quizResponse.data;
        const selectedIds = new Set(
            Array.isArray(quiz?.questions)
                ? quiz.questions.map((q) => toId(q?._id || q)).filter(Boolean)
                : []
        );

        res.render('quiz/attachQuestions', {
            title: 'Add Existing Questions',
            quiz,
            questions: questionsResponse.data,
            selectedIds
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('quiz/attachQuestions', {
            title: 'Add Existing Questions',
            quiz: { _id: req.params.id, title: 'Quiz' },
            questions: [],
            selectedIds: new Set(),
            error: formatApiError(error)
        });
    }
});

// Attach selected existing questions to quiz
router.post('/:id/attach-questions', requireAdmin, async (req, res) => {
    try {
        const api = apiFor(req);
        const quizResponse = await api.get(`/quizzes/${req.params.id}`);
        const quiz = quizResponse.data;

        const existingIds = new Set(
            Array.isArray(quiz?.questions)
                ? quiz.questions.map((q) => toId(q?._id || q)).filter(Boolean)
                : []
        );

        const pickedRaw = req.body?.questionIds || [];
        const picked = (Array.isArray(pickedRaw) ? pickedRaw : [pickedRaw])
            .map(toId)
            .filter(Boolean);

        for (const id of picked) existingIds.add(id);

        await api.put(`/quizzes/${req.params.id}`, {
            title: quiz.title,
            description: quiz.description,
            questions: Array.from(existingIds)
        });

        res.redirect(`/quizzes/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).redirect(`/quizzes/${req.params.id}/attach-questions`);
    }
});

// Render edit form
router.get('/:id/edit', requireAdmin, async (req, res) => {
    try {
        const api = apiFor(req);
        const response = await api.get(`/quizzes/${req.params.id}`);
        res.render('quiz/edit', { quiz: response.data, title: 'Edit Quiz' });
    } catch (error) {
        console.error(error);
        res.status(500).render('quiz/edit', {
            quiz: { _id: req.params.id, title: '', description: '' },
            title: 'Edit Quiz',
            error: formatApiError(error)
        });
    }
});

// Update quiz
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const api = apiFor(req);
        const id = req.params.id;
        const title = typeof req.body?.title === 'string' ? req.body.title.trim() : req.body?.title;
        const description = typeof req.body?.description === 'string' ? req.body.description.trim() : req.body?.description;

        // Many APIs treat PUT as full replace. The edit form only submits title/description,
        // so preserve existing attached questions to avoid dropping them.
        let questions = req.body?.questions;
        if (typeof questions === 'undefined') {
            const existing = await api.get(`/quizzes/${id}`);
            questions = Array.isArray(existing.data?.questions)
                ? existing.data.questions
                    .map((q) => toId(q?._id || q))
                    .filter(Boolean)
                : undefined;
        }

        const payload = { title, description };
        if (typeof questions !== 'undefined') payload.questions = questions;

        await api.put(`/quizzes/${id}`, payload);
        res.redirect('/quizzes');
    } catch (error) {
        console.error(error);
        res.status(500).redirect(`/quizzes/${req.params.id}/edit`);
    }
});

// Delete quiz
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const api = apiFor(req);
        await api.delete(`/quizzes/${req.params.id}`);
        res.redirect('/quizzes');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/quizzes');
    }
});

module.exports = router;
