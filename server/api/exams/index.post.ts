import { defineEventHandler, readBody } from 'h3';
import dbUtils from '../../utils/db';
import { v4 as uuidv4 } from 'uuid';

// 새 정답지 저장 API
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return {
        success: false,
        message: '유효하지 않은 정답지 데이터입니다.'
      };
    }
    
    const now = new Date().toISOString();
    const newExam = {
      id: uuidv4(),
      title: body.title,
      questions: body.questions,
      createdAt: now,
      updatedAt: now
    };
    
    const db = await dbUtils.getDb();
    db.data.exams.push(newExam);
    await db.write();
    
    return {
      success: true,
      message: '정답지가 성공적으로 저장되었습니다.',
      exam: newExam
    };
  } catch (error) {
    console.error('정답지 저장 오류:', error);
    return {
      success: false,
      message: '정답지 저장 중 오류가 발생했습니다.'
    };
  }
}); 