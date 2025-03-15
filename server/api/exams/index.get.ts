import { defineEventHandler } from 'h3';
import dbUtils from '../../utils/db';

// 모든 정답지 조회 API
export default defineEventHandler(async () => {
  const db = await dbUtils.getDb();
  return db.data.exams;
}); 