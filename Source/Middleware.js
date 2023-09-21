//Middleware to determine whether the request was sent with the correct CSRF token initialized by the server.
function doesUserHaveToken(request, response, next) {
  const session = request.session;
  const userInformation = request.body;
  const csrfGiven = userInformation._csrf;

  if(csrfGiven != session.userCSRFToken)
    return response.status(401).json({message: "Invalid request."});

  return next();
}

//Middleware to determine if the user is currently logged in.
function userLoggedIn(request, response, next) {
    const session = request.session;
    if (session.isLoggedIn)
        return next();

    return response.redirect("/login");
}

//Middleware to determine if the user logged in is an admin.
function adminLoggedIn(request, response, next) {
  const session = request.session;
  if (session.isAdmin)
    return next();

  return response.redirect("/");
}

//Middleware to determine if an already logged in user shouldn't access a page.
function userLoggedInDeny(request, response, next) {
  const session = request.session;
  if (session.isLoggedIn)
    return response.redirect("/");

  return next();
}

//Middleware to determine if a user has completed their 2 factor authentication.
function user2FAcompleted(request, response, next) {
  const session = request.session;
  if (session.is2FAcompleted)
    return next();

  return response.redirect("/");
}

//Middleware to determine if a users credentials have been verified.
function userCredentialsVerified(request, response, next) {
  const session = request.session;
  if (session.username)
    return next();

  return response.redirect("/");
}

module.exports = {
  userLoggedIn: userLoggedIn,
  userLoggedInDeny: userLoggedInDeny,
  doesUserHaveToken: doesUserHaveToken,
  user2FAcompleted: user2FAcompleted,
  userCredentialsVerified: userCredentialsVerified,
  adminLoggedIn: adminLoggedIn
};