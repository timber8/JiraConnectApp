const express = require('express');
var routes = require("./routes");
require('dotenv').config();
var JiraRequestModule = require('./jira_issue_request');
var JiraParsingModule = require('./transformations');
const fetch = require('node-fetch');
const models = require("./models");




var mymModuleInstance = new JiraRequestModule();
var jiraParsingInstance = new JiraParsingModule();
const app = express();
const port = process.env.PORT || 3000;

//Start web server 
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));


// App middleware
app.use('/getHistoricalData', async (req, res, next) => {
  req.context = {
    models
  };
  next();
});

app.use('/getAllDefects', routes.getAllDefects);
app.use('/getAllDefectInformation', routes.getaAllDefectInformation);
app.use('/getHistoricalData', routes.getHistoricalData); 




async function updateHistoricalData() {
  const time_response = await fetch("http://worldtimeapi.org/api/timezone/Europe/Lisbon");
  const time_data = await time_response.json();
  console.log(new Date(time_data.datetime).getHours());
  mymModuleInstance.getIssuesData()
  .then((data) => {
    console.log("Benfica11");
    issues_body = JSON.parse(data);
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
      const timestamp = Date.now();
      issues_body.timestamp = timestamp;
      
      full_parsed_issues.forEach(issue => {
        issue.SNAPSHOT_DATE = new Date();
        models.issuesHistoricalData.issuesHistoricalDataDB.insert(issue);
      });
      
      console.log("Benfica12");
    })
    .catch((err) => {
      console.log(err)
    });
  })
  .catch((err) => {
    console.log("Benfica13");
    console.log(err);
  });
}
setInterval(updateHistoricalData, 20000);