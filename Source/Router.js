const {app, serveView, join} = require("../server.js");
const {allocateUser, fetchUser, fetchUser2FAstatus, saveUser2FAstatusAndSecret, fetchUser2FAsecret} = require("./Database/UserEngine.js");
const {allocatePost, deallocatePost,  editPost, fetchPostsByUser, fetchPost, fetchPosts, flagPost, searchPost} = require("./Database/BlogEngine.js");
const {userLoggedIn, userLoggedInDeny, doesUserHaveToken, user2FAcompleted, userCredentialsVerified, adminLoggedIn} = require("./Middleware.js");
const {generateRandomString, hashValue, decryptString, validateValue, retrieveASCIIValue} = require("./Engines/UtilityEngine.js");
const {delay} = require("./Engines/SleepEngine.js");
const {limitCallRate} = require("./Engines/limitCallEngine.js");
const { authenticator } = require("otplib");
const qrcode = require("qrcode");
const { sanitizeXSSContent } = require("./Engines/SanitizationEngine.js");

//Initiate and server simplistic GET routes to all specified pages with specified middleware.
serveView("login");
serveView("error");
serveView("register", null, userLoggedInDeny);
serveView("addPost", null, userLoggedIn, user2FAcompleted);
serveView("2FA", null, userCredentialsVerified);

//Route for index page.
app.get("/", limitCallRate, function(request, response) {
  fetchPosts().then(function(posts) {
      response.render("index", {session: request.session, posts: posts});
  });
});

//Route for account page.
app.get("/account", limitCallRate, userLoggedIn, function(request, response) {
  const session = request.session;
  console.log(session.userID);
  fetchPostsByUser(session.userID.toString()).then(function(posts) {
      response.render("account", {session: session, posts: posts});
  }).catch(error => console.error(error));
});

//Route for admin page.
app.get("/admin", userLoggedIn, adminLoggedIn, user2FAcompleted, function(request, response) {
  fetchPosts().then(function(posts) {
    const flaggedPosts = posts.filter(post => post.flagged == true);
    response.render("admin", {session: request.session, posts: flaggedPosts});
  });
});

//Route to view a post with a specified postID
app.get("/viewPost/:postID", limitCallRate, function(request, response) {
  const {postID} = request.params;

  fetchPost(postID).then(function(retrievedData) {

    if (retrievedData.length == 0) {
      return response.render("post", {session: request.session, post: {
        title: "Sorry, we couldn't find this post!",
        subTitle: "Could you be here by mistake?",
        content: "Explore more posts on your home tab!",
        image: "/assets/img/post-bg.jpg",
        posterName: "A spooky ghost!"
      }});
    } else {
      const [extractedInformation] = retrievedData;
      const {title, subtitle, content, postername} = extractedInformation;
      const preparedImage = extractedInformation.image.replace(/\\/g, "/").slice(6);

      return response.render("post", {session: request.session, post: {
        title: title,
        subTitle: subtitle,
        content: content,
        image: preparedImage,
        posterName: postername
      }});
    }
  });
});

//Route to edit a post with a specified postD
app.get("/editPost/:postID", limitCallRate, userLoggedIn, user2FAcompleted, function(request, response) {
  const {postID} = request.params;

	fetchPost(postID).then(function(retrievedData) {
		if (retrievedData.length == 0)
			return response.redirect("/error");
		else {
			const [extractedInformation] = retrievedData;
			const {title, subtitle, posterid, content} = extractedInformation;

			if (request.session.userID != posterid)
				return response.redirect("/error");

			response.render("editPost", {session: request.session, post: {
        title: title,
        subTitle: subtitle,
        content: content,
				postID: postID
      }});
		}
	});
});

//Route to register an account.
app.post("/registerAccount", limitCallRate, async function(request, response) {

  //start timer
  const startTimestamp = Date.now();

  const userInformation = request.body;
  const session = request.session;
  const {username, password, firstName} = userInformation;

  session.error = [];

  if (validateValue(username))
    session.error.push("[ERROR] Please provide a username!");

  if (validateValue(password))
    session.error.push("[ERROR] Please provide a password!");

  if (validateValue(firstName))
    session.error.push("[ERROR] Please provide a first name!");

  if (session.error.length > 0)
    return response.redirect("/register");

  allocateUser(username, password, firstName).then(async function(creationResult) {
    if (creationResult) {

      session.username = username;
      session.firstName = firstName;

      return response.redirect("/2FA");

    } else {

      session.error = "[ERROR]: Please choose a different username.";
      
      return response.redirect("/register");

    }
  }).catch(function()
  {
    session.error = "ERROR: Please choose a different username.";
    return response.redirect("/register");
  });
});

//Route to setup 2 factor authentication.
app.post("/setup2FA", limitCallRate, userCredentialsVerified, async function(request, response) {
  const session = request.session;
  const is2FAsetup = (await fetchUser2FAstatus(session.username))[0].MFA;

  if (!is2FAsetup) {
    session.secret = authenticator.generateSecret();
    //Generates 2FA QR code for Google Authenticator
    const url = await qrcode.toDataURL(authenticator.keyuri(session.username, "PLZ NO HACKERINO", session.secret));
    return response.json({is2FAsetup: false, url: url});
  }

  return response.json({is2FAsetup: true});
});

//Route to initialize 2 factor authentication.
app.post("/initiate2FA", limitCallRate, userCredentialsVerified, async function(request, response) {
  const {_2FA} = request.body;
  const session = request.session;

  if (!session.secret) {
    session.secret = (await fetchUser2FAsecret(session.username))[0].secret;
  }
  
  if (authenticator.check(_2FA, session.secret)) {
    session.isLoggedIn = true;
    session.is2FAcompleted = true;
    await saveUser2FAstatusAndSecret(session.username, session.secret);

    const [fetchedUser] = await fetchUser(session.username);
    const {ID, isadmin, firstname, username} = fetchedUser;
    session.userID = ID;
    session.isAdmin = isadmin;
    session.userCSRFToken = generateRandomString(500); 
    session.firstName = decryptString(firstname);
    session.username = username;
  }

  return response.redirect("/");
});

