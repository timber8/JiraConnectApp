const express = require('express');

const router = express.Router();
router.get('/', async (req, res) => {
    req.context.models.issuesHistoricalData.issuesHistoricalDataDB.find({})
    .limit(30)
    .exec((err,issues) => {
      res.json(issues)
    });
});

module.exports = router;