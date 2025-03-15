// src/guards/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient();
      const token = client.handshake.query.token as string;

      if (!token) {
        this.logger.warn('No token provided for WebSocket connection');
        throw new WsException('Authentication error: No token provided');
      }

      try {
        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jwt.verify(token, secret);
        // Save decoded user info to the client object
        (client as any).user = decoded;
        return true;
      } catch (error) {
        this.logger.error('JWT verification failed', error);
        throw new WsException('Authentication error: Invalid token');
      }
    } catch (error) {
      this.logger.error('WebSocket authentication failed', error);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Authentication failed');
    }
  }
}