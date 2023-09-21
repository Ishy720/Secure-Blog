const sql = require("./Connection.js");
const {hashValue, encryptString, retrieveASCIIValue} = require("../Engines/UtilityEngine.js");
const { prepareQuery, prepareStatement } = require("../Engines/parameterizationEngine.js");

async function allocateUser(username, password, firstName) {
  return new Promise(function(resolve, reject) {
    const saltValueShifter = retrieveASCIIValue(username);
    const hashedPassword = hashValue(password, saltValueShifter);
    const encryptedFirstName = encryptString(firstName);
    const query = prepareQuery("INSERT INTO users (username, password, firstname, isadmin) VALUES ($1, $2, $3, $4);", username, hashedPassword, encryptedFirstName, false);
    const statement = prepareStatement(query);
    fetchUser(username).then(function(result) {
      if (result.length != 0) {
        reject("ERROR: That user already exists within the database!");
      } else {
        sql.query(statement, function(error, response) {
          if (error) reject(error);
          resolve(response.rows);
        });
      }
    });
  });
}

async function deallocateUser(username) {
  const query = prepareQuery("DELETE FROM users WHERE username = $1;", username);
  const statement = prepareStatement(query);
  sql.query(statement, function(error, response) {
    if (error) throw error;
  });
}

async function fetchUser(username) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("SELECT * FROM users WHERE username = $1;", username);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function fetchUser2FAstatus(username) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("SELECT \"MFA\" FROM users WHERE username = $1", username);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function fetchUser2FAsecret(username) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("SELECT secret FROM users WHERE username = $1;", username);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function saveUser2FAstatusAndSecret(username, secret) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("UPDATE users SET \"MFA\" = $1, secret = $2 WHERE username = $3;", true, secret, username);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

module.exports = {
  allocateUser: allocateUser,
  deallocateUser: deallocateUser,
  fetchUser: fetchUser,
  fetchUser2FAstatus: fetchUser2FAstatus,
  saveUser2FAstatusAndSecret: saveUser2FAstatusAndSecret,
  fetchUser2FAsecret: fetchUser2FAsecret
};
