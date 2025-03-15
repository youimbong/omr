<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { ExamResult } from '~/types/exam';

export default defineComponent({
  name: 'ResultView',
  props: {
    result: {
      type: Object as PropType<ExamResult>,
      required: true
    }
  },
  setup(props) {
    // 점수 비율 계산 (100점 만점 기준)
    const scorePercentage = computed(() => {
      return (props.result.earnedPoints / props.result.totalPoints) * 100;
    });
    
    // 점수 비율에 따른 성적 등급 부여
    const scoreGrade = computed(() => {
      const percentage = scorePercentage.value;
      
      if (percentage >= 90) return 'A';
      if (percentage >= 80) return 'B';
      if (percentage >= 70) return 'C';
      if (percentage >= 60) return 'D';
      return 'F';
    });
    
    // 점수에 따른 색상 클래스 결정
    const scoreColorClass = computed(() => {
      const percentage = scorePercentage.value;
      
      if (percentage >= 90) return 'text-green-600';
      if (percentage >= 70) return 'text-blue-600';
      if (percentage >= 60) return 'text-yellow-600';
      return 'text-red-600';
    });
    
    // 점수에 따른 피드백 메시지
    const feedbackMessage = computed(() => {
      const percentage = scorePercentage.value;
      
      if (percentage >= 90) return '훌륭한 성적입니다! 거의 모든 문제를 정확히 이해하셨네요.';
      if (percentage >= 80) return '좋은 성적입니다! 대부분의 내용을 잘 이해하셨습니다.';
      if (percentage >= 70) return '괜찮은 성적입니다. 몇 가지 부분에 대한 추가 학습이 도움이 될 것입니다.';
      if (percentage >= 60) return '기본적인 내용은 이해하셨으나, 더 많은 학습이 필요합니다.';
      return '아쉬운 결과입니다. 내용을 다시 검토하고 복습하는 것이 좋겠습니다.';
    });
    
    // 정답률 계산
    const correctRate = computed(() => {
      return (props.result.correctAnswers / props.result.totalQuestions) * 100;
    });
    
    return {
      scorePercentage,
      scoreGrade,
      scoreColorClass,
      feedbackMessage,
      correctRate
    };
  }
});
</script>

<template>
  <div class="result-view">
    <h2 class="text-xl font-bold mb-4">시험 결과</h2>
    
    <!-- 요약 정보 -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-3 bg-white rounded-md shadow-sm">
          <p class="text-gray-500 text-sm">총 문항</p>
          <p class="text-2xl font-bold">{{ result.totalQuestions }}문항</p>
        </div>
        
        <div class="text-center p-3 bg-white rounded-md shadow-sm">
          <p class="text-gray-500 text-sm">정답 개수</p>
          <p class="text-2xl font-bold">{{ result.correctAnswers }}개</p>
          <p class="text-sm text-gray-500">({{ Math.round(result.correctAnswers / result.totalQuestions * 100) }}%)</p>
        </div>
        
        <div class="text-center p-3 bg-white rounded-md shadow-sm">
          <p class="text-gray-500 text-sm">획득 점수</p>
          <p class="text-2xl font-bold">{{ result.earnedPoints }}점</p>
          <p class="text-sm text-gray-500">(총 {{ result.totalPoints }}점)</p>
        </div>
      </div>
    </div>
    
    <!-- 문항별 결과 -->
    <h3 class="text-lg font-semibold mb-3">문항별 결과</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div 
        v-for="item in result.questionResults" 
        :key="item.id"
        class="flex items-center p-3 border rounded-md"
        :class="item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
      >
        <div class="w-8 font-medium">{{ item.id }}.</div>
        
        <div class="flex-1">
          <div class="flex items-center">
            <span class="mr-2">
              <span v-if="item.isCorrect" class="text-green-600">✓</span>
              <span v-else class="text-red-600">✗</span>
            </span>
            
            <span>
              내 답안: 
              <strong>{{ item.userAnswer || '미응답' }}</strong>
            </span>
            
            <span v-if="!item.isCorrect" class="ml-3 text-gray-600">
              정답: <strong>{{ item.correctAnswer }}</strong>
            </span>
          </div>
          
          <div class="text-sm text-gray-500 mt-1">
            배점: {{ item.points }}점
          </div>
        </div>
      </div>
    </div>
    
    <!-- 날짜 및 시간 정보 (PDF 출력용) -->
    <div class="mt-6 text-right text-sm text-gray-500">
      출력일시: {{ new Date().toLocaleString() }}
    </div>
  </div>
</template>

<style scoped>
.result-view {
  background-color: white;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-red-50 {
  background-color: #fef2f2;
}

/* PDF 출력 최적화 */
@media print {
  .result-view {
    padding: 20px;
  }
}
</style>