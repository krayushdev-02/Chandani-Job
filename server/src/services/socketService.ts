import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger';

export class SocketService {
  private static io: SocketIOServer | null = null;
  private static userSockets = new Map<string, string>(); // userId -> socketId

  public static initialize(server: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Adjust in production
        methods: ['GET', 'POST'],
      },
    });

    logger.info('Initializing Socket.io Orchestrator');

    this.io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Handle user registration
      socket.on('register_user', (userId: string) => {
        if (userId) {
          this.userSockets.set(userId, socket.id);
          logger.info(`User ${userId} bound to socket ${socket.id}`);
          
          // Emit user status changes
          socket.broadcast.emit('user_status', { userId, status: 'online' });
        }
      });

      // Join chat room
      socket.on('join_chat', (chatId: string) => {
        if (chatId) {
          socket.join(chatId);
          logger.info(`Socket ${socket.id} joined chat room: ${chatId}`);
        }
      });

      // Handle typing indicator
      socket.on('typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
        socket.to(data.chatId).emit('user_typing', data);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
        // Find and remove user mapping
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            logger.info(`User ${userId} unbound from sockets`);
            socket.broadcast.emit('user_status', { userId, status: 'offline' });
            break;
          }
        }
      });
    });

    return this.io;
  }

  /**
   * Broadcast message to a specific room
   */
  public static sendToChatRoom(chatId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(chatId).emit(event, payload);
    }
  }

  /**
   * Send notification direct to a specific online user
   */
  public static sendToUser(userId: string, event: string, payload: any): boolean {
    if (this.io) {
      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.io.to(socketId).emit(event, payload);
        return true;
      }
    }
    return false;
  }
}
