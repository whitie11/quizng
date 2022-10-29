import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { QuestionService } from 'src/app/services/question.service';
import { QuestionBank, questionGroupList } from 'src/app/_models/question';


@Component({
  selector: 'app-quiz-config',
  templateUrl: './quiz-config.component.html',
  styleUrls: ['./quiz-config.component.css'],
})
export class QuizConfigComponent implements OnInit, AfterViewInit {

  newQuestion: QuestionBank = {
    ID: 0,
    group: '',
    question_num: 0,
    text: '',
    answerA: '',
    answerB: '',
    answerC: '',
    answerD: '',
    duration: 60,
    correctAns: '',
  };

  question: QuestionBank = this.newQuestion;

  selected = '';

  qgl: questionGroupList[] = [];

  questionsArray: QuestionBank[] = [];


  displayedColumns: string[] = [
    'question_num',
    'text',
    'answerA',
    'answerB',
    'answerC',
    'answerD',
    'correctAns',
    'duration',
  ];

  dataSource = new MatTableDataSource(this.questionsArray);

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.getGroupList();
    this.getQuestionList(this.selected);
    this.dataSource.paginator = this.paginator;
  }

  saveQuestion() {
    if (this.question.group != '' && this.question.correctAns != '') {
      let q = this.questionService
        .saveQuestion(this.question)
        .subscribe((x) => {
          console.log(x);
          this.qgl = [];
          this.getGroupList();
          this.selected = '';
          this.selected = this.question.group;
          this.getQuestionList(this.selected);
        });
    }
  }

  saveAsNewQuestion() {
    this.question.question_num = 0;
    this.saveQuestion()
  }

  saveAsEditQuestion() {
    this.saveQuestion()
  }



  getGroupList() {
    let gl = this.questionService.getQuestionGroupNames().subscribe((x) => {
      console.log(x);
      this.qgl = [];
      this.qgl = x;
    });
  }

  getQuestionList(group: string) {
    let ql = this.questionService.getQuestionGroup(group).subscribe((x) => {
      console.log(x);
      this.questionsArray = [];
      this.questionsArray = x;
      this.dataSource = new MatTableDataSource(this.questionsArray);
      this.dataSource.paginator = this.paginator;
    });
  }

  resetQuestion() {
    this.question = this.newQuestion;
  }

  clickedRow(question: QuestionBank) {
  this.question = question;
  }
}
