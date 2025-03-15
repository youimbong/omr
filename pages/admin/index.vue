<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useExamStore } from '~/stores/exam';
import PasswordForm from '~/components/admin/PasswordForm.vue';
import AnswerKeyForm from '~/components/admin/AnswerKeyForm.vue';

export default defineComponent({
  name: 'AdminPage',
  components: {
    PasswordForm,
    AnswerKeyForm
  },
  setup() {
    const authStore = useAuthStore();
    const examStore = useExamStore();
    const isAuthenticated = ref(false);
    const showCreateForm = ref(false);
    const selectedExamId = ref('');
    const showEditForm = ref(false);
    
    onMounted(() => {
      // 인증 상태 확인
      isAuthenticated.value = authStore.checkAuthStatus();
      
      // 정답지 데이터 로드
      if (isAuthenticated.value) {
        examStore.loadExams();
      }
    });
    
    const handleAuthenticated = () => {
      isAuthenticated.value = true;
      examStore.loadExams();
    };
    
    const handleLogout = () => {
      authStore.logout();
      isAuthenticated.value = false;
    };
    
    const createNewExam = () => {
      showCreateForm.value = true;
      showEditForm.value = false;
      selectedExamId.value = '';
    };
    
    const editExam = (examId: string) => {
      selectedExamId.value = examId;
      showEditForm.value = true;
      showCreateForm.value = false;
    };
    
    const handleExamSaved = () => {
      // 폼 숨기기
      showCreateForm.value = false;
      showEditForm.value = false;
      selectedExamId.value = '';
      
      // 정답지 목록 새로고침
      examStore.loadExams();
    };
    
    const confirmDeleteExam = async (examId: string, examTitle: string) => {
      if (confirm(`정말로 "${examTitle}" 정답지를 삭제하시겠습니까?`)) {
        try {
          await examStore.deleteExam(examId);
          alert('정답지가 삭제되었습니다.');
        } catch  {
          alert('정답지 삭제 중 오류가 발생했습니다.');
        }
      }
    };
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    return {
      authStore,
      examStore,
      isAuthenticated,
      showCreateForm,
      selectedExamId,
      showEditForm,
      handleAuthenticated,
      handleLogout,
      createNewExam,
      editExam,
      handleExamSaved,
      confirmDeleteExam,
      formatDate
    };
  }
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div v-if="!isAuthenticated">
      <PasswordForm @authenticated="handleAuthenticated" />
    </div>
    
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">관리자 페이지</h1>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          로그아웃
        </button>
      </div>
      
      <!-- 정답지 관리 섹션 -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">정답지 관리</h2>
          <button
            @click="createNewExam"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            새 정답지 작성
          </button>
        </div>
        
        <!-- 로딩 상태 -->
        <div v-if="examStore.isLoading" class="text-center py-4">
          <p>정답지 로딩 중...</p>
        </div>
        
        <!-- 오류 메시지 -->
        <div v-else-if="examStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{{ examStore.error }}</p>
        </div>
        
        <!-- 정답지 목록 -->
        <div v-else-if="examStore.exams.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">문항 수</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="exam in examStore.exams" :key="exam.id">
                <td class="px-6 py-4 whitespace-nowrap">{{ exam.title }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ exam.questions.length }}문항</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(exam.createdAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <button
                      @click="editExam(exam.id)"
                      class="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      수정
                    </button>
                    <button
                      @click="confirmDeleteExam(exam.id, exam.title)"
                      class="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 정답지가 없는 경우 -->
        <div v-else class="bg-gray-50 p-6 rounded-lg text-center">
          <p class="text-gray-500">등록된 정답지가 없습니다. 새 정답지를 작성해보세요.</p>
        </div>
      </div>
      
      <!-- 정답지 작성/수정 폼 -->
      <div v-if="showCreateForm">
        <h2 class="text-xl font-semibold mb-4">새 정답지 작성</h2>
        <AnswerKeyForm @saved="handleExamSaved" />
      </div>
      
      <div v-if="showEditForm && selectedExamId">
        <h2 class="text-xl font-semibold mb-4">정답지 수정</h2>
        <AnswerKeyForm
          :edit-mode="true"
          :exam-id="selectedExamId"
          @saved="handleExamSaved"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

.bg-white {
  background-color: white;
}
</style>