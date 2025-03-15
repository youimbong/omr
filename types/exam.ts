// types/exam.ts
export interface Question {
  id: number;
  answerKey: number; // 정답 번호 (1-5)
  points: number;    // 배점
}

export interface ExamKey {
  id: string;        // 고유 ID
  title: string;     // 시험 제목
  questions: Question[]; // 문제 배열
  createdAt: string; // 생성 일시
}

export interface UserAnswer {
  questionId: number;
  answer: number | null; // 사용자가 선택한 답변 (1-5 또는 미선택)
}

export interface ExamResult {
  examId: string;             // 시험 ID
  totalQuestions: number;     // 전체 문제 수
  correctAnswers: number;     // 정답 수
  totalPoints: number;        // 총 배점
  earnedPoints: number;       // 획득 점수
  answeredQuestions: number;  // 응답한 문제 수
  questionResults: {         // 각 문제별 결과
    id: number;
    isCorrect: boolean;
    points: number;
    userAnswer: number | null;
    correctAnswer: number;
  }[];
}