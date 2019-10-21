const express = require('express');
const fetch = require('node-fetch');
const requestJira = require('request');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.get('/issues', async (request, response) => {
  const jira_api_key = process.env.JIRA_API_KEY;
  const jira_user = process.env.JIRA_USER.toString();
  var bodyData = `{
    "expand": [
      "names",
      "schema",
      "operations"
    ],
    "jql": "project = CHK AND issuetype = Bug AND status = Open AND cf[10122] = TST1 AND "Functional Set/s" = "Broker Maintenance" ORDER BY key DESC, cf[10039] DESC, status ASC, cf[10013] ASC",
    "maxResults": 1,
    "fieldsByKeys": false,
    "fields": [
      "summary",
      "status",
      "assignee"
    ],
    "startAt": 0
  }`;
  
  var options = {
     method: 'POST',
     url: 'https://dchelix.atlassian.net/rest/api/3/search',
     auth: { username: process.env.JIRA_USER, password: process.env.JIRA_API_KEY },
     headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
     },
     body: bodyData
  };

  console.log(jira_user);

  
 requestJira(options, function (error, response_jira, body_jira) {
    if (error) throw new Error(error);
    console.log(
       'Response: ' + response_jira.statusCode + ' ' + response_jira.statusMessage
    );
    //console.log(JSON.parse(body).issues[0].fields.status);
    //console.log(JSON.parse(body))
    response.json(JSON.parse(body_jira));
 });

  // response.json(JSON.parse(bodyData));
});
