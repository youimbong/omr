import { JSONFilePreset } from 'lowdb/node'
import path from 'path';
import fs from 'fs';
import { useRuntimeConfig } from '#imports';

// 데이터베이스 타입 정의
export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  answerKey: number;
  points: number;
}

export interface Schema {
  exams: Exam[];
}

// 데이터베이스 타입 정의
type LowDbType = Awaited<ReturnType<typeof JSONFilePreset<Schema>>>;

// 데이터 디렉토리 확인 및 생성
const config = useRuntimeConfig();
const dataDir = path.resolve(process.cwd(), config.public.dataPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 데이터베이스 파일 경로
const dbPath = path.join(dataDir, 'exams.json');

const defaultData: Schema = {
  exams: []
}

// 데이터베이스 초기화 (비동기 함수)
let db: LowDbType | null = null;

// 초기화 함수
export const initDb = async (): Promise<LowDbType> => {
  db = await JSONFilePreset<Schema>(dbPath, defaultData);
  return db;
};

// 데이터베이스 가져오기
export const getDb = async (): Promise<LowDbType> => {
  if (!db) {
    return await initDb();
  }
  return db;
};

export default { initDb, getDb }; 