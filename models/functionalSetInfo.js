const Datastore = require('nedb');

const functionalSetInfoDB = new Datastore('functionalSetInfoDB.db');
functionalSetInfoDB.loadDatabase();

module.exports = {
    functionalSetInfoDB
};