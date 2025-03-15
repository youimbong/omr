<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { Question, UserAnswer } from '~/types/exam';

export default defineComponent({
  name: 'OMRCard',
  props: {
    questions: {
      type: Array as PropType<Question[]>,
      required: true
    },
    userAnswers: {
      type: Array as PropType<UserAnswer[]>,
      required: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:userAnswers'],
  setup(props, { emit }) {
    // 사용자 응답이 없을 경우 빈 응답 배열 생성
    const ensureUserAnswers = computed(() => {
      const answersMap = new Map(
        props.userAnswers.map(answer => [answer.questionId, answer])
      );
      
      return props.questions.map(question => {
        const existingAnswer = answersMap.get(question.id);
        return existingAnswer || {
          questionId: question.id,
          answer: null
        };
      });
    });
    
    // 특정 문제에 대한 사용자 응답 업데이트
    const updateAnswer = (questionId: number, answer: number) => {
      const newAnswers = ensureUserAnswers.value.map(userAnswer => {
        if (userAnswer.questionId === questionId) {
          return { ...userAnswer, answer };
        }
        return userAnswer;
      });
      
      emit('update:userAnswers', newAnswers);
    };
    
    // 선택지 버튼에 대한 클래스 결정
    const getOptionClass = (questionId: number, optionNumber: number) => {
      const userAnswer = ensureUserAnswers.value.find(
        a => a.questionId === questionId
      );
      
      const question = props.questions.find(q => q.id === questionId);
      const correctAnswer = question ? question.answerKey : null;
      
      const isSelected = userAnswer?.answer === optionNumber;
      
      // 정답 표시 모드이고 현재 옵션이 정답인 경우
      const isCorrect = props.showCorrectAnswers && optionNumber === correctAnswer;
      
      // 정답 표시 모드이고 사용자가 이 옵션을 선택했으나 오답인 경우
      const isWrong = props.showCorrectAnswers && isSelected && optionNumber !== correctAnswer;
      
      const classes = ['rounded-full', 'w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'border', 'cursor-pointer'];
      
      if (isSelected) {
        classes.push('bg-blue-500', 'text-white', 'border-blue-500');
      } else {
        classes.push('bg-white', 'text-gray-700', 'border-gray-300', 'hover:bg-gray-100');
      }
      
      if (isCorrect) {
        // 정답인 경우 초록색으로 표시
        classes.push('!bg-green-500', '!text-white', '!border-green-500');
      }
      
      if (isWrong) {
        // 오답인 경우 빨간색으로 표시
        classes.push('!bg-red-500', '!text-white', '!border-red-500');
      }
      
      return classes.join(' ');
    };
    
    // 문제가 정답인지 여부 확인
    const isCorrectAnswer = (questionId: number) => {
      if (!props.showCorrectAnswers) return null;
      
      const userAnswer = ensureUserAnswers.value.find(
        a => a.questionId === questionId
      );
      const question = props.questions.find(q => q.id === questionId);
      
      return userAnswer?.answer === question?.answerKey;
    };
    
    return {
      updateAnswer,
      getOptionClass,
      isCorrectAnswer
    };
  }
});
</script>

<template>
  <div class="omr-card p-4 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-semibold mb-4">OMR 답안지</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="question in questions" 
        :key="question.id"
        class="flex items-center border rounded-md p-3"
        :class="{ 
          'bg-green-50': showCorrectAnswers && isCorrectAnswer(question.id) === true,
          'bg-red-50': showCorrectAnswers && isCorrectAnswer(question.id) === false
        }"
      >
        <div class="font-medium mr-2 w-7">{{ question.id }}.</div>
        
        <div class="flex space-x-2">
          <button
            v-for="option in 5"
            :key="option"
            type="button"
            :class="getOptionClass(question.id, option)"
            @click="!showCorrectAnswers && updateAnswer(question.id, option)"
            :disabled="showCorrectAnswers"
          >
            {{ option }}
          </button>
        </div>
        
        <div v-if="showCorrectAnswers" class="ml-3 text-sm">
          <span v-if="isCorrectAnswer(question.id)" class="text-green-600">✓ 정답</span>
          <span v-else class="text-red-600">✗ 오답</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.omr-card {
  background-color: white;
}

button:disabled {
  cursor: default;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-red-50 {
  background-color: #fef2f2;
}
</style>