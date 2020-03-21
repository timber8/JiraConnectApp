const Datastore = require('nedb');
const MongoDB = require('./db');

const issuesHistoricalDataDB = new Datastore('issuesHistoricalDataDB.db');
issuesHistoricalDataDB.loadDatabase();

function issuesHistoricalDataMongoDB(successCallback, failureCallback){
    // First 2 argumments - DB name, Collection name
    MongoDB.initialize("CignaDashboardDB", "issuesHistoricalData", successCallback, failureCallback);
}


module.exports = {
    issuesHistoricalDataDB,
    issuesHistoricalDataMongoDB
};