const axios = require('axios');

const selectedLight = 5;
const lightsAmount = 5;
const flickerSpeed = 1000;
const animateSpeed = 500;
const colorLoopSpeed = 10000;
const colorLoopUpdateSpeed = 500;
const offset = 500;
const booleanArray = [false, false, false, false, false];
const lightsOrder = [4, 5, 2, 3, 1];

const red = "#D81B2E";
const green = "#88DC1B";
const blue = "#103DDF";

const exitMessage = `
▄▄▄ .▐▄• ▄ ▪  ▄▄▄▄▄▪   ▐ ▄  ▄▄ •      ▄▄▄·▄▄▄         ▄▄ • ▄▄▄   ▄▄▄· • ▌ ▄ ·. 
▀▄.▀· █▌█▌▪██ •██  ██ •█▌▐█▐█ ▀ ▪    ▐█ ▄█▀▄ █·▪     ▐█ ▀ ▪▀▄ █·▐█ ▀█ ·██ ▐███▪
▐▀▀▪▄ ·██· ▐█· ▐█.▪▐█·▐█▐▐▌▄█ ▀█▄     ██▀·▐▀▀▄  ▄█▀▄ ▄█ ▀█▄▐▀▀▄ ▄█▀▀█ ▐█ ▌▐▌▐█·
▐█▄▄▌▪▐█·█▌▐█▌ ▐█▌·▐█▌██▐█▌▐█▄▪▐█    ▐█▪·•▐█•█▌▐█▌.▐▌▐█▄▪▐█▐█•█▌▐█ ▪▐▌██ ██▌▐█▌
 ▀▀▀ •▀▀ ▀▀▀▀▀ ▀▀▀ ▀▀▀▀▀ █▪·▀▀▀▀     .▀   .▀  ▀ ▀█▄▀▪·▀▀▀▀ .▀  ▀ ▀  ▀ ▀▀  █▪▀▀▀
`;

var lightOn = true;
const url = 'http://192.168.1.156/api/g7xwFaHHCPBqPYhM2fYWdnEnIZYvw6AjRQotNFc5'
var originalState = '';
var originalStates = [];
var payload2 = {};
var requestsFinished = 0;
const intervalId = null;



// ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████ 
// ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██      
// █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████ 
// ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██ 
// ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████ 



