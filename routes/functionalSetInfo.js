const express = require('express');

const router = express.Router();
router.get('/', async (req, res) => {
    req.context.models.functionalSetInfo.functionalSetInfoDB.find({})
    .exec((err,issues) => {
      res.json(issues)
    });
});

router.post('/', (req, res) => {
    const data = req.body;
    //req.context.models.functionalSetInfo.functionalSetInfoDB.insert(data);
    req.context.models.functionalSetInfo.functionalSetInfoDB.update({ FS_ID: data.FS_ID }, data, { upsert: true }, function (err, numReplaced, upsert) {
        console.log("Number of documents modified: " + numReplaced)
      });
    res.json(data);
});

module.exports = router;