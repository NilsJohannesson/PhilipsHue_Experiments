const axios = require('axios');

const selectedLight = 5;
const lightsAmount = 5;
const flickerSpeed = 1000;

var lightOn = true;
const url = 'http://192.168.1.156/api/g7xwFaHHCPBqPYhM2fYWdnEnIZYvw6AjRQotNFc5'
var originalState = '';
var payload1 = {
    "on": false,
    "bri": 255,
    "hue": 45046,
    "sat": 250,
    "effect": "none"
    }
var payload2 = {"on": lightOn}

function getOriginalState(){
    axios.get('http://192.168.1.156/api/g7xwFaHHCPBqPYhM2fYWdnEnIZYvw6AjRQotNFc5/lights/' + selectedLight)
        .then(result => {
            //resulting json is already a javascript object and does not need to be JSON.Parse'd 
            //extract only necessary parameters
            const { on, bri, hue, sat, effect } = result.data.state;
            originalState = { on, bri, hue, sat, effect };

            //console.log(originalState);
        })
        .catch(error => {
            console.log(error);
        });
}

function putRequest(lightNr, payload){
    axios.put(url + '/lights/' + lightNr + '/state', payload)
    .then(result => {
        //console.log(result.data);
    })
    .catch(error => {
        console.log(error);
    });
}

function toOriginalState(){
    axios.put(url + '/lights/5/state', originalState)
        .then(result => {
            //console.log(result.data);
            console.log("Turned light back on");
            exitProgram();
        })
        .catch(error => {
            console.log(error);
        });
}

function quitProgram(){
    // Listen for key events on stdin
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
    const key = chunk.toString().trim();

    // Check if the pressed key is 'q'
    if (key === 'q') {
        // Stop the interval, return to original state and exit the program
        clearInterval(intervalId);
        toOriginalState();
    }
    });

    console.log('Press "q" to stop the program...');
}

function exitProgram(){
    process.exit();
}


function flickerLight(){
    // Toggle the value of lightOn
    lightOn = !lightOn;

    // Update payload2 with the current value of lightOn
    payload2 = {"on": lightOn};

    for(var i = 1; i <= lightsAmount; i++){
        putRequest(i, payload2);
    }

    //console.log(lightOn);
    
}

function changeColor(){
    // Listen for key events on stdin
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
    const key = chunk.toString().trim();

    // Check if the pressed key is 'r'
    if (key === 'r') {
        putRequest({"hue": 0});
    }
    else if (key === 'g') {
        putRequest({"hue": 20000});
    }
    else if (key === 'b') {
        putRequest({"hue": 43000});
    }
    });

    console.log('Press "R, G or B" to change the color!');
}
    
//PROGRAM STARTS HERE

//this all needs to be inside a for loop for all lights
for(var i = 1; i <= lightsAmount; i++){
    getOriginalState();
    changeColor();
}

getOriginalState();

changeColor();

const intervalId = setInterval(flickerLight, flickerSpeed);

quitProgram();



