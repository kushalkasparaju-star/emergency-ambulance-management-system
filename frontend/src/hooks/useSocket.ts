import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(socketUrl);
    }
    setSocket(socketInstance);
  }, []);

  return socket;
};
