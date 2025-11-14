const fs = require('fs');

// Note: use the script from the terminal like this:
// eg:
// node clearJSON.js ../data/csvjson.json Premiere watchtime
// node clearJSON.js ../data/csvjson.json "Watchtime in Million"
function removeKeysFromFile(jsonFilePath, keysToRemove) {
  // Read the JSON file
  const jsonData = fs.readFileSync(jsonFilePath);

  try {
    const jsonArray = JSON.parse(jsonData);

    // If keysToRemove is not an array, convert it to an array with one element
    if (!Array.isArray(keysToRemove)) {
      keysToRemove = [keysToRemove];
    }

    jsonArray.forEach(obj => {
      // Remove specified keys along with their values from each object
      keysToRemove.forEach(key => {
        const lowercaseKey = key.toLowerCase();

        Object.keys(obj).forEach(objKey => {
          if (objKey.toLowerCase() === lowercaseKey) {
            delete obj[objKey];
          }
        });
      });
    });

    // Return the modified JSON array
    return jsonArray;
  } catch (error) {
    console.error('Error parsing JSON file:', error);
    return null;
  }
}

// Get command-line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node clearJSON.js <jsonFilePath> <key1> [key2 ...]');
  process.exit(1);
}

const jsonFilePath = args[0];
const keysToRemove = args.slice(1);

// Modify the JSON file
const modifiedJsonArray = removeKeysFromFile(jsonFilePath, keysToRemove);

if (modifiedJsonArray !== null) {
  // Write the modified JSON back to the file
  fs.writeFileSync(jsonFilePath, JSON.stringify(modifiedJsonArray, null, 2));
  console.log('JSON file cleared successfully.');
}
