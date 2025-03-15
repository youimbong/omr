import { defineEventHandler, readBody, getRouterParam } from 'h3';
import dbUtils from '../../utils/db';
import type { Exam } from '../../utils/db';

// 정답지 업데이트 API
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return {
        success: false,
        message: '유효하지 않은 정답지 데이터입니다.'
      };
    }
    
    const db = await dbUtils.getDb();
    const examIndex = db.data.exams.findIndex((exam: Exam) => exam.id === id);
    
    if (examIndex === -1) {
      return {
        success: false,
        message: '해당 ID의 정답지를 찾을 수 없습니다.'
      };
    }
    
    const updatedExam = {
      ...db.data.exams[examIndex],
      title: body.title,
      questions: body.questions,
      updatedAt: new Date().toISOString()
    };
    
    db.data.exams[examIndex] = updatedExam;
    await db.write();
    
    return {
      success: true,
      message: '정답지가 성공적으로 업데이트되었습니다.',
      exam: updatedExam
    };
  } catch (error) {
    console.error('정답지 업데이트 오류:', error);
    return {
      success: false,
      message: '정답지 업데이트 중 오류가 발생했습니다.'
    };
  }
}); 