<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useExamStore } from '~/stores/exam';
import { useRouter } from 'vue-router';
import PasswordForm from '~/components/admin/PasswordForm.vue';
import AnswerKeyForm from '~/components/admin/AnswerKeyForm.vue';

export default defineComponent({
  name: 'AdminPage',
  components: {
    PasswordForm,
    AnswerKeyForm
  },
  setup() {
    const router = useRouter();
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
    
    const goBack = () => {
      router.push('/');
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
    
    const cancelForm = () => {
      showCreateForm.value = false;
      showEditForm.value = false;
      selectedExamId.value = '';
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
          alert('정답지가 성공적으로 삭제되었습니다.');
        } catch (error) {
          console.error('정답지 삭제 오류:', error);
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
      goBack,
      createNewExam,
      editExam,
      cancelForm,
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
      <!-- 헤더 영역 - 모바일에서 세로로 배치 -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h1 class="text-2xl font-bold">관리자 페이지</h1>
        <div class="flex space-x-2 w-full sm:w-auto">
          <button
            @click="goBack"
            class="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            뒤로가기
          </button>
          <button
            @click="handleLogout"
            class="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            로그아웃
          </button>
        </div>
      </div>
      
      <!-- 정답지 관리 섹션 -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 class="text-xl font-semibold">정답지 관리</h2>
          <button
            @click="createNewExam"
            class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm w-full sm:w-auto"
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
        
        <!-- 정답지 목록 - 모바일에서는 카드 형태로 표시 -->
        <div v-else-if="examStore.exams.length > 0">
          <!-- 데스크톱 테이블 (모바일에서는 숨김) -->
          <div class="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">문항 수</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="exam in examStore.exams" :key="exam.id">
                  <td class="px-4 py-2 whitespace-nowrap">{{ exam.title }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">{{ exam.questions.length }}문항</td>
                  <td class="px-4 py-2 whitespace-nowrap">{{ formatDate(exam.createdAt) }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <div class="flex space-x-2">
                      <button
                        @click="editExam(exam.id)"
                        class="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs"
                      >
                        수정
                      </button>
                      <button
                        @click="confirmDeleteExam(exam.id, exam.title)"
                        class="px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 모바일 카드 뷰 (데스크톱에서는 숨김) -->
          <div class="sm:hidden space-y-3">
            <div 
              v-for="exam in examStore.exams" 
              :key="exam.id"
              class="bg-white rounded-lg shadow p-4"
            >
              <div class="mb-2">
                <h3 class="font-bold text-lg">{{ exam.title }}</h3>
                <div class="text-sm text-gray-500">
                  <p>{{ exam.questions.length }}문항</p>
                  <p>{{ formatDate(exam.createdAt) }}</p>
                </div>
              </div>
              <div class="flex space-x-2 mt-2">
                <button
                  @click="editExam(exam.id)"
                  class="flex-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                >
                  수정
                </button>
                <button
                  @click="confirmDeleteExam(exam.id, exam.title)"
                  class="flex-1 px-3 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 정답지가 없는 경우 -->
        <div v-else class="bg-gray-50 p-6 rounded-lg text-center">
          <p class="text-gray-500">등록된 정답지가 없습니다. 새 정답지를 작성해보세요.</p>
        </div>
      </div>
      
      <!-- 정답지 작성/수정 폼 -->
      <div v-if="showCreateForm || (showEditForm && selectedExamId)" class="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 class="text-xl font-semibold">{{ showEditForm ? '정답지 수정' : '새 정답지 작성' }}</h2>
          <button
            @click="cancelForm"
            class="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm w-full sm:w-auto"
          >
            취소
          </button>
        </div>
        
        <AnswerKeyForm
          v-if="showCreateForm"
          @saved="handleExamSaved"
        />
        
        <AnswerKeyForm
          v-if="showEditForm && selectedExamId"
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
  width: 100%;
}

.bg-white {
  background-color: white;
}

/* 모바일 최적화 스타일 */
@media (max-width: 640px) {
  .container {
    padding: 0.5rem;
  }
}
</style>