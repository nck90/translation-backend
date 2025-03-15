// test-socket.js
const io = require('socket.io-client');

// 실제 JWT 토큰을 사용하세요. (임시로 테스트 목적이면 아무 문자열이라도 가능하지만, 실제 인증이 활성화된 경우 유효한 토큰이어야 합니다)
const token = 'YOUR_VALID_JWT_TOKEN';

// Socket.IO 서버의 URL. 
// 서버에서 IoAdapter를 사용 중이므로, Socket.IO 프로토콜로 연결합니다.
// 네임스페이스 '/ws'를 사용 중이므로 URL에 포함합니다.
const socket = io('http://localhost:3000/ws', {
  query: { token }  // 인증 토큰을 쿼리 파라미터로 전송합니다.
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO server');

  // 연결 후 예시 이벤트 전송:
  // 예를 들어, 방 참여 요청을 보낼 수 있습니다.
  socket.emit('joinRoom', { roomId: '1dcecb7b' });

  socket.emit('getInternalIP');
});

// 수신 이벤트 처리
socket.on('joined', (data) => {
  console.log('Joined room:', data);
});

socket.on('internalIP', (data) => {
  console.log('Internal IP received:', data);
});

socket.on('message', (data) => {
  console.log('Message received:', data);
});

// 에러 이벤트 처리
socket.on('error', (err) => {
  console.error('Error:', err);
});
