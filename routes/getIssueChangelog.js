const express = require('express');
var JiraRequestModule = require('../JiraLib/jira_issue_request');
var JiraParsingModule = require('../JiraLib/transformations');

const router = express.Router();
var jiraRequestModule = new JiraRequestModule();
var jiraParsingInstance = new JiraParsingModule();

router.get('/:issueId', async (req, res) => {
    jiraRequestModule.getIssueChangelogData(req.params.issueId)
    .then((data) => {
      
     res.json(JSON.parse(data));
       
    })
    .catch((err) => {
        console.log(err)
        console.log(JSON.parse(err.response))
        //res.json(JSON.parse(err.response.body));
    });
});

module.exports = router; 