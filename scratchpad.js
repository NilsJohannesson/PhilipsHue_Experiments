const booleanArray = [false, false, false, false, false];
const offset = 1000;

function toggleBooleanWithDelay(index) {
  setTimeout(() => {
    booleanArray[index] = !booleanArray[index];
    console.clear();
    console.log(booleanArray); // Optional: Print the updated array

    setTimeout(() => {
        booleanArray[index] = !booleanArray[index];
        console.clear();
        console.log(booleanArray); // Optional: Print the updated array
    },offset);

    toggleBooleanWithDelay((index + 1) % booleanArray.length);
  }, 1000);
}

toggleBooleanWithDelay(0);
