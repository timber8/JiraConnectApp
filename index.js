const express = require('express');
var routes = require("./routes");
require('dotenv').config();
var JiraRequestModule = require('./JiraLib/jira_issue_request');
var JiraParsingModule = require('./JiraLib/transformations');
const fetch = require('node-fetch');
const models = require("./models");

var jiraRequestModule = new JiraRequestModule();
var jiraParsingInstance = new JiraParsingModule();
const app = express();
const port = process.env.PORT || 3000;

//Start web server 
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

//Front End Set Up
app.use(express.static('public'));
app.use(express.json({ limit: '2mb' }));


// App middleware, Inject DB in the req struct
app.use('/getHistoricalData', async (req, res, next) => {
  req.context = {
    models
  };
  next();
});
app.use('/functionalSetInfo', async (req, res, next) => {
  req.context = {
    models
  };
  next();
});
///////////////////////////////////////////////

app.use('/getAllDefects', routes.getAllDefects);
app.use('/getAllDefectInformation', routes.getaAllDefectInformation);
app.use('/getHistoricalData', routes.getHistoricalData); 
app.use('/functionalSetInfo', routes.functionalSetInfo); 

async function updateHistoricalData() {
  const time_response = await fetch("http://worldtimeapi.org/api/timezone/Europe/Lisbon");
  const time_data = await time_response.json();
  // Insert Time constraint here

  //console.log(new Date(time_data.datetime).getHours());
  jiraRequestModule.getIssuesData(0)
  .then((data) => {
    issues_body = JSON.parse(data);
    var page= 0
    let jira_payload = JSON.parse(data);
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
        parsed_issues = jiraParsingInstance.parseHistoricalIssues(JSON.parse(result), time_data.datetime);
        Array.prototype.push.apply(issues,parsed_issues);
      })
      var str_date = String(time_data.datetime)
      console.log("Current Date: " + str_date.substring(0,10));
      models.issuesHistoricalData.issuesHistoricalDataDB.update({ DATE: str_date.substring(0,10) }, {"DATE": str_date.substring(0,10), issues}, { upsert: true }, function (err, numReplaced, upsert) {
        console.log("Number of documents modified: " + numReplaced)
      });
    })
    .catch((err) => {
      console.log(err)
    });
  })
  .catch((err) => { 
    console.log(err);
  });
}
setInterval(updateHistoricalData, 3600000);
//Run On start
updateHistoricalData();