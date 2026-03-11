require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const routes = require('./routes');

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
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`UI Server running at http://localhost:${PORT}`);
});

module.exports = app;
