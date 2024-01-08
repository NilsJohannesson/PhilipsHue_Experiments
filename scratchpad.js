// Given JSON
const jsonString = `{
    "state": {
        "on": true,
        "bri": 254,
        "hue": 45046,
        "sat": 250,
        "effect": "none",
        "xy": [0.1583, 0.1142],
        "ct": 153,
        "alert": "select",
        "colormode": "hs",
        "mode": "homeautomation",
        "reachable": true
    }
}`;

// Parse the JSON
const parsedJson = JSON.parse(jsonString);

// Extract the first 4 entries from the "state" object
const { on, bri, hue, sat, effect } = parsedJson.state;

// Create a new object with only the first 4 entries
const firstFourEntries = { on, bri, hue, sat, effect };

// Log the result
console.log(firstFourEntries);
