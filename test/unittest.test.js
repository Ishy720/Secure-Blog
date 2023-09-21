const assert = require("assert");

const { prepareQuery, prepareStatement } = require("../Source/Engines/parameterizationEngine");
const { sanitizeSQLContent, sanitizeXSSContent } = require("../Source/Engines/sanitizationEngine");
const { limitCallRate } = require('../Source/Engines/limitCallEngine');
const { delay } = require('../Source/Engines/sleepEngine');
const { generateRandomString } = require('../Source/Engines/utilityEngine');

describe('Parameterization Engine Tests', function() {

    it("Testing query sanitization", function() {
        const query = prepareQuery("SELECT * FROM myDatabase WHERE information = $1", "administrator\"--");
        const statement = prepareStatement(query);
        const expected = `SELECT * FROM myDatabase WHERE information = 'administrator'`;

        assert.equal(statement, expected);
    });

});

describe('Sanitization Engine Tests', function() {

    describe('sanitizeSQLContent', function() {
        it('Remove SQL injection characters from input', function() {
            const input = 'SELECT * FROM users WHERE username = "admin"; DROP TABLE users--';
            const expectedOutput = 'SELECT  FROM users WHERE username = admin DROP TABLE users';
            assert.equal(sanitizeSQLContent(input), expectedOutput);
        });
        
        it('Remove specified placeholder characters from input', function() {
            const input = 'This string has "double quotes", \'single quotes\', asterisks*, semicolons;, and hyphens-.';
            const expectedOutput = 'This string has double quotes, single quotes, asterisks, semicolons, and hyphens.';
            assert.equal(sanitizeSQLContent(input), expectedOutput);
        });
    });

    describe('sanitizeXSSContent', function() {
        it('Remove "/" characters from input', function() {
            const input = '<img src="/pepe.jpg">';
            const expectedOutput = 'img src="pepe.jpg"';
            assert.equal(sanitizeXSSContent(input), expectedOutput);
        });

        it('Remove "<" and ">" characters from input', function() {
            const input = '<script>alert("noob");</script>';
            const expectedOutput = 'scriptalert("noob");script';
            assert.equal(sanitizeXSSContent(input), expectedOutput);
        });

    });

});

describe('DOS Prevention Engine Tests', () => {
    beforeEach(() => {
      // Reset the requestIPTracker before each test
      requestIPTracker = {};
    });
  
    it('Allow the request if the IP has not exceeded the request limit', (done) => {
      const request = { ip: '1.2.3.4' };
      const response = { status: (code) => ({ json: (data) => {
        assert.strictEqual(code, 200);
        assert.deepStrictEqual(data, { success: true });
        done();
      } })};
      limitCallRate(request, response, () => {
        response.status(200).json({ success: true });
      });
    });

});

describe('CSRF Token Engine Tests', () => {

    const alphanumericRegex = /^[a-zA-Z0-9]+$/i;

    it('Check CSRF token is alphanumeric', function() {

        assert(alphanumericRegex.test(generateRandomString(10)));

    });

    it('Check engine provides expected token length', function() {

        assert(generateRandomString(10).length == 10);
        
    });

    it('Check engine generates unique tokens across 5,000 trials', function() {

        const tokenArray = [];

        for(let i = 0; i < 5000; i++) {

            const csrfToken = generateRandomString(10);

            tokenArray.push(csrfToken);

            assert(tokenArray.length === new Set(tokenArray).size);
        };


        
    });

});


describe('Message Delay Engine Tests', function() {
    it('Should delay for >= 500 ms', async function() {
      const start = new Date();
      await delay(500);
      const end = new Date();
      const elapsed = end - start;
      assert.ok(elapsed >= 500, 'Elapsed time should be at least 500ms');
    });
  
    it('Should delay for >= 1000 ms', async function() {
      const start = new Date();
      await delay(1000);
      const end = new Date();
      const elapsed = end - start;
      assert.ok(elapsed >= 1000, 'Elapsed time should be at least 1000ms');
    });
  
    it('Should delay for >= 1500 ms', async function() {
      const start = new Date();
      await delay(1500);
      const end = new Date();
      const elapsed = end - start;
      assert.ok(elapsed >= 1500, 'Elapsed time should be at least 2000ms');
    });
});






