const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  //console.log('Time: ', Date.now());
  next();
});

router.get('/', (req, res) => {
  res.send('Projects home page');
});

// Projects
router.get('/colour-picker', (req, res) => {
  res.render('colour-picker');
});

router.get('/paint', (req, res) => {
  res.render('paint');
});

router.get('/blockbreaker', (req, res) => {
  res.render('blockbreaker');
});

router.get('/etch-a-sketch', (req, res) => {
  res.render('etch-a-sketch');
});

router.get('/glorfs-quest', (req, res) => {
  res.render('glorf');
});

router.get('/sandbox', (req, res) => {
  res.render('sandbox');
});

module.exports = router;