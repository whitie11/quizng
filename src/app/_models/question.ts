export interface Question {
  ID: number;
  group: string;
  question_num: number;
  text: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  subject?: string;
  type?: string;
  duration: number;
  startTime?: number
}

export interface QuestionBank {
  ID: number;
  group: string;
  question_num: number;
  text: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  duration: number;
  correctAns: string;
}

export interface questionGroupList {
  group: string;
  count: number;
}
