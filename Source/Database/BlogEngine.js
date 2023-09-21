const sql = require("./Connection.js");
const {sanitizeSQLContent, sanitizeXSSContent} = require("../Engines/SanitizationEngine.js");
const { prepareQuery, prepareStatement } = require("../Engines/parameterizationEngine.js");

async function allocatePost(title, subtitle, content, posterID, image, posterName) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("INSERT INTO posts (title, content, posterID, subtitle, image, postername) VALUES ($1, $2, $3, $4, $5, $6)", title, content, posterID, subtitle, image, posterName);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function deallocatePost(postID) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("DELETE FROM posts WHERE ID = $1;", postID);
    const statement  = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function editPost(postID, title, subtitle, content) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("UPDATE posts SET title = $1, subtitle = $2, content = $3 WHERE id = $4", title, subtitle, content, postID);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function fetchPostsByUser(userID) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("SELECT * FROM posts WHERE posterid = $1;", userID);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function fetchPost(postID) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("SELECT * FROM posts WHERE id = $1", postID);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function fetchPosts() {
  return new Promise(function(resolve, reject) {
    sql.query("SELECT * FROM posts;", function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function flagPost(postID) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("UPDATE posts SET flagged = $1 WHERE ID = $2", true, postID);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

async function searchPost(searchStatement) {
  return new Promise(function(resolve, reject) {
    const query = prepareQuery("SELECT * FROM posts WHERE LOWER(title) LIKE LOWER($1);", `%${searchStatement}%`);
    const statement = prepareStatement(query);
    sql.query(statement, function(error, response) {
      if (error) reject(error);
      resolve(response.rows);
    });
  });
}

function clean(content) {
  return sanitizeSQLContent(sanitizeXSSContent(content));
}

module.exports = {
  allocatePost: allocatePost,
  deallocatePost: deallocatePost,
  editPost: editPost,
  fetchPostsByUser: fetchPostsByUser,
  fetchPost: fetchPost,
  fetchPosts: fetchPosts,
  flagPost: flagPost,
  searchPost: searchPost
};
