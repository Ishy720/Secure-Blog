//track request holder
const requestIPTracker = {};

const requestLimit = 20; // max requests in period
const requestTimeout = 10 * 1000; // time period

function limitCallRate(request, response, next) {

    //get sender IP
    const ip = request.ip;

    //get current time
    const now = Date.now();

    //check ip exceeded request limit
    if (requestIPTracker[ip]) {
        //if same ip has too many requests before timeout period
        if (requestIPTracker[ip].count >= requestLimit && now - requestIPTracker[ip].timestamp < requestTimeout) {
            return response.status(429).json({ error: "Too many requests, please try again later." });
        }

        //check IP exceeded request limit but timeout passed, if so reset request count
        if (now - requestIPTracker[ip].timestamp > requestTimeout) {
            requestIPTracker[ip].count = 0;
            requestIPTracker[ip].timestamp = now;
        }
    } else {
        //first request from ip, initialize the request count and timestamp
        requestIPTracker[ip] = {
            count: 0,
            timestamp: now
        };
    }

    //increment ip request counter
    requestIPTracker[ip].count++;

    //proceed to endpoint
    return next();
}

/*
//function to clean out inactive IPs from array tracker for memory management, as scalability of users will cause memory issues
function cleanInactiveIPs() {  

    const now = Date.now();

    for (const ip in requestIPTracker) {
        if (now - requestIPTracker[ip].timestamp > inactiveTimeout) {
            delete requestIPTracker[ip];
        }
    };
};

//call ip cleaner every 240 seconds
const inactiveTimeout = 240 * 1000; // time period in ms after ip is deemed inactive
setInterval(cleanInactiveIPs, inactiveTimeout);
*/


module.exports = { 
  limitCallRate: limitCallRate
};