//Route for a user to login.
app.post("/initiateLogin", limitCallRate, async function(request, response) {

  //start timer
  const startTimestamp = Date.now();

  const userInformation = request.body;
  const session = request.session;
  const {username, password} = userInformation;

  fetchUser(username).then(async function(fetchResult) {
    if (fetchResult.length == 0) {
      console.log("[ERROR]: That user doesn't exist on the blog!");
      session.error = "[ERROR]: Invalid username/password!";

      //end timer
      const endTimestamp = Date.now();

      //calculate time taken for main code to complete
      const timeTaken = endTimestamp - startTimestamp;

      //calculate remaining delay time
      const remainingTime = 1500 - timeTaken;

      //delay the response
      await delay(remainingTime);

      return response.redirect("/login");
    } else {
      const [extractedUserInformation] = fetchResult;
      const extractedPassword = extractedUserInformation.password;
      const extractedID = extractedUserInformation.ID;
      const isAdmin = extractedUserInformation.isadmin;
      const encryptedFirstName = extractedUserInformation.firstname;
      const saltValueShifter = retrieveASCIIValue(username);
      const hashedPostedPassword = hashValue(password, saltValueShifter);

      if (hashedPostedPassword != extractedPassword) {
        session.error = "[ERROR]: Invalid username or password provided!";

        //end timer
        const endTimestamp = Date.now();

        //calculate time taken for main code to complete
        const timeTaken = endTimestamp - startTimestamp;

        //calculate remaining delay time
        const remainingTime = 1500 - timeTaken;

        //delay the response
        await delay(remainingTime);

        return response.redirect("/login");
      }

      session.username = username;
      session.firstName = decryptString(encryptedFirstName);
      session.userID = extractedID;
      session.userCSRFToken = generateRandomString(500);
      session.isAdmin = isAdmin;

      return response.redirect("/2FA");

    }
  }).catch(error => console.error(error));

});

//Route to logout of the currently logged in account.
app.get("/initiateLogout", function(request, response) {
  request.session.destroy(function(error) {
      if (error) throw new Error(error);
      response.redirect("/");
  });
});

//Route to allocate a post to the database.
app.post("/allocatePost", limitCallRate, userLoggedIn, user2FAcompleted, doesUserHaveToken, function(request, response) {
  const session = request.session;
  const {username} = session;
  const postInformation = request.body;
  const {title, subtitle, content} = postInformation;

  if (!request.files)
    return response.status(400).send("You must provide an image for your blog post!");

  const {imageUpload} = request.files;
  const {mv, size} = imageUpload;

  if (size > 1000000 || size < 20000)
    return response.status(400).send("Image larger than 1MB or less than 20KB");

  const generatedFilePath = join(`./Source/UserImages/${username}/`, `${generateRandomString(10)}.png`);

  mv(generatedFilePath, async function(error) {
    if (error) return response.send(error);
    const cleanedTitle = sanitizeXSSContent(title);
    const cleanedSubTitle = sanitizeXSSContent(subtitle);
    const cleanedContent = sanitizeXSSContent(content);
    await allocatePost(cleanedTitle, cleanedSubTitle, cleanedContent, session.userID, generatedFilePath, username);
  });

  return response.redirect("/");
});

//Route to remove a post from the database.
app.post("/removePost", limitCallRate, userLoggedIn, user2FAcompleted, doesUserHaveToken, function(request, response) {
  const requestInformation = request.body;
  const {postID} = requestInformation;
  const {userID, isAdmin} = request.session;

  fetchPost(postID).then(async function(postData) {
    const [extractedInformation] = postData;
    const {posterid} = extractedInformation;

    console.log(`Poster: ${posterid} | User: ${userID}`);

    //If the user deleting the post owns it, or they're an admin delete it.
    if (userID == posterid || isAdmin) {
      await deallocatePost(postID); 
    }

    return response.redirect("/");
  });
});

//Route to edit a post.
app.post("/manipulatePost", limitCallRate, userLoggedIn, user2FAcompleted, doesUserHaveToken, function(request, response) {
	const requestInformation = request.body;
	const {title, subtitle, content, postID} = requestInformation;
  const {userID} = request.session;

  fetchPost(postID).then(async function(postData) {
    const [postInformation] = postData;
    const {posterid} = postInformation;

    if (userID == posterid) {
      const cleanedTitle = sanitizeXSSContent(title);
      const cleanedSubTitle = sanitizeXSSContent(subtitle);
      const cleanedContent = sanitizeXSSContent(content);
      await editPost(postID, cleanedTitle, cleanedSubTitle, cleanedContent);
      return response.redirect(`/viewPost/${postID}`);
    } else return response.redirect("/account");
  });


});

//Route to flag post.
app.post("/flagPost", limitCallRate, userLoggedIn, user2FAcompleted, doesUserHaveToken, function(request, response) {
  const requestInformation = request.body;
  const {postID} = requestInformation;
  flagPost(postID);
  return response.redirect("/");
});

//Route to search posts within the database.
app.post("/initiatePostSearch", limitCallRate, function(request, response) {
  const requestInformation = request.body;
  const {searchQuery} = requestInformation;
  searchPost(searchQuery).then(function(discoveredPosts) {
    response.render("searchResults", {session: request.session, posts: discoveredPosts});
  });
});

app.use(function(request, response, next) {
    response.redirect("/error");
});
