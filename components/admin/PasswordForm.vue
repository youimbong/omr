<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'PasswordForm',
  emits: ['authenticated'],
  setup(_, { emit }) {
    const password = ref('');
    const errorMessage = ref('');
    const isLoading = ref(false);
    const isBlocked = ref(false);
    const remainingAttempts = ref<number | null>(null);
    
    const authenticate = async () => {
      isLoading.value = true;
      
      try {
        const response = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password.value })
        });
        
        const result = await response.json();
        
        if (result.success) {
          emit('authenticated');
          errorMessage.value = '';
          remainingAttempts.value = null;
        } else {
          errorMessage.value = result.message;
          isBlocked.value = result.blocked || false;
          remainingAttempts.value = result.remainingAttempts !== undefined ? result.remainingAttempts : null;
        }
      } catch  {
        errorMessage.value = '서버 연결 오류가 발생했습니다.';
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      password,
      errorMessage,
      isLoading,
      isBlocked,
      remainingAttempts,
      authenticate
    };
  }
});
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">관리자 인증</h2>
    
    <form v-if="!isBlocked" @submit.prevent="authenticate" class="space-y-4">
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">비밀번호</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="관리자 비밀번호를 입력하세요"
          required
          :disabled="isLoading"
        >
      </div>
      
      <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
      <p v-if="remainingAttempts !== null && remainingAttempts < 3" class="text-orange-500 text-sm">
        주의: 남은 시도 횟수 {{ remainingAttempts }}회
      </p>
      
      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          :disabled="isLoading"
        >
          <span v-if="isLoading">인증 중...</span>
          <span v-else>인증하기</span>
        </button>
      </div>
    </form>
    
    <div v-else class="text-center">
      <p class="text-red-500 mb-4">{{ errorMessage }}</p>
      <p class="text-gray-600">잠시 후 다시 시도해주세요.</p>
    </div>
  </div>
</template>

<style scoped>
.bg-white {
  background-color: white;
}

.text-red-500 {
  color: #ef4444;
}
</style>