import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  try {
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
      return {
        success: true,
        message: '관리자 인증 성공'
      }
    } else {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
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