var JiraRequestModule = require('./jira_issue_request');
function JiraParsingModule() {

this.parseHistoricalIssue = function(issue, snashot_date){
    let payload = {
        SNAPSHOT_DATE: snashot_date, 
        DEFECT_ID: issue.key,
        EPIC: issue.fields.customfield_10013,
        ASSIGNED: issue.fields.assignee ? issue.fields.assignee.displayName : null,
        STATUS: issue.fields.status ? handleStatus(issue.fields.status.name) : null,
        SEVERITY: issue.fields.customfield_10076 ? issue.fields.customfield_10076.value : null,
        ENVIROMENT: issue.fields.customfield_10122 && issue.fields.customfield_10122.length > 0 ? issue.fields.customfield_10122[0].value : null,
        FS: issue.fields.customfield_10160
    } 

    return payload;
    }

  this.parseIssue = function(issue){
    let payload = {
        DEFECT_ID: issue.key,
        EPIC: issue.fields.customfield_10013,
        SUMMARY: issue.fields.summary,
        ASSIGNED: issue.fields.assignee ? issue.fields.assignee.displayName : null,
        STATUS: issue.fields.status ? handleStatus(issue.fields.status.name) : null,
        SEVERITY: issue.fields.customfield_10076 ? issue.fields.customfield_10076.value : null,
        CREATED_DATE: issue.fields.customfield_10077,
        ENVIROMENT: issue.fields.customfield_10122 && issue.fields.customfield_10122.length > 0 ? issue.fields.customfield_10122[0].value : null,
        DEFECT_CLASSIFICATION: issue.fields.customfield_10150 ? issue.fields.customfield_10150 : null,
        DEFECT_FIXED_BY_TEAM: issue.fields.customfield_10149 ? issue.fields.customfield_10149 : null,
        FS: issue.fields.customfield_10160
    } 

    return payload;
  }
  
  this.parseFullIssue = function(issue){
    let payload = {
        DEFECT_ID: issue.key,
        SUMMARY: issue.fields.summary,
        DESCRIPTION: issue.fields.description,
        EPIC: issue.fields.customfield_10013,
        STATUS: issue.fields.status ? handleStatus(issue.fields.status.name) : null,
        SEVERITY: issue.fields.customfield_10076 ? issue.fields.customfield_10076.value : null, 
        CREATED_DATE: issue.fields.customfield_10077,
        ASSIGNED: issue.fields.assignee ? issue.fields.assignee.displayName : null,
        REPORTER: issue.fields.reporter ? issue.fields.reporter.displayName : null,
        ENVIROMENT: issue.fields.customfield_10122 && issue.fields.customfield_10122.length > 0 ? issue.fields.customfield_10122[0].value : null,
        DEFECT_CLASSIFICATION: issue.fields.customfield_10150 ? issue.fields.customfield_10150 : null,
        DEFECT_FIXED_BY_TEAM: issue.fields.customfield_10149 ? issue.fields.customfield_10149 : null,
        FS: issue.fields.customfield_10160
    } 

    return payload;
  }

  this.parseIssuesChangeLog = function(parseIssuesChangeLog){
    let payload = {
      FIELD: parseIssuesChangeLog.field ? parseIssuesChangeLog.field :null,
      BEFORE: parseIssuesChangeLog.fromString ? parseIssuesChangeLog.fromString : null,
      AFTER: parseIssuesChangeLog.toString ? parseIssuesChangeLog.toString : null
    }
    return payload;
  }


  this.parseIssues = function(jira_payload){
    let parsed_issues = [];
    jira_payload.issues.forEach(issue => {
          parsed_issue = this.parseIssue(issue);
          parsed_issues.push(parsed_issue);
    });
    return parsed_issues;
  }

  this.parseFullIssues = function(jira_payload){
    let parsed_issues = [];
    jira_payload.issues.forEach(issue => {
          parsed_issue = this.parseFullIssue(issue);
          parsed_issues.push(parsed_issue);
    });
    return parsed_issues;
  }

  this.parseHistoricalIssues = function(jira_payload, snashot_date){
    let parsed_issues = [];
    jira_payload.issues.forEach(issue => {
          parsed_issue = this.parseHistoricalIssue(issue, snashot_date);
          parsed_issues.push(parsed_issue);
    });
    return parsed_issues;
  }

  this.parseIssuesChangeLogs = function(jira_payload){
    let parsed_changeLog = [];
    jira_payload.values.forEach(changeLogIssue => {
          changeLogIssue.items.forEach(itemChanged => {
            if(itemChanged.field === "assignee" || itemChanged.field === "status"){
              parsed_changeLog.push({DATE :changeLogIssue.created, ITEM: this.parseIssuesChangeLog(itemChanged)});
            }
          })
    });
    return parsed_changeLog;
  }
  
}

function handleStatus(status) {
  if (status != undefined) {
    if (status == 'Failed') {
      status = 'Reopen';
    }
  }
  return status;
}

module.exports = JiraParsingModule;