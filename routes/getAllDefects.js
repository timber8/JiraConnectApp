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
        jira_total_issues = jira_payload.total;
        n_issues_returned = jira_payload.issues.length;
        jira_promises = []
        //res.json(jira_payload);
        while(n_issues_returned*page < jira_total_issues){
          jira_promises.push(jiraRequestModule.getIssuesData(n_issues_returned*page))
          page++;
        }
        Promise.all(jira_promises)
        .then(function(valArray) {
          var issues = [];
          valArray.forEach(result =>{
            parsed_issues = jiraParsingInstance.parseIssues(JSON.parse(result));
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

router.get('/:fsId', async (req, res) => {
    jiraRequestModule.getIssuesDataByFsId(req.params.fsId,0)
    .then((data) => {
        var page= 0
        let jira_payload = JSON.parse(data);
        jira_total_issues = jira_payload.total;
        n_issues_returned = jira_payload.issues.length;
        jira_promises = []
        console.log(req.params.fsId);
        while((n_issues_returned*page < jira_total_issues) && n_issues_returned > 0){
          jira_promises.push(jiraRequestModule.getIssuesDataByFsId(req.params.fsId, n_issues_returned*page));
          page++;
        }
        Promise.all(jira_promises)
        .then(function(valArray) {
          var issues = [];
          valArray.forEach(result =>{
            parsed_issues = jiraParsingInstance.parseIssues(JSON.parse(result));
            Array.prototype.push.apply(issues,parsed_issues);
          })
          console.log(issues.length);
          res.json({
            n_results : issues.length,
            issues});
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
  
router.get('/fsName/:fsName', async (req, res) => {
    jiraRequestModule.getIssuesDataByFsName(req.params.fsName,0)
    .then((data) => {
        var page= 0
        let jira_payload = JSON.parse(data);
        jira_total_issues = jira_payload.total;
        n_issues_returned = jira_payload.issues.length;
        jira_promises = []
        console.log(req.params.fsName);
        while((n_issues_returned*page < jira_total_issues) && n_issues_returned > 0){
          jira_promises.push(jiraRequestModule.getIssuesDataByFsName(req.params.fsName, n_issues_returned*page));
          page++;
        }
        Promise.all(jira_promises)
        .then(function(valArray) {
          var issues = [];
          valArray.forEach(result =>{
            parsed_issues = jiraParsingInstance.parseIssues(JSON.parse(result));
            Array.prototype.push.apply(issues,parsed_issues);
          })
          console.log(issues.length);
          res.json({
            n_results : issues.length,
            issues});
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
