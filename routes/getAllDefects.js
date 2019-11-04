const express = require('express');
var JiraRequestModule = require('../jira_issue_request');
var JiraParsingModule = require('../transformations');

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
          var full_parsed_issues = [];
          valArray.forEach(result =>{
            parsed_issues = jiraParsingInstance.parseIssues(JSON.parse(result));
            Array.prototype.push.apply(full_parsed_issues,parsed_issues);
          })
          console.log(full_parsed_issues.length);
          res.json({
            n_results : full_parsed_issues.length,
            full_parsed_issues});
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

router.get('/:fsId', async (req, res) => {
    mymModuleInstance.getIssuesDataByFsId(req.params.fsId,0)
    .then((data) => {
        var page= 0
        let jira_payload = JSON.parse(data);
        jira_total_issues = jira_payload.total;
        n_issues_returned = jira_payload.issues.length;
        jira_promises = []
        console.log(req.params.fsId);
        while(n_issues_returned*page < jira_total_issues){
          jira_promises.push(mymModuleInstance.getIssuesDataByFsId(req.params.fsId, n_issues_returned*page));
          page++;
        }
        Promise.all(jira_promises)
        .then(function(valArray) {
          var full_parsed_issues = [];
          valArray.forEach(result =>{
            parsed_issues = jiraParsingInstance.parseIssues(JSON.parse(result));
            Array.prototype.push.apply(full_parsed_issues,parsed_issues);
          })
          console.log(full_parsed_issues.length);
          res.json({
            n_results : full_parsed_issues.length,
            full_parsed_issues});
        })
        .catch((err) => {
          console.log(err)
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
