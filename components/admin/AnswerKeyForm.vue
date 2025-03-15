<script lang="ts">
import type { Question } from '~/server/utils/db';
import { defineComponent, ref, computed, watch } from 'vue';
import { useExamStore } from '~/stores/exam';

export default defineComponent({
  name: 'AnswerKeyForm',
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    examId: {
      type: String,
      default: ''
    }
  },
  emits: ['saved'],
  setup(props, { emit }) {
    const examStore = useExamStore();
    const title = ref('');
    const questions = ref<Question[]>([]);
    const successMessage = ref('');
    const errorMessage = ref('');
    const isSubmitting = ref(false);
    
    // 문제 수 기본값 20개
    const questionsCount = ref(20);
    
    // 편집 모드인 경우 기존 데이터 로드
    watch(() => [props.editMode, props.examId], () => {
      if (props.editMode && props.examId) {
        const exam = examStore.getExamById(props.examId);
        if (exam) {
          title.value = exam.title;
          questions.value = [...exam.questions];
          questionsCount.value = exam.questions.length;
        }
      } else {
        // 신규 생성인 경우 기본 문제 배열 초기화
        title.value = '';
        initializeQuestions();
      }
    }, { immediate: true });
    
    // 문제 배열 초기화 함수
    function initializeQuestions() {
      questions.value = Array.from({ length: questionsCount.value }, (_, i) => ({
        id: i + 1,
        answerKey: 0, // 초기값은 미선택 상태
        points: 5     // 기본 배점 5점
      }));
    }
    
    // 문제 수 변경 시 배열 업데이트 - 성능 최적화
    function updateQuestionsCount() {
      const currentLength = questions.value.length;
      const newCount = questionsCount.value;
      
      // 너무 많은 문항을 한 번에 처리하지 않도록 제한
      if (newCount > 200) {
        questionsCount.value = 200;
        return;
      }
      
      if (newCount > currentLength) {
        // 문제 추가 - 배치 처리로 성능 개선
        const newQuestions = Array.from(
          { length: newCount - currentLength },
          (_, i) => ({
            id: currentLength + i + 1,
            answerKey: 0,
            points: 5
          })
        );
        questions.value = [...questions.value, ...newQuestions];
      } else if (newCount < currentLength) {
        // 문제 삭제
        questions.value = questions.value.slice(0, newCount);
      }
    }
    
    // 정답지 저장 - 대용량 데이터 처리 최적화
    async function saveAnswerKey() {
      try {
        isSubmitting.value = true;
        errorMessage.value = '';
        successMessage.value = '';
        
        // 유효성 검사
        if (!title.value.trim()) {
          errorMessage.value = '시험 제목을 입력해주세요.';
          return;
        }
        
        // 대용량 데이터 처리를 위한 최적화 - 배치 처리
        const invalidQuestions = [];
        const batchSize = 50;
        
        for (let i = 0; i < questions.value.length; i += batchSize) {
          const batch = questions.value.slice(i, i + batchSize);
          const invalidBatch = batch.filter(q => q.answerKey < 1 || q.answerKey > 5);
          invalidQuestions.push(...invalidBatch);
          
          // 비동기 작업 중 UI 응답성 유지를 위한 지연
          if (i % (batchSize * 2) === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
        
        if (invalidQuestions.length > 0) {
          // 표시할 문항 번호가 너무 많은 경우 처리
          const displayLimit = 10;
          const invalidIds = invalidQuestions.map(q => q.id);
          const displayIds = invalidIds.slice(0, displayLimit);
          const remainingCount = invalidIds.length - displayLimit;
          
          let errorMsg = `미입력된 정답이 있습니다. (문제 번호: ${displayIds.join(', ')}`;
          if (remainingCount > 0) {
            errorMsg += ` 외 ${remainingCount}개`;
          }
          errorMsg += ')';
          
          errorMessage.value = errorMsg;
          return;
        }
        
        // 저장 로직
        if (props.editMode && props.examId) {
          // 기존 정답지 업데이트
          await examStore.updateExam({
            id: props.examId,
            title: title.value,
            questions: questions.value,
            createdAt: examStore.getExamById(props.examId)?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          successMessage.value = '정답지가 업데이트되었습니다.';
        } else {
          await examStore.saveExam({
            title: title.value,
            questions: questions.value
          });
          successMessage.value = '새 정답지가 저장되었습니다.';
          
          // 폼 초기화
          title.value = '';
          initializeQuestions();
        }
        
        // 부모 컴포넌트에 저장 완료 이벤트 발생
        emit('saved');
      } catch (error) {
        console.error('정답지 저장 중 오류 발생:', error);
        errorMessage.value = '저장 중 오류가 발생했습니다.';
      } finally {
        isSubmitting.value = false;
      }
    }
    
    // 총점 계산
    const totalPoints = computed(() => {
      return questions.value.reduce((sum, q) => sum + q.points, 0);
    });
    
    return {
      title,
      questions,
      questionsCount,
      successMessage,
      errorMessage,
      isSubmitting,
      totalPoints,
      updateQuestionsCount,
      saveAnswerKey
    };
  }
});
</script>

<template>
  <div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">{{ editMode ? '정답지 수정' : '새 정답지 작성' }}</h2>
    
    <form @submit.prevent="saveAnswerKey" class="space-y-4 sm:space-y-6">
      <!-- 시험 제목 -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">시험 제목</label>
        <input
          id="title"
          v-model="title"
          type="text"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="시험 제목을 입력하세요"
          required
          :disabled="isSubmitting"
        >
      </div>
      
      <!-- 문제 수 설정 -->
      <div>
        <label for="questions-count" class="block text-sm font-medium text-gray-700">문제 수</label>
        <div class="flex items-center">
          <input
            id="questions-count"
            v-model.number="questionsCount"
            type="number"
            min="1"
            max="200"
            class="mt-1 block w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm"
            @change="updateQuestionsCount"
            :disabled="isSubmitting"
          >
          <span class="ml-2 text-sm text-gray-500">문항</span>
        </div>
      </div>
      
      <!-- 정답 및 배점 입력 -->
      <div class="border rounded-md p-4">
        <h3 class="text-lg font-medium mb-4">정답 및 배점 입력</h3>
        
        <!-- 헤더 영역 - 배점 레이블을 여기에 한 번만 표시 -->
        <div class="flex items-center px-2 py-1 mb-2 border-b">
          <div class="w-8 text-center">번호</div>
          <div class="flex-1 text-center">정답</div>
          <div class="w-14 text-center text-xs text-gray-500">배점</div>
        </div>
        
        <!-- 문항 목록 - 최대 높이 제한 및 스크롤 추가 -->
        <div class="space-y-1 sm:space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          <div
            v-for="question in questions"
            :key="question.id"
            class="flex items-center p-1 sm:p-2 border rounded-md bg-gray-50"
          >
            <!-- 문항 번호 - 3자리 수 고려하여 너비 조정 -->
            <span class="font-medium w-8 sm:w-10 text-center shrink-0">{{ question.id }}.</span>
            
            <!-- OMR 스타일 정답 선택 버튼 - 더 컴팩트하게 -->
            <div class="flex-1">
              <div class="flex justify-center space-x-1">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="w-7 h-7 rounded-full flex items-center justify-center border text-sm"
                  :class="[
                    question.answerKey === n 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                  @click="question.answerKey = n"
                  :disabled="isSubmitting"
                >
                  {{ n }}
                </button>
              </div>
            </div>
            
            <!-- 배점 입력 - 레이블 제거하고 입력 필드만 표시 -->
            <div class="w-14">
              <input
                v-model.number="question.points"
                type="number"
                min="1"
                class="w-full px-1 py-0.5 text-sm border border-gray-300 rounded-md text-center"
                required
                :disabled="isSubmitting"
              >
            </div>
          </div>
        </div>
      </div>
      
      <!-- 총점 표시 -->
      <div class="text-right">
        <p class="text-lg font-bold">총점: {{ totalPoints }}점</p>
      </div>
      
      <!-- 메시지 표시 -->
      <div v-if="successMessage || errorMessage" class="mt-2 sm:mt-4">
        <p v-if="successMessage" class="text-green-600 text-sm">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
      </div>
      
      <!-- 제출 버튼 -->
      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            처리 중...
          </span>
          <span v-else>
            {{ editMode ? '정답지 업데이트' : '정답지 저장' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.bg-white {
  background-color: white;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

/* OMR 스타일 버튼 애니메이션 */
button {
  transition: all 0.15s ease;
}

button:active {
  transform: scale(0.9);
}

/* 입력 필드 스타일 조정 */
input[type="number"] {
  -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 스크롤바 스타일 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

/* 문항 수가 많을 때 성능 최적화 */
@media (min-width: 768px) {
  .grid-cols-5 {
    will-change: transform;
  }
}
</style>