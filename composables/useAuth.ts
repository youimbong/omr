import { ref, onMounted } from 'vue'

export function useAuth() {
  const isAuthenticated = ref(false)
  const isCheckingAuth = ref(true)

  // 인증 상태 확인
  const checkAuth = () => {
    isCheckingAuth.value = true
    
    try {
      const authData = localStorage.getItem('adminAuth')
      
      if (authData) {
        const { authenticated, expiry } = JSON.parse(authData)
        const now = new Date().getTime()
        
        // 인증 만료 확인
        if (authenticated && expiry > now) {
          isAuthenticated.value = true
        } else {
          // 만료된 인증 정보 제거
          localStorage.removeItem('adminAuth')
          isAuthenticated.value = false
        }
      } else {
        isAuthenticated.value = false
      }
    } catch (error) {
      console.error('인증 확인 중 오류 발생:', error)
      isAuthenticated.value = false
    }
    
    isCheckingAuth.value = false
  }

  // 인증 설정
  const setAuthenticated = (value: boolean) => {
    isAuthenticated.value = value
  }

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('adminAuth')
    isAuthenticated.value = false
  }

  // 컴포넌트 마운트 시 인증 상태 확인
  onMounted(() => {
    checkAuth()
  })

  return {
    isAuthenticated,
    isCheckingAuth,
    setAuthenticated,
    logout
  }
}