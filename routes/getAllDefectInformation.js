const express = require('express');
var JiraRequestModule = require('../JiraLib/jira_issue_request');
var JiraParsingModule = require('../JiraLib/transformations');

const router = express.Router();
var mymModuleInstance = new JiraRequestModule();
var jiraParsingInstance = new JiraParsingModule();

router.get('/', async (req, res) => {
  mymModuleInstance.getIssuesData(0)
    .then((data) => {
        var page= 0
        let jira_payload = JSON.parse(data);
        jira_total_issues = jira_payload.total;
        n_issues_returned = jira_payload.issues.length;
        jira_promises = []
        while(n_issues_returned*page < jira_total_issues){
          jira_promises.push(mymModuleInstance.getIssuesData(n_issues_returned*page))
          page++;
        }
        Promise.all(jira_promises)
        .then(function(valArray) {
          var issues = [];
          valArray.forEach(result =>{
            parsed_issues = jiraParsingInstance.parseFullIssues(JSON.parse(result));
            Array.prototype.push.apply(issues,parsed_issues);
          })
          console.log(issues.length);
          res.json({
            n_results : issues.length,
            issues});
        })
        .catch((err) => {
          console.log(err)
        });
    })
    .catch((err) => {
        console.log(err)
        console.log(JSON.parse(err.response.body))
        res.json(JSON.parse(err.response.body));
    });
});
module.exports = router;