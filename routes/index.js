const express = require('express');
const router = express.Router();
const quizRoutes = require('./quiz');
const questionRoutes = require('./question');

// Root route
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// Quiz routes
router.use('/quizzes', quizRoutes);

// Question routes
router.use('/questions', questionRoutes);

module.exports = router;
