import { defineEventHandler, getRouterParam } from 'h3';
import dbUtils from '../../utils/db';
import type { Exam } from '../../utils/db';

// 특정 정답지 조회 API
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  const db = await dbUtils.getDb();
  const exam = db.data.exams.find((exam: Exam) => exam.id === id);
  
  if (!exam) {
    return {
      success: false,
      message: '해당 ID의 정답지를 찾을 수 없습니다.'
    };
  }
  
  return {
    success: true,
    exam
  };
}); 