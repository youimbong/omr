// stores/exam.ts
import { defineStore } from 'pinia';
import type { Exam, Question } from '~/server/utils/db';

interface ExamInput {
  title: string;
  questions: Question[];
}

export const useExamStore = defineStore('exam', {
  state: () => ({
    exams: [] as Exam[],
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    getExamById: (state) => (id: string) => {
      return state.exams.find(exam => exam.id === id);
    }
  },
  
  actions: {
    async loadExams() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/exams');
        const data = await response.json();
        
        this.exams = data;
      } catch (error) {
        console.error('정답지 로드 오류:', error);
        this.error = '정답지를 불러오는 중 오류가 발생했습니다.';
      } finally {
        this.isLoading = false;
      }
    },
    
    async saveExam(examData: ExamInput) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(examData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          // 새 정답지를 목록에 추가
          this.exams.push(result.exam);
          return result.exam;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('정답지 저장 오류:', error);
        this.error = '정답지를 저장하는 중 오류가 발생했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateExam(examData: Exam) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await fetch(`/api/exams/${examData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: examData.title,
            questions: examData.questions
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // 기존 정답지 업데이트
          const index = this.exams.findIndex(exam => exam.id === examData.id);
          if (index !== -1) {
            this.exams[index] = result.exam;
          }
          return result.exam;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('정답지 업데이트 오류:', error);
        this.error = '정답지를 업데이트하는 중 오류가 발생했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteExam(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await fetch(`/api/exams/${id}`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
          // 삭제된 정답지를 목록에서 제거
          this.exams = this.exams.filter(exam => exam.id !== id);
          return true;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('정답지 삭제 오류:', error);
        this.error = '정답지를 삭제하는 중 오류가 발생했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
