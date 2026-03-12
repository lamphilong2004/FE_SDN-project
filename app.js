require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { attachCurrentUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.UI_PORT || 3001;

// Hybrid layout setup: use EJS for views, but allow `.hbs` layout/partials files
// (they still contain EJS syntax and are rendered via EJS).
app.engine('hbs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', './layouts/main.hbs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

app.use((req, res, next) => {
    res.locals.isAuthenticated = Boolean(req.cookies?.authToken);
    res.locals.apiBaseUrl = process.env.API_URL || 'http://localhost:3000';
    res.locals.originalUrl = req.originalUrl;
    next();
});

// Populate res.locals.currentUser + res.locals.isAdmin (best-effort)
app.use(attachCurrentUser);
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`UI Server running at http://localhost:${PORT}`);
});

module.exports = app;
