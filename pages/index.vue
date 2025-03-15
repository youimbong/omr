<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExamStore } from '~/stores/exam';
import type { ExamKey } from '~/types/exam';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const router = useRouter();
    const examStore = useExamStore();
    const exams = ref<ExamKey[]>([]);
    const isLoading = ref(true);
    
    onMounted(async () => {
      try {
        isLoading.value = true;
        await examStore.loadExams();
        exams.value = examStore.exams;
      } catch (error) {
        console.error('시험 목록을 불러오는 중 오류가 발생했습니다:', error);
      } finally {
        isLoading.value = false;
      }
    });
    
    // 시험 시작
    const startExam = (id: string) => {
      router.push(`/exam/${id}`);
    };
    
    // 관리자 페이지로 이동
    const goToAdmin = () => {
      router.push('/admin');
    };
    
    return {
      exams,
      isLoading,
      startExam,
      goToAdmin
    };
  }
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">온라인 테스트 프로그램</h1>
      
      <button
        @click="goToAdmin"
        class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      >
        관리자 페이지
      </button>
    </div>
    
    <!-- 로딩 표시 -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-lg">시험 목록을 불러오는 중...</p>
    </div>
    
    <!-- 시험 목록 -->
    <div v-else-if="exams.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="exam in exams"
        :key="exam.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-2">{{ exam.title }}</h2>
          
          <div class="text-gray-600 mb-4">
            <p>총 {{ exam.questions.length }}문제</p>
            <p>
              총점: {{ exam.questions.reduce((sum, q) => sum + q.points, 0) }}점
            </p>
            <p>등록일: {{ new Date(exam.createdAt).toLocaleDateString() }}</p>
          </div>
          
          <button
            @click="startExam(exam.id)"
            class="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            시험 시작
          </button>
        </div>
      </div>
    </div>
    
    <!-- 시험이 없는 경우 -->
    <div v-else class="bg-white rounded-lg shadow-md p-8 text-center">
      <p class="text-lg mb-4">등록된 시험이 없습니다.</p>
      <p class="text-gray-600">관리자 페이지에서 새 시험을 등록해주세요.</p>
      
      <button
        @click="goToAdmin"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        관리자 페이지로 이동
      </button>
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