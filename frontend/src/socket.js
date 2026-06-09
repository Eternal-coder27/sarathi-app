import { io } from 'socket.io-client';

// Connect directly to your Node.js backend port
const socket = io('http://localhost:5000'); 

export default socket;