// utils/scoring.ts
import type { Question, UserAnswer, ExamResult } from '~/types/exam';

/**
 * 시험 채점을 수행하는 유틸리티 함수
 * 
 * @param examId 시험 ID
 * @param questions 문제 배열
 * @param userAnswers 사용자 응답 배열
 * @returns 채점 결과 객체
 */
export function scoreExam(
  examId: string,
  questions: Question[],
  userAnswers: UserAnswer[]
): ExamResult {
  // 총 문제 수
  const totalQuestions = questions.length;
  
  // 사용자가 응답한 문제 수 계산
  const answeredQuestions = userAnswers.filter(ua => ua.answer !== null).length;
  
  // 총 배점 계산
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  
  // 문제별 채점 결과 생성
  const questionResults = questions.map(question => {
    const userAnswer = userAnswers.find(ua => ua.questionId === question.id);
    const isCorrect = userAnswer?.answer === question.answerKey;
    
    return {
      id: question.id,
      isCorrect: isCorrect || false,
      points: question.points,
      userAnswer: userAnswer?.answer || null,
      correctAnswer: question.answerKey
    };
  });
  
  // 정답 수 계산
  const correctAnswers = questionResults.filter(result => result.isCorrect).length;
  
  // 획득 점수 계산
  const earnedPoints = questionResults.reduce((sum, result) => {
    if (result.isCorrect) {
      return sum + result.points;
    }
    return sum;
  }, 0);
  
  // 최종 결과 반환
  return {
    examId,
    totalQuestions,
    correctAnswers,
    totalPoints,
    earnedPoints,
    answeredQuestions,
    questionResults
  };
}

/**
 * 점수에 따른 등급을 반환하는 함수
 * 
 * @param score 점수 (0-100)
 * @returns 등급 (A-F)
 */
export function getGradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * 점수 비율 계산 함수 (100점 만점 기준)
 * 
 * @param earned 획득 점수
 * @param total 총 점수
 * @returns 백분율 점수 (0-100)
 */
export function calculateScorePercentage(earned: number, total: number): number {
  if (total === 0) return 0;
  return (earned / total) * 100;
}

/**
 * 정답률 계산 함수
 * 
 * @param correct 정답 수
 * @param total 총 문제 수
 * @returns 정답률 (0-100)
 */
export function calculateCorrectRate(correct: number, total: number): number {
  if (total === 0) return 0;
  return (correct / total) * 100;
}

/**
 * 점수에 따른 피드백 메시지 생성 함수
 * 
 * @param score 점수 (0-100)
 * @returns 피드백 메시지
 */
export function getFeedbackMessage(score: number): string {
  if (score >= 90) return '훌륭한 성적입니다! 거의 모든 문제를 정확히 이해하셨네요.';
  if (score >= 80) return '좋은 성적입니다! 대부분의 내용을 잘 이해하셨습니다.';
  if (score >= 70) return '괜찮은 성적입니다. 몇 가지 부분에 대한 추가 학습이 도움이 될 것입니다.';
  if (score >= 60) return '기본적인 내용은 이해하셨으나, 더 많은 학습이 필요합니다.';
  return '아쉬운 결과입니다. 내용을 다시 검토하고 복습하는 것이 좋겠습니다.';
}