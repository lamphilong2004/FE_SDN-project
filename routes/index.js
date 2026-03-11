const express = require('express');
const router = express.Router();
const quizRoutes = require('./quiz');
const questionRoutes = require('./question');
const authRoutes = require('./auth');

// Root route
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// Auth routes
router.use('/', authRoutes);

// Quiz routes
router.use('/quizzes', quizRoutes);

// Question routes
router.use('/questions', questionRoutes);

module.exports = router;
