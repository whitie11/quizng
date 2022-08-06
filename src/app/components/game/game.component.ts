import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Answer } from 'src/app/_models/answer';
import { isLoggedIn } from 'src/app/_models/isLoggedIn';
import { Message } from 'src/app/_models/message';
import { Question } from 'src/app/_models/question';
import { WebsocketService } from '../../services/websocket.service';

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
    text: 'Waiting for a question',
    answerA: '?',
    answerB: '?',
    answerC: '?',
    answerD: '?',
    subject: 'question',
    type: 'question',
    time: 0
  }

  isActiveQuestion= false;

  questionTime = 0;
  timeLeft: any = 0;
  interval: any;

  currentTicks: any = 0;
  ticks: any;

  questionStart  = new Date().getTime();
  sliderValue = 0;

  constructor(
    private service: DataService,
    private authService: AuthService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
    this.service.connectPlayer();
    // this.service.connectAns();

    this.service.messages$.subscribe((msg) => {
        this.received.push(msg);
        console.log('Response from websocket: ' + msg);
    });

    this.service.question$.subscribe((question) => {
      console.log('Response from websocket: ' + question);
      this.question = question;
      this.questionTime = question.time;
      this.startTimer();
  });

//   this.service.timer$.subscribe((timeValue) => {
//     console.log('timer Value from websocket: ' + timeValue);
//     this.timerValue = timeValue;
// });


    this.isLoggedIn$.subscribe((d) => {
      this.isLoggedIn = {
        state: d.state,
        username: d.username,
        userID: d.userID,
      };
    });

    this.isConnected$ = this.service.isConnected();
  }

  ngOnInit(): void {
    console.log('starting game page');
    this.startHandshake()
  }

  ngOnDestroy(): void {
    this.service.closePlayer()
    }

  sendMsg() {
    let message: Message = <Message>{ };
    message.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    message.content = this.content;
    message.type = 'chat_message';
    message.subject = 'message';

    this.sent.push(message);
    this.service.sendMessage(message);
  }


  sendAnswer(questionNo: number, guess: string) {
    let answer: Answer = <Answer>{ };
    answer.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    answer.answer = guess;
    answer.question_no= questionNo;
    answer.type='answer';
    answer.subject= 'answer';
    const currentTime = new Date().getTime();
    answer.timeSpent = (currentTime - this.questionStart)/1000
    this.service.sendMessage(answer);
    this.isActiveQuestion= false;
  }


  startTimer() {
    this.isActiveQuestion = true;
    this.timeLeft = this.questionTime;
    this.questionStart = new Date().getTime();
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft = this.timeLeft-0.1;
       this.sliderValue = (this.timeLeft/(this.questionTime))*100;
      } else {
        clearInterval(this.interval);
        this.isActiveQuestion = false;
      }
    },100);
  }

  startHandshake() {
    this.ticks = 20;
    this.currentTicks = setInterval(() => {
      if (this.ticks > 0) {
        this.ticks = this.ticks-1;
      } else {
        // clearInterval(this.interval)
        this.service.sendMessage({'type': 'handshake'})
        this.ticks=20
      }
    },1000)
  }

}
