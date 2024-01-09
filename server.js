const axios = require('axios');

const selectedLight = 5;
const lightsAmount = 5;
const flickerSpeed = 1000;

const red = "#D81B2E";
const green = "#88DC1B";
const blue = "#103DDF";


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

    // for(var i = 1; i <= lightsAmount; i++){
    //     putRequest(i, payload2);
    // }
    putRequest(5, payload2);

    //console.log(lightOn);
    
}

function convertHslToPh(hue){
    //calculate percentage
    const percentage = hue / (360 / 100);
    const newHue = Math.floor((65025 / 100) * percentage);
    
    return newHue;
    
}

function hexToHsl(hex) {
    // Remove the hash character if it's present
    hex = hex.replace(/^#/, '');
  
    // Convert hex to RGB
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    // Normalize RGB values to the range [0, 1]
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
  
    // Find the maximum and minimum values among R, G, and B
    const max = Math.max(normalizedR, normalizedG, normalizedB);
    const min = Math.min(normalizedR, normalizedG, normalizedB);
  
    // Calculate the lightness
    let l = (max + min) / 2;
  
    // Calculate the saturation
    let s, h;
    if (max === min) {
      s = h = 0; // achromatic
    } else {
      s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  
      switch (max) {
        case normalizedR:
          h = (normalizedG - normalizedB) / (max - min) + (normalizedG < normalizedB ? 6 : 0);
          break;
        case normalizedG:
          h = (normalizedB - normalizedR) / (max - min) + 2;
          break;
        case normalizedB:
          h = (normalizedR - normalizedG) / (max - min) + 4;
          break;
      }
  
      h /= 6;
    }
  
    // Convert HSL values to degrees and percentages
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
  
    return { h, s, l };
  }

  function remap(value, fromLow, fromHigh, toLow, toHigh) {
    // Ensure the value is within the original range
    const clampedValue = Math.min(Math.max(value, fromLow), fromHigh);
  
    // Calculate the percentage of the value within the original range
    const percentage = (clampedValue - fromLow) / (fromHigh - fromLow);
  
    // Map the percentage to the new range
    const newValue = percentage * (toHigh - toLow) + toLow;
  
    return newValue;
  }

function changeColor(){
    // Listen for key events on stdin
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
    const key = chunk.toString().trim();

    // Check if the pressed key is 'r'
    if (key === 'r') {
        let r = hexToHsl(red);
        r.h = convertHslToPh(r.h);
        r.s = Math.round(remap(r.s, 0, 100, 0, 255));
        r.l = Math.round(remap(r.l, 0, 100, 0, 255));
        //console.log(r.s);
        putRequest(5, {
            "bri": r.l,
            "hue": r.h,
            "sat": r.s,
        });
    }
    else if (key === 'g') {
        let g = hexToHsl(green);
        g.h = convertHslToPh(g.h);
        g.s = Math.round(remap(g.s, 0, 100, 0, 255));
        g.l = Math.round(remap(g.l, 0, 100, 0, 255));
        //console.log(g.s);
        putRequest(5, {
            "bri": g.l,
            "hue": g.h,
            "sat": g.s,
        });
    }
    else if (key === 'b') {
        let b = hexToHsl(blue);
        b.h = convertHslToPh(b.h);
        b.s = Math.round(remap(b.s, 0, 100, 0, 255));
        b.l = Math.round(remap(b.l, 0, 100, 0, 255));
        //console.log(b.s);
        putRequest(5, {
            "bri": b.l,
            "hue": b.h,
            "sat": b.s,
        });
    }
    });

    console.log('Press "R, G or B" to change the color!');
}
    
//PROGRAM STARTS HERE

//this all needs to be inside a for loop for all lights
// for(var i = 1; i <= lightsAmount; i++){
//     getOriginalState();
//     changeColor();
// }

getOriginalState();

const intervalId = setInterval(flickerLight, flickerSpeed);

changeColor();

quitProgram();



