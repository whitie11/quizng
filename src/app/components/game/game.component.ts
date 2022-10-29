import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Answer } from 'src/app/_models/answer';
import { isLoggedIn } from 'src/app/_models/isLoggedIn';
import { Message } from 'src/app/_models/message';
import { Question } from 'src/app/_models/question';
// import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
  title = 'socketrv';
  content = '';
  received: any[] = [];
  sent: any[] = [];

  isLoggedIn?: isLoggedIn;
  isLoggedIn$: Observable<isLoggedIn>;

  isConnected$: Observable<Boolean>;

  question: Question = {
    ID: 0,
    group: 'sample',
    question_num: 0,
    text: 'Waiting for a question',
    answerA: '?',
    answerB: '?',
    answerC: '?',
    answerD: '?',
    subject: 'question',
    type: 'question',
    duration: 0,
    startTime: 0,
  };

  isActiveQuestion = false;

  questionTimeLeft = 0;
  // timeLeft: any = 0;
  // interval: any;

  currentTicks: any = 0;
  ticks: any;

  questionStart = 0;
  sliderValue = 0;
  ansTimer?: Subscription;

  constructor(private service: DataService, private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
    this.service.connectPlayer();
    // this.service.connectAns();

    this.service.messages$.subscribe((msg) => {
      this.received.push(msg);
      console.log('msg from websocket: ' + msg);
    });

    this.service.question$.subscribe((question) => {
      console.log('Response from websocket: ' + question);
      this.received = [];

      this.question = question;

      this.questionStart = question.startTime ? question.startTime : 0;

      let curTime = new Date().getTime();
      let endTime = this.questionStart + question.duration * 1000;
      let dif = (endTime - curTime) / 1000;
      this.questionTimeLeft = dif;

      this.startTimer();
    });

    this.isLoggedIn$.subscribe((d) => {
      this.isLoggedIn = {
        state: d.state,
        username: d.username,
        userID: d.userID,
        role: d.role,
      };
    });

    this.isConnected$ = this.service.isConnected();
  }

  ngOnInit(): void {
    console.log('starting game page');
    this.startHandshake();
  }

  ngOnDestroy(): void {
    this.service.closePlayer();
  }

  sendMsg() {
    let message: Message = <Message>{};
    message.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    message.content = this.content;
    message.type = 'chat_message';
    message.subject = 'message';
    message.reciever = '';
    this.sent.push(message);
    this.service.sendMessage(message);
  }

  sendIndMsg() {
    let message: Message = <Message>{};
    message.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    message.content = 'individual message';
    message.type = 'ind_message';
    message.subject = 'message';

    this.sent.push(message);
    this.service.sendMessage(message);
  }

  sendAnswer(question_ID: number, question_num: number, guess: string) {
    let answer: Answer = <Answer>{};
    answer.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    answer.userID = this.isLoggedIn?.userID
    ? this.isLoggedIn?.userID
    : 0;
    answer.answer = guess;
    answer.question_ID = question_ID;
    answer.question_num = question_num;
    answer.type = 'answer';
    answer.subject = 'answer';
    const currentTime = new Date().getTime();
    answer.timeSpent = (currentTime - this.questionStart) / 1000;
    this.service.sendMessage(answer);
    if (this.ansTimer){
      this.ansTimer?.unsubscribe();
    };
    this.isActiveQuestion = false;
  }

  sendTimeUp() {
    let answer: Answer = <Answer>{};
    answer.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    answer.userID = this.isLoggedIn?.userID
    ? this.isLoggedIn?.userID
    : 0;
    answer.answer = 'X';
    answer.question_ID = this.question.ID;
    answer.question_num = this.question.question_num;
    answer.type = 'answer';
    answer.subject = 'answer';
    answer.timeSpent = this.question.duration;
    this.service.sendMessage(answer);
    this.isActiveQuestion = false;
  }

  startTimer() {
    this.isActiveQuestion = true;
    let timeLeft = this.questionTimeLeft;

    if (this.ansTimer) {
      this.ansTimer.unsubscribe();
    }

    this.ansTimer = timer(0, 100).subscribe((t) => {
      if (timeLeft > 0) {
        timeLeft = timeLeft - 0.1;
        this.sliderValue = (timeLeft / this.questionTimeLeft) * 100;
      } else {
        this.ansTimer?.unsubscribe();
        this.isActiveQuestion = false;
        this.sendTimeUp();
      }
    });
  }

  startHandshake() {
    this.ticks = 20;
    this.currentTicks = setInterval(() => {
      if (this.ticks > 0) {
        this.ticks = this.ticks - 1;
      } else {
        // clearInterval(this.interval)
        this.service.sendMessage({ type: 'handshake' });
        this.ticks = 20;
      }
    }, 1000);
  }

  sliderColorClass(value: number) {
    if (value < 25) {
      return 'red-progress';
    } else return 'green-progress';
  }
}
