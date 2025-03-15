<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExamStore } from '~/stores/exam';
import type { UserAnswer, ExamResult } from '~/types/exam';
import OMRCard from '~/components/exam/OMRCard.vue';
import ResultView from '~/components/exam/ResultView.vue';

export default defineComponent({
  name: 'ExamPage',
  components: {
    OMRCard,
    ResultView
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const examStore = useExamStore();
    
    const examId = computed(() => route.params.id as string);
    const userAnswers = ref<UserAnswer[]>([]);
    const examResult = ref<ExamResult | null>(null);
    const showResult = ref(false);
    const timeLeft = ref(0); // 시간 제한 (초 단위)
    const timer = ref<NodeJS.Timeout | null>(null);
    
    // 시험 정보 로드
    const exam = computed(() => {
      return examStore.getExamById(examId.value);
    });
    
    // 시험이 존재하는지 확인
    const examExists = computed(() => !!exam.value);
    
    // 남은 시간 표시 형식 변환 (MM:SS)
    const formattedTimeLeft = computed(() => {
      const minutes = Math.floor(timeLeft.value / 60);
      const seconds = timeLeft.value % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    });
    
    // 시험 초기화
    const initializeExam = () => {
      if (!exam.value) return;
      
      // 사용자 응답 초기화
      userAnswers.value = exam.value.questions.map(q => ({
        questionId: q.id,
        answer: null
      }));
      
      // 결과 초기화
      examResult.value = null;
      showResult.value = false;
      
      // 시간 제한 설정 (기본 60분)
      timeLeft.value = 60 * 60; // 60분 * 60초
      
      // 타이머 시작
      startTimer();
    };
    
    // 타이머 시작
    const startTimer = () => {
      timer.value = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
        } else {
          // 시간 종료 시 자동 제출
          submitExam();
        }
      }, 1000);
    };
    
    // 타이머 정지
    const stopTimer = () => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    };
    
    // 시험 제출
    const submitExam = () => {
      if (!exam.value) return;
      
      stopTimer();
      
      // 채점 결과 계산
      const correctAnswers = userAnswers.value.filter((ua) => {
        const question = exam.value?.questions.find(q => q.id === ua.questionId);
        return question && ua.answer === question.answerKey;
      }).length;
      
      const answeredQuestions = userAnswers.value.filter(ua => ua.answer !== null).length;
      
      const totalPoints = exam.value.questions.reduce((sum, q) => sum + q.points, 0);
      
      const earnedPoints = userAnswers.value.reduce((sum, ua) => {
        const question = exam.value?.questions.find(q => q.id === ua.questionId);
        if (question && ua.answer === question.answerKey) {
          return sum + question.points;
        }
        return sum;
      }, 0);
      
      const questionResults = exam.value.questions.map(q => {
        const userAnswer = userAnswers.value.find(ua => ua.questionId === q.id);
        return {
          id: q.id,
          isCorrect: userAnswer?.answer === q.answerKey,
          points: q.points,
          userAnswer: userAnswer?.answer || null,
          correctAnswer: q.answerKey
        };
      });
      
      // 결과 설정
      examResult.value = {
        examId: examId.value,
        totalQuestions: exam.value.questions.length,
        correctAnswers,
        totalPoints,
        earnedPoints,
        answeredQuestions,
        questionResults
      };
      
      showResult.value = true;
    };
    
    // 다시 풀기
    const retakeExam = () => {
      initializeExam();
    };
    
    // 메인 페이지로 돌아가기
    const goToHome = () => {
      router.push('/');
    };
    
    onMounted(() => {
      examStore.loadExams();
      
      if (examExists.value) {
        initializeExam();
      } else {
        // 존재하지 않는 시험인 경우 메인 페이지로 리다이렉트
        router.push('/');
      }
    });
    
    // 컴포넌트 언마운트 시 타이머 정리
    onUnmounted(() => {
      stopTimer();
    });
    
    return {
      exam,
      examExists,
      userAnswers,
      timeLeft,
      formattedTimeLeft,
      showResult,
      examResult,
      submitExam,
      retakeExam,
      goToHome
    };
  }
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- 로딩 상태 -->
    <div v-if="!examExists" class="text-center py-8">
      <p class="text-xl">해당 시험을 찾을 수 없습니다.</p>
      <button
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        @click="goToHome"
      >
        메인 페이지로 돌아가기
      </button>
    </div>
    
    <div v-else>
      <!-- 시험 제목 및 남은 시간 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ exam?.title }}</h1>
        
        <div v-if="!showResult" class="text-lg font-semibold">
          남은 시간: <span :class="timeLeft < 300 ? 'text-red-600' : ''">{{ formattedTimeLeft }}</span>
        </div>
      </div>
      
      <div v-if="!showResult">
        <!-- 시험 응시 인터페이스 -->
        <OMRCard
          v-model:user-answers="userAnswers"
          :questions="exam?.questions || []"
        />
        
        <div class="mt-6 flex justify-end">
          <button
            class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold"
            @click="submitExam"
          >
            제출하기
          </button>
        </div>
      </div>
      
      <div v-else>
        <!-- 결과 화면 -->
        <ResultView v-if="examResult" :result="examResult" />
        
        <div class="mt-6 flex justify-center space-x-4">
          <button
            class="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold"
            @click="retakeExam"
          >
            다시 풀기
          </button>
          
          <button
            class="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-semibold"
            @click="goToHome"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

.text-red-600 {
  color: #dc2626;
}
</style>