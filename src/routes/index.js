const express = require('express');
const readRegister = require('../services/readRegister');
const router = express.Router();

router.get('/', async (req, res) => {
  const readings = await readRegister();
  res.send(
    `<h1>Hello World!</h1><p>Check console for Modbus readings.</p><pre>${JSON.stringify(
      readings,
      null,
      2
    )}</pre>`
  );
});

module.exports = router;
