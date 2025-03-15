// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for WebSocket and HTTP requests
  app.enableCors({
    origin: '*', // In production, specify allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });
  
  // Set up WebSocket adapter using IoAdapter (supports namespaces)
  app.useWebSocketAdapter(new IoAdapter(app));
  
  app.useGlobalPipes(new ValidationPipe());
  
  // Configure Helmet (adjustments may be needed for WebSocket endpoints)
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  await app.listen(3000);
  console.log('Server is running on http://localhost:3000');
}
bootstrap();
