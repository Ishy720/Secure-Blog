const {host, port, database, username, password, ssl} = require("../Authentication.js");
const {Client} = require("pg");

const sqlClient = new Client({
  user: username,
  host: host,
  database: database,
  password: password,
  port: port,
  ssl: ssl
});

sqlClient.connect().then(() => console.log("Successfully connected to the PostGRE database!"));


module.exports = sqlClient;
