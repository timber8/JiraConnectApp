var request = require('request');

var bodyData = `{
  "expand": [
    "names",
    "schema",
    "operations"
  ],
  "jql": "project = CHK AND issuetype = Bug and cf[10122] = TST1 ORDER BY key DESC, cf[10039] DESC, status ASC, cf[10013] ASC",
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
   auth: { username: 'davifernandes@deloitte.pt', password: 'dgmAVl1CYUleKMTZKFsaEAFE' },
   headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
   },
   body: bodyData
};

request(options, function (error, response, body) {
    console.log(error);
   if (error) throw new Error(error);
   console.log(
      'Response: ' + response.statusCode + ' ' + response.statusMessage
   );
   console.log(JSON.parse(body).issues[0].fields.status);
   console.log(JSON.parse(body))
});