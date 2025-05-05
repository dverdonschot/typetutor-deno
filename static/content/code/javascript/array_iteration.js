const fruits = ["Apple", "Banana", "Cherry", "Date"];

function logArrayElements(arr) {
  console.log("Logging array elements:");
  for (let i = 0; i < arr.length; i++) {
    console.log(`Index ${i}: ${arr[i]}`);
  }
}

function logWithForEach(arr) {
  console.log("Logging with forEach:");
  arr.forEach((element, index) => {
    console.log(`Item ${index + 1}: ${element}`);
  });
}

logArrayElements(fruits);
logWithForEach(fruits);