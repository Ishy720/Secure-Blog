/*
//less precise timing
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 
*/

function delay(time) {
    return new Promise(resolve => {
        //start high res timer
        const start = process.hrtime();

        //ugly yet hilarious way to convert from nano to ms. Using max to make sure time delay isn't negative.
        const delayTime = Math.max(0, time - ((process.hrtime(start)[1] / 1e6) | 0));

        //set timeout of specified input time
        setTimeout(resolve, delayTime);
    });
}

module.exports = {
    delay: delay
};
