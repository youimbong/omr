<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

export default defineComponent({
  name: 'PasswordForm',
  emits: ['authenticated'],
  setup(_, { emit }) {
    const password = ref('');
    const errorMessage = ref('');
    const isLoading = ref(false);
    const authStore = useAuthStore();
    
    const authenticate = async () => {
      isLoading.value = true;
      
      try {
        const success = await authStore.checkPassword(password.value);
        
        if (success) {
          emit('authenticated');
          errorMessage.value = '';
        } else {
          errorMessage.value = authStore.error || '비밀번호가 일치하지 않습니다.';
        }
      } catch (error) {
        errorMessage.value = '인증 과정에서 오류가 발생했습니다.';
        console.error('인증 오류:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      password,
      errorMessage,
      isLoading,
      authenticate
    };
  }
});
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">관리자 인증</h2>
    
    <form @submit.prevent="authenticate" class="space-y-4">
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