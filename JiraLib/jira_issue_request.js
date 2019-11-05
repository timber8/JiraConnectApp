const requestJira = require('request-promise');
require('dotenv').config();

function JiraRequestModule() {

  this.jql_query = "project = CHK AND issuetype = Bug AND status = Open AND cf[10122] = TST1 AND \"Epic Link\" = FSD-2 ORDER BY key DESC, cf[10039] DESC, status ASC, cf[10013] ASC"

  this.bodyDataConfig = function(jql_query, issue_number){
    return JSON.stringify({
      "expand": [
        "names"
      ],
      "jql": jql_query,
      "maxResults": 100,
      "fieldsByKeys": false,
      "fields": [
        "summary",
        "status",
        "assignee",
        "creator",
        "description",
        "reporter",
        "customfield_10077",
        "customfield_10076",
        "customfield_10013",
        "customfield_10160",
        "customfield_10122"
      ],
      "startAt": issue_number
    });
  }
  
  this.options = function (bodyData) {
    return {
          method: 'POST',
          url: 'https://dchelix.atlassian.net/rest/api/3/search',
          auth: { username: process.env.JIRA_USER, password: process.env.JIRA_API_KEY },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: bodyData
      };
  }    

  this.getIssuesData = function(issue_number) {
    jql_query = "project = CHK AND issuetype = Bug ORDER BY key DESC, cf[10039] DESC, status ASC, cf[10013] ASC";
    return requestJira(this.options(this.bodyDataConfig(jql_query, issue_number)));
  }

  this.getIssuesDataByFsId = function(fsID, issue_number){
    jql_query = "project = CHK AND issuetype = Bug AND \"Epic Link\" = \""+  fsID +"\" ORDER BY key DESC, cf[10039] DESC, status ASC, cf[10013] ASC";
    return requestJira(this.options(this.bodyDataConfig(jql_query, issue_number)));
  }
  
  this.getPrediodicIssuesData = function(issue_number){
    jql_query = "project = CHK AND issuetype = Bug ORDER BY key DESC, cf[10039] DESC, status ASC, cf[10013] ASC";
    return requestJira(this.options(this.bodyDataConfig(jql_query, issue_number)));
  }
} 

module.exports = JiraRequestModule;