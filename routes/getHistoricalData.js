const express = require('express');

const router = express.Router();
router.get('/', async (req, res) => {
  
    // Code for the Local DB
    /*
    req.context.models.issuesHistoricalData.issuesHistoricalDataDB.find({})
    .sort({DATE: -1})
    .limit(30)
    .exec((err,issues) => {
      
      res.json(issues)
    });*/

    req.context.models.issuesHistoricalData.issuesHistoricalDataMongoDB(
    function(dbCollection) { // successCallback
      // get all items
      dbCollection.find()
      .sort({DATE: -1})
      .limit(30)
      .toArray(function(err, result) {
          if (err) throw err;
          res.json(result);
      });
    }, function(err) { // failureCallback
        throw (err);
    });

});

module.exports = router;