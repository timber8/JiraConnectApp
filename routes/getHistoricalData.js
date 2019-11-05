const express = require('express');

const router = express.Router();
router.get('/', async (req, res) => {
    req.context.models.issuesHistoricalData.issuesHistoricalDataDB.find({})
    .sort({DATE: -1})
    .limit(30)
    .exec((err,issues) => {
      
      res.json(issues)
    });
});

module.exports = router;

/*
req.context.models.issuesHistoricalData.issuesHistoricalDataDB.count({}, function (err, count) {
        // count equals to 3
        console.log(count); 
*/