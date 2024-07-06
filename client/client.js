const io = require('socket.io-client');
const readline = require('readline');

// Extract chat room ID from command-line arguments
const chatRoomId = process.argv[2];

// Validate chat room ID
if (!chatRoomId) {
  console.error('Error: Please provide a chat room ID.');
  process.exit(1);
}

// Connect to WebSocket server
const socket = io('http://localhost:3000', {
  query: { chatRoomId }
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Enter message (or type "exit" to quit): '
});

// Event: when connected to the server
socket.on('connect', () => {
  console.log(`Connected to WebSocket server in chat room ${chatRoomId}`);
  rl.prompt(); // Prompt for user input
});

// Event: when disconnected from the server
socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
  rl.close(); // Close readline interface
});

// Event: handle regular messages from the server
socket.on('message', (msg) => {
  console.log('\nReceived message:', msg.content); // Log the message content
  rl.prompt(); // Prompt again for user input
});

// Event: handle errors
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  rl.close(); // Close readline interface on error
});

// Listen for user input
rl.on('line', (input) => {
  if (input.toLowerCase() === 'exit') {
    socket.disconnect(); // Disconnect from the WebSocket server
    rl.close(); // Close readline interface
  } else {
    // Send the message to the server with chat room ID
    socket.emit('message', { chatRoomId, content: input });
    rl.prompt(); // Prompt again for user input
  }
});

// Start the readline interface
rl.prompt();
