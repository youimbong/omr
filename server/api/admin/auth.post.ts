import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

// 로그인 시도 횟수를 저장하는 객체 (서버 메모리에 저장)
const loginAttempts: Record<string, { count: number; timestamp: number }> = {};

// 최대 허용 시도 횟수
const MAX_ATTEMPTS = 5;
// 차단 시간 (밀리초 단위, 15분)
const BLOCK_DURATION = 15 * 60 * 1000;

// 로그인 실패 시 지연 시간 추가 (밀리초)
const getDelay = (attempts: number) => Math.min(1000 * Math.pow(2, attempts), 10000); // 최대 10초

export default defineEventHandler(async (event) => {
  try {
    // 클라이언트 IP 가져오기
    const clientIP = event.node.req.socket.remoteAddress || 'unknown';
    
    // 해당 IP의 로그인 시도 기록 확인
    const attempts = loginAttempts[clientIP];
    const now = Date.now();
    
    // 이전 시도 기록이 있고, 최대 시도 횟수를 초과한 경우
    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      // 차단 시간이 지났는지 확인
      if (now - attempts.timestamp < BLOCK_DURATION) {
        // 남은 차단 시간 계산 (분 단위)
        const remainingMinutes = Math.ceil((BLOCK_DURATION - (now - attempts.timestamp)) / 60000);
        
        return {
          success: false,
          message: `너무 많은 로그인 시도가 있었습니다. ${remainingMinutes}분 후에 다시 시도해주세요.`,
          blocked: true
        };
      } else {
        // 차단 시간이 지났으면 시도 횟수 초기화
        loginAttempts[clientIP] = { count: 0, timestamp: now };
      }
    }
    
    // 요청 본문에서 비밀번호 추출
    const { password } = await readBody(event)
    
    // 비밀번호가 제공되지 않은 경우
    if (!password) {
      return {
        success: false,
        message: '비밀번호를 입력해주세요.'
      }
    }
    
    // 런타임 설정에서 관리자 비밀번호 가져오기
    const config = useRuntimeConfig()
    const adminPassword = config.adminPassword
    
    // 비밀번호 확인
    if (password === adminPassword) {
      // 인증 성공 시 시도 횟수 초기화
      loginAttempts[clientIP] = { count: 0, timestamp: now };
      
      return {
        success: true,
        message: '관리자 인증 성공'
      }
    } else {
      // 인증 실패 시 시도 횟수 증가
      if (!loginAttempts[clientIP]) {
        loginAttempts[clientIP] = { count: 1, timestamp: now };
      } else {
        loginAttempts[clientIP].count += 1;
        loginAttempts[clientIP].timestamp = now;
      }
      
      // 남은 시도 횟수 계산
      const remainingAttempts = MAX_ATTEMPTS - loginAttempts[clientIP].count;
      
      // 지연 시간 계산
      const delay = getDelay(loginAttempts[clientIP].count);
      
      // 지연 시간만큼 대기
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return {
        success: false,
        message: `비밀번호가 일치하지 않습니다. 남은 시도 횟수: ${Math.max(0, remainingAttempts)}회`,
        remainingAttempts: Math.max(0, remainingAttempts)
      }
    }
  } catch (error) {
    console.error('관리자 인증 오류:', error)
    return {
      success: false,
      message: '서버 오류가 발생했습니다.'
    }
  }
}) 