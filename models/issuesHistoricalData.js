const Datastore = require('nedb');

const issuesHistoricalDataDB = new Datastore('issuesHistoricalDataDB.db');
issuesHistoricalDataDB.loadDatabase();

module.exports = {
    issuesHistoricalDataDB
};