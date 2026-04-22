import { io } from 'socket.io-client';

import { getSocketUrl } from '../config/backendHost';

const SOCKET_URL = getSocketUrl();

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
