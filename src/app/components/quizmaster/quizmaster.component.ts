import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Answer } from 'src/app/_models/answer';
import { isLoggedIn } from 'src/app/_models/isLoggedIn';
import { PlayerChannel } from 'src/app/_models/playerChannel';
import {
  Question,
  QuestionBank,
  questionGroupList,
} from 'src/app/_models/question';
import { timerData } from 'src/app/_models/timer';
import { Message } from 'src/app/_models/message';
import { QuestionService } from 'src/app/services/question.service';
import { NumberSymbol } from '@angular/common';
import { LeaderBoard, LeaderBoardDTO } from 'src/app/_models/leaderBoard';
import { LeadingComment } from '@angular/compiler';
// import { WebsocketService } from '../../services/websocket.service';

interface buttonData {
  index: number;
  questionNum: number;
  status: string;
}

@Component({
  selector: 'app-quizmaster',
  templateUrl: './quizmaster.component.html',
  styleUrls: ['./quizmaster.component.css'],
})
export class QuizmasterComponent implements OnInit, AfterViewInit, OnDestroy {
  // title = 'socketrv';
  // content = '';
  // received: any[] = [];
  // sent: any[] = [];

  isLoggedIn?: isLoggedIn;
  isLoggedIn$: Observable<isLoggedIn>;

  answersArray: Answer[] = [];

  leaderBoard: LeaderBoard[] = [];

  question: Question = {
    ID: 0,
    group: '',
    question_num: 0,
    text: '',
    answerA: '',
    answerB: '',
    answerC: '',
    answerD: '',
    duration: 60,
    startTime: 0,
    subject: '',
    type: '',
  };

  correctAnswer: string = '';

  timerData: timerData = {
    value: 100,
    subject: 'timer',
  };

  timeLeft: any;
  interval: any;

  players: PlayerChannel[] = [];

  currentTicks: any = 0;
  ticks: any;

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

  // question: Question = this.newQuestion;

  selected = '';

  qgl: questionGroupList[] = [];

  questionsArray: QuestionBank[] = [];

  questionIndexOld = 0;
  questionIndex = 0;
  questionButtonArray: buttonData[] = [];

  isActiveQuestion = false;
  questionTimer?: Subscription;
  sliderValue = 0;

  constructor(
    private service: DataService,
    private authService: AuthService,
    private questionService: QuestionService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();

    this.isLoggedIn$.subscribe((d) => {
      this.isLoggedIn = {
        state: d.state,
        username: d.username,
        userID: d.userID,
        role: d.role,
      };
    });

    // this.service.connect();
    this.service.connectAns();

    this.service.answer$.subscribe((ans) => {
      console.log('player: ' + ans.source + '  Answer: ' + ans.answer);
      // let answer = JSON.parse(ans);
      this.answersArray.push(ans);
    });

    this.service.playerList$.subscribe((pl) => {
      this.players = pl;
      this.addToLeaderboard(pl);
    });
  }

  ngOnDestroy(): void {
    // this.service.closePlayer()
  }

  ngOnInit(): void {
    console.log('starting QM page page!!!!');
    this.startGetPlayersTimer();
  }

  ngAfterViewInit() {
    this.getGroupList();
    this.getQuestionList(this.selected);
    // this.dataSource.paginator = this.paginator;
  }

  loadQuestion(questionIndexNew: number) {
    if (this.questionsArray.length < 1) {
      // no questions!
      return;
    }

    // if (this.questionButtonArray[questionIndexNew].status == 'used') return;
    if (this.isActiveQuestion) return;

    this.answersArray = [];
    this.sliderValue = 0;

    this.question = this.questionsArray[questionIndexNew];
    this.question.subject = 'question';
    this.question.type = 'question';
    this.question.startTime = 0;

    this.correctAnswer = this.questionsArray[questionIndexNew].correctAns;

    if (this.questionButtonArray[questionIndexNew].status != 'used') {
      this.questionButtonArray = this.questionButtonArray.map((obj) =>
        obj.index === questionIndexNew ? { ...obj, status: 'active' } : obj
      );
    }

    const foundIndex = this.questionButtonArray.findIndex(
      (x) => x.index == this.questionIndexOld
    );
    if (
      this.questionButtonArray[foundIndex].status != 'used' &&
      this.questionIndexOld != questionIndexNew
    ) {
      this.questionButtonArray[foundIndex].status = 'clean';
      console.log('pause');
    }

    this.questionIndexOld = questionIndexNew;
  }

  getGroupList() {
    let gl = this.questionService.getQuestionGroupNames().subscribe((x) => {
      console.log(x);
      this.qgl = [];
      this.qgl = x;
    });
  }

  sendQuestion() {
    if (this.questionButtonArray[this.questionIndexOld].status == 'used')
      return;
    if (this.question.ID == 0) return;
    this.question.startTime = Date.now();
    this.service.sendQuestion(this.question);

    this.startTimer(this.question.duration);

    this.questionButtonArray = this.questionButtonArray.map((obj) =>
      obj.index === this.questionIndexOld ? { ...obj, status: 'used' } : obj
    );
  }

