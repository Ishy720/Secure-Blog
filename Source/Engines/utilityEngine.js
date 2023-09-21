function generateRandomString(length) {
    let result = "";
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function hashValue(specifiedValue, saltDisplacer) {
    const deconstructedString = specifiedValue.split("");
    //Special prime constant for effective hash generation based off of some complicated maths ingenuity.
    const gConstant = 31;
    //Randomly decided salt to add to final hash for diversity.
    const saltConstant = 12865 + saltDisplacer;
    let constructedHash = 0;

    deconstructedString.forEach(function(character) {
        //Extract the ASCII code of the character in the deconstructed string array.
        const extractedCharacterCode = character.charCodeAt(0);
        //Extract where this character occurs in the original string to create dynamic hashes from similar strings. "Charlie" <-> "harClie"
        const extractedCharacterIndex = specifiedValue.indexOf(character);
        //Multiply the ASCII code to the power of the (character index + 1) to avoid it generating a value of was since (value ** 0 = 1) and multiply by the constant.
        const encryptedValue = extractedCharacterCode ** (extractedCharacterIndex + 1) * gConstant;
        //Add our salt constant to our hashed value for diversity.
        const saltedValue = encryptedValue + saltConstant;
        constructedHash += saltedValue;
    });

    return constructedHash;
}

function encryptString(designatedString) {
    //Designate unique for XOR encryption.
    const xorCipherKey = 16281;
    //Designate unique salt value to mitigate attempts at XOR bruteforcing.
    const saltValue = 267918;
    const alphabet = "abcdefghiklmnopqrstuvwxyz";
    const deconstructedString = designatedString.split("");
    let generatedStringCode = "";

    deconstructedString.forEach(function(character) {
        //Generate random lower-case letter to add to encrypted string.
        const randomCharacter = alphabet[Math.floor(Math.random() * alphabet.length)];
        //Extract the ASCII value of the character.
        const characterCode = character.charCodeAt(0);
        //XOR Encrypt ASCII value  of character including the addition of the salt value.
        const encryptedCode = (characterCode ^ xorCipherKey) + saltValue;
        generatedStringCode += encryptedCode + randomCharacter;
    });

    return generatedStringCode;
}

function decryptString(designatedString) {
    //Designate unique for XOR decryption.
    const xorCipherKey = 16281;
    //Designate unique salt value to decrypt XOR value.
    const saltValue = 267918;
    const cleanedCodeArray = [];
    //Remove random lower-case alphabet characters from encrypted while seperating encrypted ASCII codes.
    const cleanedString = designatedString.replace(/[a-z]/g, " ");
    const seperatedCodes = cleanedString.split(" ");
    //Remove trailing whitespace.
    seperatedCodes.pop();
    seperatedCodes.forEach(function(code) {
        //Decrypt individual encrypted ASCII codes and push to array.
        const decryptedCode = (code - saltValue) ^ xorCipherKey;
        cleanedCodeArray.push(decryptedCode);
    });

    //Generate completed string from decrypted ASCII codes.
    return String.fromCharCode(...cleanedCodeArray);
}

function validateValue(specifiedValue) {
    return (specifiedValue == "" || specifiedValue == null);
}

//Implemented function to retrieve ASCII value of string for hashing function.
function retrieveASCIIValue(specifiedString)
{
    let constructedValue = 0;
    for (let i = 0; i < specifiedString.length; i++)
    {
        const retrievedCharCode = specifiedString.charCodeAt(i);
        constructedValue += retrievedCharCode;
    }

    return constructedValue;
}

module.exports = {
    generateRandomString: generateRandomString,
    hashValue: hashValue,
    encryptString: encryptString,
    decryptString: decryptString,
    validateValue: validateValue,
    retrieveASCIIValue: retrieveASCIIValue
};
