// src/guards/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token as string;

    if (!token) {
      return false;
    }

    try {
      const secret = process.env.JWT_SECRET || 'secret';
      const decoded = jwt.verify(token, secret);
      // decoded 값을 클라이언트 객체에 할당하여 이후 이벤트 처리 시 활용할 수 있습니다.
      (client as any).user = decoded;
      return true;
    } catch (error) {
      return false;
    }
  }
}
