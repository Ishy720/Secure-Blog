//Function to prepare a statement and user specified parameters into an object for accurate manipulation.
function prepareQuery(statement, ...params) {
  const preparedQuery = {
    statement: statement,
    parameters: params
  };

  return preparedQuery;
}

function prepareStatement(query) {
  let constructedStatement = "";
  const preparedParameters = [];
  const {statement, parameters} = query;
  //Split SQL statement by parametized values: $1, $2, for example.
  const deconstructedStatement = statement.split(/\$[1-9]/gm);

  //Check if parameters trail too far and if so pop the last element in the array to remove undefined values.
  if (deconstructedStatement[deconstructedStatement.length - 1] == undefined)
    deconstructedStatement.pop();

  //Loop through each specified parameter and remove any SQL injection characters.
  parameters.forEach(function(extractedParam) {
    if (typeof(extractedParam) !== "string")
      return preparedParameters.push(extractedParam);
    const cleanedParam = extractedParam.replace(/["*;\-']/g, "");
    preparedParameters.push(cleanedParam);
  });

  //Loop through deconstructed statements and parameters building together user specified parameters and the SQL query.
  for (let i = 0; i < deconstructedStatement.length; i++) {
    //Add the next encountered deconstructed statement to the string.
      constructedStatement = constructedStatement.concat(deconstructedStatement[i]);

      //In the event there are no user speicfied parameters, then simply continue the SQL statement.
      if (preparedParameters[i] == undefined)
        continue;

      //If parameters are detected, then concatenate them onto the SQL statement wrapped with '' (string indicators).
      constructedStatement = constructedStatement.concat("'");
      constructedStatement = constructedStatement.concat(preparedParameters[i]);
      constructedStatement = constructedStatement.concat("'");
  }

  return constructedStatement;
}


module.exports = {
  prepareQuery: prepareQuery,
  prepareStatement: prepareStatement
}

// Example of parametization engine usage:
//const preparedQuery = prepareQuery("SELECT * FROM myDatabase WHERE information = $1", "administrator\"--")
//const preparedStatement = prepareStatement(preparedQuery);
//console.log(preparedQuery);
//console.log(preparedStatement);

