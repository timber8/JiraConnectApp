const express = require('express');
var JiraRequestModule = require('../JiraLib/jira_issue_request');
var JiraParsingModule = require('../JiraLib/transformations');

const router = express.Router();
var jiraRequestModule = new JiraRequestModule();
var jiraParsingInstance = new JiraParsingModule();


router.get('/', async (req, res) => {
  jiraRequestModule.getIssuesData(0)
    .then((data) => {
        var page= 0
        let jira_payload = JSON.parse(data);
        //res.json(jira_payload);
        jira_total_issues = jira_payload.total;
        n_issues_returned = jira_payload.issues.length;
        jira_promises = []
        while(n_issues_returned*page < jira_total_issues){
          jira_promises.push(jiraRequestModule.getIssuesData(n_issues_returned*page))
          page++;
        }
        Promise.all(jira_promises)
        .then(function(valArray) {
          var issues = [];
          valArray.forEach(result =>{
            parsed_issues = jiraParsingInstance.parseFullIssues(JSON.parse(result));
            Array.prototype.push.apply(issues,parsed_issues);
          })
         return issues;
        })
        .then(function(issues) {
          changelog_jira_promises = [];
          issues.forEach((item, index) => {
            changelog_jira_promises.push(jiraRequestModule.getIssueChangelogData(item.DEFECT_ID, index)
                .then(function(response) {
                  let response_payload = jiraParsingInstance.parseIssuesChangeLogs(JSON.parse(response));
                  item.CHANGELOG = response_payload;
                }));  
          });
          //Wait for all ChangeLog Promises
          Promise.all(changelog_jira_promises)
          .then((data) => {
            res.json({
            n_results : issues.length,
            issues});  
          })
          .catch((err) => {
            console.log(err)
            console.log(JSON.parse(err.response.body))
            res.json(JSON.parse(err.response.body));
          });
        })
        .catch((err) => {
          console.log(err)
          console.log(JSON.parse(err.response.body))
          res.json(JSON.parse(err.response.body));
        });
    })
    .catch((err) => {
        console.log(err)
        console.log(JSON.parse(err.response.body))
        res.json(JSON.parse(err.response.body));
    });
});

module.exports = router;