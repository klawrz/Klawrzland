require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const port = process.env['PORT'] || 8080;
const path = require('path');

app.set('view engine', 'ejs');

app.use(expressLayouts);
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
  res.locals = {
    title: "Klawrzland"
  };
  res.render('index', {
    // additional locals, custom layout, other options
  });
});

// Pages
app.get('/contact', (req, res) => {
  res.locals = {
    title: "Contact"
  };
  res.render('contact');
});

app.get('/about', (req, res) => {
  res.locals = {
    title: "Index"
  };
  res.render('about');
});

app.get('/tests', (req, res) => {
  res.locals = {
    title: "Tests"
  };
  res.render('tests');
});

app.get('/freestyle', (req, res) => {
  res.locals = {
    title: "Freestyle"
  };
  res.render('freestyle');
});

app.get('/colour-synth', (req, res) => {
  res.locals = {
    title: "colourSynth"
  };
  res.render('colour-synth');
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

app.listen(port, () => {
  console.log(`Klawrzland is live at http://localhost:${port}`);
});