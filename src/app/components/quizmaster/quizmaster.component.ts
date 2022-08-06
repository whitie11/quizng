import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Answer } from 'src/app/_models/answer';
import { isLoggedIn } from 'src/app/_models/isLoggedIn';
import { PlayerChannel } from 'src/app/_models/playerChannel';
import { Question } from 'src/app/_models/question';
import { timerData } from 'src/app/_models/timer';
// import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-quizmaster',
  templateUrl: './quizmaster.component.html',
  styleUrls: ['./quizmaster.component.css'],
})
export class QuizmasterComponent implements OnInit, OnDestroy {
  // title = 'socketrv';
  // content = '';
  // received: any[] = [];
  // sent: any[] = [];

  isLoggedIn?: isLoggedIn;
  isLoggedIn$: Observable<isLoggedIn>;

  answersArray: Answer[] =[];

  question: Question = {
      ID: 1,
      text: 'What is .....',
      answerA: 'Red',
      answerB: 'Yellow',
      answerC: 'Green',
      answerD: 'Blue',
      subject: 'question',
      type: 'question',
      time: 30,
    }

    timerData: timerData = {
      value:  100,
      subject: 'timer'
    }

    timeLeft: any;
    interval: any;

    players: PlayerChannel[] =[];

    currentTicks: any = 0;
    ticks: any;

  constructor(private service: DataService, private authService: AuthService) {


    this.isLoggedIn$ = this.authService.isLoggedIn();

    this.isLoggedIn$.subscribe((d) => {
      this.isLoggedIn = {
        state: d.state,
        username: d.username,
        userID: d.userID,
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
    });

  }
  ngOnDestroy(): void {
  // this.service.closePlayer()
  }

  ngOnInit(): void {
    console.log('starting QM page page!!!!');
    this.startGetPlayersTimer()
  }



  sendQuestion() {
    this.service.sendQuestion(this.question);
    //  TODO start timer
    // this.startTimer();
  }

  startTimer() {
    this.timeLeft = 60;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft = this.timeLeft-1;
        this.sendTime(this.timeLeft)
      } else {
        // this.timeLeft = 60;
        clearInterval(this.interval)
      }
    },1000)
  }

  startGetPlayersTimer() {
    this.service.sendGetPlayers({'subject': 'getPlayers'})
    this.ticks = 30;
    this.currentTicks = setInterval(() => {
      if (this.ticks > 0) {
        this.ticks = this.ticks-1;
      } else {
        this.service.sendGetPlayers(
          {
            'subject': 'getPlayers'
          }
          )
        this.ticks=30
      }
    },1000)
  }

  sendTime(td: Number) {
    this.timerData.value = td;
    this.service.sendTime(this.timerData);
  }
}
