// Simple TypeScript test
const message: string = 'Hello from TypeScript!';
console.log(message);

// Test a simple async function
async function testAsync() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Async test completed!');
      resolve(true);
    }, 1000);
  });
}

// Run the test
testAsync().then(() => {
  console.log('All tests completed successfully!');  
});
