require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env['PORT'] || 8080;
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Projects router
const projects = require('./projects');
app.use('/projects', projects);

// Services router
const services = require('./services');
app.use('/services', services);

// Home
app.get('/', (req, res) => {
  res.render('index');
});

// Pages
app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.listen(port, () => {
  console.log(`Klawrzland is live at http://localhost:${port}`);
});