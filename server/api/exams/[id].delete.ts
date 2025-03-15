import { defineEventHandler, getRouterParam } from 'h3';
import dbUtils from '../../utils/db';
import type { Exam } from '../../utils/db';

// 정답지 삭제 API
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    const db = await dbUtils.getDb();
    const examIndex = db.data.exams.findIndex((exam: Exam) => exam.id === id);
    
    if (examIndex === -1) {
      return {
        success: false,
        message: '해당 ID의 정답지를 찾을 수 없습니다.'
      };
    }
    
    // 배열에서 해당 항목 제거
    db.data.exams.splice(examIndex, 1);
    await db.write();
    
    return {
      success: true,
      message: '정답지가 성공적으로 삭제되었습니다.'
    };
  } catch (error) {
    console.error('정답지 삭제 오류:', error);
    return {
      success: false,
      message: '정답지 삭제 중 오류가 발생했습니다.'
    };
  }
}); 