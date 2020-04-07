const express = require('express');
var routes = require("./routes");
const fileUpload = require('express-fileupload');
require('dotenv').config();
var JiraRequestModule = require('./JiraLib/jira_issue_request');
var JiraParsingModule = require('./JiraLib/transformations');
const fetch = require('node-fetch');
const models = require("./models");
var cors = require('cors');
const fs = require('fs');
const Datastore = require('nedb');

var jiraRequestModule = new JiraRequestModule();
var jiraParsingInstance = new JiraParsingModule();
const app = express();
const port = process.env.PORT || 3000;


app.use(cors())
//Start web server 
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

//Allows file updates
app.use(fileUpload());

//Front End Set Up
app.use(express.static('public')); 
app.use(express.json({ limit: '2mb' }));

//Upload File Route
app.post('/upload', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  console.log(process.cwd());
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./config.json', function(err) {
    if (err)
      return res.status(500).send(err);
      let rawdata = fs.readFileSync('config.json');
      console.log(JSON.parse(rawdata));
      // Cloud database insert here

    res.json('Configuraion Uploaded!');
  });  
}); 




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
app.use('/getAllDefectInformationWithChangeLog', routes.getAllDefectInformationWithChangeLog);
app.use('/getHistoricalData', routes.getHistoricalData); 
app.use('/functionalSetInfo', routes.functionalSetInfo);
app.use('/getIssueChangelog', routes.getIssueChangelog);  

async function updateHistoricalData() {
  const time_response = await fetch("http://worldtimeapi.org/api/timezone/Europe/Lisbon");
  const time_data = await time_response.json();
  // Insert Time constraint here
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
      // Local DB update
      models.issuesHistoricalData.issuesHistoricalDataDB.update({ DATE: str_date.substring(0,10) }, {"DATE": str_date.substring(0,10), issues}, { upsert: true }, function (err, numReplaced, upsert) {
        console.log("Number of documents (Local DB) modified: " + numReplaced)
      });
      // Cloud DB update
      models.issuesHistoricalData.issuesHistoricalDataMongoDB(
        function(dbCollection) { // successCallback
          // Updating issue data (1 for Day) record
         
          try{
            dbCollection.updateOne({ DATE: str_date.substring(0,10) },{$set: {"DATE": str_date.substring(0,10), issues}}, { upsert: true });
            console.log("Record saved in the Cloud");
          }catch (e){
            console.log(e);
          }
          }, function(err) { // failureCallback
              throw (err);
        }
      )
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

/*
// Cloud Database Migration (Uncomment if you want to migrate your local Database)
const issuesHistoricalDataDB = new Datastore('issuesHistoricalDataDB.db');
issuesHistoricalDataDB.loadDatabase();
models.issuesHistoricalData.issuesHistoricalDataMongoDB( function(dbCollection) { 
  try{
    dbCollection.remove({});
    console.log("Collection Deleted");
  }catch (e){
    console.log(e);
  }
  }, function(err) { // failureCallback
      throw (err);
  }
)
models.issuesHistoricalData.issuesHistoricalDataMongoDB(function(dbCollection) {
  issuesHistoricalDataDB.find({})
    .exec((err,issues) => {
      console.log(issues.length)
      issues.forEach((item, index) =>{
        let issues = item.issues;
        try{
          dbCollection.updateOne({ DATE: item.DATE },{$set: {"DATE": item.DATE, issues}}, { upsert: true });
          setTimeout(() => {  console.log("Record "+ index +" saved in the Cloud"); }, 2000);
        }catch (e){
          console.log(e); 
        }
        }, function(err) { // failureCallback
            throw (err);
      });
  });
});
*/