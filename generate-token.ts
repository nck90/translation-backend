// generate-token.ts
import * as jwt from 'jsonwebtoken';

// payload에 원하는 정보를 넣어줍니다.
const payload = {
  username: 'exampleUser',
  role: 'user'
};

// .env 파일에 설정한 JWT_SECRET과 동일하게 설정합니다.
const secret = process.env.JWT_SECRET || 'secret';

// 토큰 만료 시간은 옵션에서 설정 (예: 1시간)
const options = { expiresIn: '1h' };

// JWT 토큰 생성
const token = jwt.sign(payload, secret, options);
console.log('Generated JWT Token:', token);
