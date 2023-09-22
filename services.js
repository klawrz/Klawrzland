const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  next();
});

// Root page for Services
router.get('/', (req, res) => {
  res.send('Services home page');
});

// Services
router.get('/small-jobs', (req, res) => {
  res.render('small-jobs');
});

router.get('/launch-your-store', (req, res) => {
  res.render('launch-your-store');
});

module.exports = router;