function getOriginalState(lightNr){
    let includesHue = false;

    axios.get(url + '/lights/' + lightNr)
        .then(result => {
            //resulting json is already a javascript object and does not need to be JSON.Parse'd 
            //extract only necessary parameters
            const { on, bri, ct, hue, sat, effect } = result.data.state;
            originalState = { on, bri, ct, hue, sat, effect };

            //filter out undefined entries
            const originalStateFiltered1 = Object.entries(originalState).filter(([key, value]) => value !== undefined);

            //convert it back to JSON and check if hue exists
            let originalStateFiltered2 = Object.fromEntries(originalStateFiltered1);
            if('hue' in originalStateFiltered2){
                includesHue = true;
            }

            // if hue is in the json > convert to Objects > remove ct > convert back to JSON
            if(includesHue){
                originalStateFiltered2 = Object.entries(originalStateFiltered2).filter(([key, value]) => key !== 'ct');
                originalStates.push( Object.fromEntries(originalStateFiltered2));
            }
            // if not, do not convert
            else{
                originalStates.push(originalStateFiltered2);
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function putRequest(lightNr, payload){
    axios.put(url + '/lights/' + lightNr + '/state', payload)
    .then(result => {
        
        // TO-DO
        // Many times hue api responds with custom error messages,
        // these are also json objects and are of key "error".
        // write a check for this error message and force throw new error

        // if (result.data.includes('error')) {
        //     console.log("YOOOOOOOOOOOOOOO");
        //     throw new Error('Server returned an error');
        // }
        //console.log(result.data);
    })
    .catch(error => {
        console.log(error);
    });
}

async function toOriginalState(lightNr){
   return axios.put(url + '/lights/' + lightNr + '/state', originalStates[lightNr-1])
        .then(result => {
            //console.log(result.data);
            console.log("Turned light nr. " + lightNr + " back on");
            return result.data;
  
        })
        .catch(error => {
            console.log(error);
            throw error;
        });
}

async function allLightsToOriginalState(callback){
    const promises = [];

    for(var i = 1; i <= lightsAmount; i++) {
        promises.push(toOriginalState(i));
    }

    try {
        const results = await Promise.all(promises);
        console.log("ALL " + results.length + " LIGHTS TURNED ON");
        callback();
    } catch (error) {
        console.log("An error occurred: ", error);
    }
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
        if(intervalId != null){
            clearInterval(intervalId);
        }
        

        allLightsToOriginalState(() => {
            exitProgram();
        })
        //allLightsToOriginalState(exitProgram);
    }
    });

    console.log('Press "q" to stop the program...');
}

function exitProgram(){
    console.log(exitMessage);
    process.exit();
}

function lightsOff(){
    for(var i = 1; i <= lightsAmount; i++){
        putRequest(i + 1, {"on": false});
    }
}

function flickerLight(){
    // Toggle the value of lightOn
    lightOn = !lightOn;

    // Update payload2 with the current value of lightOn
    payload2 = {"on": lightOn};

    for(var i = 1; i <= lightsAmount; i++){
        putRequest(i, payload2);
    }

    //putRequest(5, payload2);

    //console.log(lightOn);
    
}

function loopColors(){
    for(var i = 1; i <= lightsAmount; i++){
        putRequest(i + 1, {"effect": "colorloop"});
    }
}

function customColorLoop(index){
    const currentTime = new Date();
    const elapsedTime = currentTime - startTime;
    setTimeout(() => {
        booleanArray[index] = !booleanArray[index];

        const newHue = (Math.round(remap((elapsedTime % colorLoopSpeed), 0, colorLoopSpeed, 0, 65025)));
        let payload = {"hue": newHue};

        console.log(lightsOrder[index]);
        putRequest(lightsOrder[index], payload);

        customColorLoop((index + 1) % 2);

        //console.log(elapsedTime + "  < Elapsed time & Hue value >  " + newHue);
        
    }, colorLoopUpdateSpeed);
}

function animateLights(index) {

    setTimeout(() => {
        booleanArray[index] = !booleanArray[index];
        let payload = {"on": (booleanArray[index])};
        putRequest(lightsOrder[index], payload);
    
        setTimeout(() => {
            booleanArray[index] = !booleanArray[index];

            let payload = {"on": (booleanArray[index])};
            putRequest(lightsOrder[index], payload);
        },offset);
    
        animateLights((index + 1) % booleanArray.length);
    }, animateSpeed);
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

function changeColor(lightNr){
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
        putRequest(lightNr, {
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
        putRequest(lightNr, {
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
        putRequest(lightNr, {
            "bri": b.l,
            "hue": b.h,
            "sat": b.s,
        });
    }
    });
}
    

// ██████  ██████   ██████   ██████  ██████   █████  ███    ███     ███████ ████████  █████  ██████  ████████ ███████     ██   ██ ███████ ██████  ███████ 
// ██   ██ ██   ██ ██    ██ ██       ██   ██ ██   ██ ████  ████     ██         ██    ██   ██ ██   ██    ██    ██          ██   ██ ██      ██   ██ ██      
// ██████  ██████  ██    ██ ██   ███ ██████  ███████ ██ ████ ██     ███████    ██    ███████ ██████     ██    ███████     ███████ █████   ██████  █████   
// ██      ██   ██ ██    ██ ██    ██ ██   ██ ██   ██ ██  ██  ██          ██    ██    ██   ██ ██   ██    ██         ██     ██   ██ ██      ██   ██ ██      
// ██      ██   ██  ██████   ██████  ██   ██ ██   ██ ██      ██     ███████    ██    ██   ██ ██   ██    ██    ███████     ██   ██ ███████ ██   ██ ███████ 


console.log('Press "R, G or B" to change the color!');

for(var i = 1; i <= lightsAmount; i++){
    getOriginalState(i);
    changeColor(i);
}

const startTime = new Date();

lightsOff();
animateLights(0);

//customColorLoop(0);
//intervalId = setInterval(flickerLight, flickerSpeed);

quitProgram();


// //debug
// for(var i = 1; i <= lightsAmount; i++){
//     getOriginalState(i);
// }
// setTimeout(function () {console.log(originalStates)}, 2000);



