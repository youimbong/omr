import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAdmin: false,
    isLoading: false,
    error: null as string | null,
  }),
  
  actions: {
    async checkPassword(password: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      
      try {
        // 서버 API를 호출하여 비밀번호 확인
        const response = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.isAdmin = true;
          // 세션 스토리지에 인증 상태 저장 (페이지 새로고침에도 유지)
          sessionStorage.setItem('isAdmin', 'true');
          return true;
        } else {
          this.error = result.message || '인증에 실패했습니다.';
          return false;
        }
      } catch (error) {
        this.error = '서버 연결 오류가 발생했습니다.';
        console.error('인증 오류:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    logout() {
      this.isAdmin = false;
      sessionStorage.removeItem('isAdmin');
    },
    
    checkAuthStatus() {
      const authStatus = sessionStorage.getItem('isAdmin');
      this.isAdmin = authStatus === 'true';
      return this.isAdmin;
    }
  }
});