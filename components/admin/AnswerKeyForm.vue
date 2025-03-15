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
    
    // 문제 수 변경 시 배열 업데이트
    function updateQuestionsCount() {
      const currentLength = questions.value.length;
      
      if (questionsCount.value > currentLength) {
        // 문제 추가
        const newQuestions = Array.from(
          { length: questionsCount.value - currentLength },
          (_, i) => ({
            id: currentLength + i + 1,
            answerKey: 0,
            points: 5
          })
        );
        questions.value = [...questions.value, ...newQuestions];
      } else if (questionsCount.value < currentLength) {
        // 문제 삭제
        questions.value = questions.value.slice(0, questionsCount.value);
      }
    }
    
    // 정답지 저장
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
        
        const invalidQuestions = questions.value.filter(q => q.answerKey < 1 || q.answerKey > 5);
        if (invalidQuestions.length > 0) {
          errorMessage.value = `미입력된 정답이 있습니다. (문제 번호: ${invalidQuestions.map(q => q.id).join(', ')})`;
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
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">{{ editMode ? '정답지 수정' : '새 정답지 작성' }}</h2>
    
    <form @submit.prevent="saveAnswerKey" class="space-y-6">
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
            max="100"
            class="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            @change="updateQuestionsCount"
            :disabled="isSubmitting"
          >
          <span class="ml-2 text-sm text-gray-500">문항</span>
        </div>
      </div>
      
      <!-- 정답 및 배점 입력 -->
      <div class="border rounded-md p-4">
        <h3 class="text-lg font-medium mb-4">정답 및 배점 입력</h3>
        
        <!-- 한 줄에 한 문항씩 표시하는 레이아웃 -->
        <div class="space-y-2">
          <div
            v-for="question in questions"
            :key="question.id"
            class="flex items-center p-2 border rounded-md bg-gray-50"
          >
            <span class="font-medium w-8 text-center">{{ question.id }}.</span>
            
            <!-- OMR 스타일 정답 선택 버튼 - 한 줄로 배치 -->
            <div class="flex-1">
              <div class="flex justify-start space-x-2">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="w-8 h-8 rounded-full flex items-center justify-center border"
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
            
            <!-- 배점 입력 - 오른쪽에 배치 -->
            <div class="flex items-center">
              <label class="text-xs text-gray-500 mr-1">배점:</label>
              <input
                v-model.number="question.points"
                type="number"
                min="1"
                class="w-14 px-2 py-1 text-sm border border-gray-300 rounded-md"
                required
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
      <div v-if="successMessage || errorMessage" class="mt-4">
        <p v-if="successMessage" class="text-green-600">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>
      </div>
      
      <!-- 제출 버튼 -->
      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          :disabled="isSubmitting"
        >
          {{ editMode ? '정답지 업데이트' : '정답지 저장' }}
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
</style>