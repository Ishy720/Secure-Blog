
// Used to mitigate SQL injection in content.
function sanitizeSQLContent(specifiedContent) {
  //Regex to only include characters specified on an english keyboard.
  specifiedContent = specifiedContent.replace(/xxx[\x00-\x7F]+xxx/g, "");
  //Regex to remove any characters related to SQL injection.
  return specifiedContent.replace(/["*;\-']/g, "");
}

//Used to mitigate XSS in content.
function sanitizeXSSContent(specifiedContent) {
  //Regex to remove any characters relateed to XSS injection.
  return specifiedContent.replace(/[<>\/]/gm, "");
}

module.exports = {
  sanitizeSQLContent: sanitizeSQLContent,
  sanitizeXSSContent: sanitizeXSSContent
};
