function addNumbers(num1, num2) {
  // Check if both inputs are numbers
  if (typeof num1 !== 'number' || typeof num2 !== 'number') {
    return "Please provide two numbers.";
  }
  // Return the sum
  return num1 + num2;
}

// Example usage:
const sum = addNumbers(5, 10);
console.log(sum); // Output: 15