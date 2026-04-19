import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.6:5000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Connected to Sanctuary Socket Server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from Sanctuary Socket Server');
});

socket.on('connect_error', (error) => {
  console.error('Socket Connection Error:', error);
});
