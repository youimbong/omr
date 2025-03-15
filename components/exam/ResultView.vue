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
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-6 text-center">시험 결과</h2>
    
    <!-- 점수 요약 -->
    <div class="mb-8 text-center">
      <div class="text-4xl font-bold mb-2" :class="scoreColorClass">
        {{ Math.round(scorePercentage * 10) / 10 }}점 / 100점 ({{ scoreGrade }})
      </div>
      <div class="text-gray-600">
        {{ result.earnedPoints }}점 / {{ result.totalPoints }}점 만점
      </div>
    </div>
    
    <!-- 통계 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <div class="text-xl font-semibold">{{ result.correctAnswers }}개</div>
        <div class="text-sm text-gray-600">정답 수</div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <div class="text-xl font-semibold">{{ Math.round(correctRate * 10) / 10 }}%</div>
        <div class="text-sm text-gray-600">정답률</div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <div class="text-xl font-semibold">{{ result.answeredQuestions }}/{{ result.totalQuestions }}</div>
        <div class="text-sm text-gray-600">답변율</div>
      </div>
    </div>
    
    <!-- 피드백 메시지 -->
    <div class="bg-blue-50 p-4 rounded-lg mb-6">
      <p class="text-blue-800">{{ feedbackMessage }}</p>
    </div>
    
    <!-- 문제별 결과 테이블 -->
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 border text-left">문제</th>
            <th class="p-2 border text-center">정답</th>
            <th class="p-2 border text-center">내 답안</th>
            <th class="p-2 border text-center">결과</th>
            <th class="p-2 border text-right">점수</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in result.questionResults" 
            :key="item.id" 
            :class="{ 'bg-green-50': item.isCorrect, 'bg-red-50': !item.isCorrect }">
            <td class="p-2 border">{{ item.id }}번</td>
            <td class="p-2 border text-center">{{ item.correctAnswer }}</td>
            <td class="p-2 border text-center">
              {{ item.userAnswer !== null ? item.userAnswer : '-' }}
            </td>
            <td class="p-2 border text-center">
              <span v-if="item.isCorrect" class="text-green-600">●</span>
              <span v-else class="text-red-600">●</span>
            </td>
            <td class="p-2 border text-right">
              {{ item.isCorrect ? item.points : 0 }} / {{ item.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bg-white {
  background-color: white;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.text-green-600 {
  color: #059669;
}

.text-blue-600 {
  color: #2563eb;
}

.text-yellow-600 {
  color: #d97706;
}

.text-red-600 {
  color: #dc2626;
}

.text-blue-800 {
  color: #1e40af;
}
</style>