  checkStatus() {
    if (this.questionButtonArray.length < 1 || this.question.question_num == 0)
      return false;
    if (this.questionButtonArray[this.questionIndexOld].status == 'used') {
      return false;
    } else return true;
    // return true;
  }

  addToLeaderboard(connectedPlayers: PlayerChannel[]) {
    // foreach pl test to see if they are on leaderboard, add if not
    if (connectedPlayers.length < 1) return;
    connectedPlayers.forEach((pl) => {
      const l: LeaderBoard | undefined = this.leaderBoard.find((x) => {
        return x.userID === pl.userID;
      });
      if (l == undefined) {
        const lb: LeaderBoard = {
          userID: pl.userID,
          username: pl.username,
          score: 0,
          bonus: 0
        };
        this.leaderBoard.push(lb);
      }
    });
  }

  startTimer(duration: number) {
    this.isActiveQuestion = true;
    let timeLeft = duration;

    if (this.questionTimer) {
      this.questionTimer.unsubscribe();
    }
    this.questionTimer = timer(0, 100).subscribe((t) => {
      if (this.answersArray.length == this.players.length) {
        this.questionTimer?.unsubscribe();
        this.isActiveQuestion = false;
        this.sendAnswer(this.question.question_num, this.correctAnswer);
      }

      if (timeLeft > 0) {
        timeLeft = timeLeft - 0.1;
        this.sliderValue = (timeLeft / duration) * 100;
      } else {
        this.questionTimer?.unsubscribe();
        this.isActiveQuestion = false;
        this.sendAnswer(this.question.question_num, this.correctAnswer);
      }
    });
  }

  startGetPlayersTimer() {
    this.service.sendGetPlayers({ subject: 'getPlayers' });
    this.ticks = 30;
    this.currentTicks = setInterval(() => {
      if (this.ticks > 0) {
        this.ticks = this.ticks - 1;
      } else {
        this.service.sendGetPlayers({
          subject: 'getPlayers',
        });
        this.ticks = 30;
      }
    }, 1000);
  }

  sendTime(td: Number) {
    this.timerData.value = td;
    this.service.sendTime(this.timerData);
  }

  sendIndMsg(channel_name: string, msg: string) {
    console.log('player channel name = ' + channel_name);
    let message: Message = <Message>{};
    message.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    message.reciever = channel_name;
    message.content = msg;
    message.type = 'ind_message';
    message.subject = 'message';

    // this.sent.push(message);
    this.service.sendIndMessage(message);
  }

  sendAnswer(question_num: number, answer: string) {

    if (this.answersArray.length > 0) {
      this.answersArray.forEach(ans => {
        if (ans.answer === this.correctAnswer)

          for (const obj of this.leaderBoard) {
            if (obj.userID === ans.userID) {
              obj.score = obj.score + 1;
              break;
            }
          };

        })

      };

    let msg2 = '';
    if (this.answersArray.length > 0) {
      const first: Answer | undefined = this.answersArray.find((ans) => {
        return ans.answer === this.correctAnswer;
      });

      if (first) {
        const fastestPlayer: PlayerChannel | undefined = this.players.find(
          (pl) => {
            return pl.userID === first.userID;
          }
        );

        for (const obj of this.leaderBoard) {
          if (obj.userID === first.userID) {
            obj.bonus = obj.bonus+ 1;
            break;
          }
        };

        msg2 = `The fastest answer was given by ${fastestPlayer?.username} in ${first.timeSpent}secs`;
      } else {
        msg2 = 'Nobody got the correct answer!';
      }
    }

    this.leaderBoard.sort((a, b) => b.score - a.score);

    let message: Message = <Message>{};
    message.source = this.isLoggedIn?.username
      ? this.isLoggedIn?.username
      : 'Anonymous';
    message.content =
      `The correct answer to question ${question_num} was ${answer}. ` + msg2;
    message.type = 'chat_message';
    message.subject = 'message';
    message.reciever = '';
    this.service.sendAnsMessage(message);
    this.sendLeaderboard();
  }

  getQuestionList(group: string) {
    let ql = this.questionService
      .getQuestionGroup(group)
      .subscribe((questionList) => {
        console.log(questionList);
        this.questionsArray = [];
        this.questionsArray = questionList;
        // this.dataSource = new MatTableDataSource(this.questionsArray);
        // this.dataSource.paginator = this.paginator;
        this.questionIndex = 0;
        this.question = this.newQuestion;
        //  this.loadQuestion(0);
        this.questionButtonArray = [];

        for (let i = 0; i < this.questionsArray.length; i++) {
          let b: buttonData = {
            index: i,
            questionNum: this.questionsArray[i].question_num,
            status: 'clean',
          };
          this.questionButtonArray.push(b);
        }
      });
  }

  sendTestMsg() {
    if (this.players.length > 0) {
      this.players.forEach((player) => {
        let msg = 'Message to ' + player.username;
        this.sendIndMsg(player.channel_name, msg);
      });
    }
  }

  sendLeaderboard() {
    const leaderboard: LeaderBoardDTO = {
      leaderboard: this.leaderBoard,
      subject: 'message',
      type: 'leaderboard'
    }
    this.service.sendLeaderboard(leaderboard)
  }
}
