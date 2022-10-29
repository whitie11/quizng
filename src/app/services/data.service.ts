import { Injectable, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import {
  Observable,
  timer,
  Subject,
  EMPTY,
  BehaviorSubject,
  observable,
} from 'rxjs';
import {
  retryWhen,
  tap,
  delay,
  switchAll,
  catchError,
  take,
} from 'rxjs/operators';
import { AuthService } from './auth.service';
import { isLoggedIn } from '../_models/isLoggedIn';
import { Message } from '../_models/message';
import { Answer } from '../_models/answer';
import { PlayerChannel } from '../_models/playerChannel';
import { Question } from '../_models/question';
import { timerData } from '../_models/timer';
// import { json } from 'stream/consumers';
// import { JsonPipe } from '@angular/common';

export const RECONNECT_INTERVAL = 2000;

@Injectable({
  providedIn: 'root',
})
export class DataService implements OnInit {
  WS_ENDPOINT = environment.WS_ENDPOINT;
  ANS_ENDPOINT = environment.ANS_ENDPOINT;

  private socket$?: WebSocketSubject<any>;
  isConnectedSubject = new BehaviorSubject<Boolean>(false);

  private ansSocket$?: WebSocketSubject<any>;
  isConnectedAnsSubject = new BehaviorSubject<Boolean>(false);

  isLoggedIn?: isLoggedIn;
  isLoggedIn$?: Observable<isLoggedIn>;

  private messagesSubject$ = new BehaviorSubject<Observable<Message>>(EMPTY);
  public messages$ = this.messagesSubject$.pipe(
    switchAll(),
    catchError((e) => {
      throw e;
    })
  );

  private answerSubject$ = new BehaviorSubject<Observable<Answer>>(EMPTY);
  public answer$ = this.answerSubject$.pipe(
    switchAll(),
    catchError((e) => {
      throw e;
    })
  );

  private timerSubject$ = new BehaviorSubject<Observable<Number>>(EMPTY);
  public timer$ = this.timerSubject$.pipe(
    switchAll(),
    catchError((e) => {
      throw e;
    })
  );

  private questionSubject$ = new BehaviorSubject<Observable<Question>>(EMPTY);
  public question$ = this.questionSubject$.pipe(
    switchAll(),
    catchError((e) => {
      throw e;
    })
  );

  private playerSubject$ = new BehaviorSubject<Observable<PlayerChannel[]>>(
    EMPTY
  );
  public playerList$ = this.playerSubject$.pipe(
    switchAll(),
    catchError((e) => {
      throw e;
    })
  );

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
    this.isLoggedIn$.subscribe((d) => {
      this.isLoggedIn = {
        state: d.state,
        username: d.username,
        userID: d.userID,
        role: d.role,
      };
    });
  }

  ngOnInit(): void {}

  /**
   * Creates a new WebSocket subject and send it to the messages subject
   * @param cfg if true the observable will be retried.
   */
  public connectPlayer(
    cfg: { reconnect: boolean } = { reconnect: false }
  ): void {
    let lg = this.isLoggedIn?.username;

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      const messages = this.socket$.pipe(
        cfg.reconnect ? this.reconnect : (o) => o,
        tap({
          error: (error) => console.log(error),
        }),
        catchError((_) => EMPTY)
      );
      //toDO only next an observable if a new subscription was made double-check this

      messages.subscribe((msg) => {
        console.log('Message subject: ' + msg.subject);

        if (msg.subject == 'message') {
          let new_msg: Message = <Message>{};
          new_msg.subject = msg.subject;
          new_msg.source = msg.source;
          new_msg.content = msg.content;
          new_msg.type = msg.type;

          let obs = new BehaviorSubject<Message>(new_msg);
          this.messagesSubject$.next(obs);
        } else if (msg.subject == 'answer') {
          console.log('new answer recieved');
          let new_ans: Answer = {
            source: msg.source,
            userID: msg.userID,
            answer: msg.answer,
            type: msg.type,
            subject: msg.subject,
            question_ID: msg.question_ID,
            question_num: msg.question_num,
            timeSpent: msg.timeSpent,
          };
          let obs = new BehaviorSubject<Answer>(new_ans);
          this.answerSubject$.next(obs);
        } else if (msg.subject == 'question') {
          console.log('new question recieved???????');
          const new_question: Question = {
            ID: msg.ID,
            group: msg.group,
            question_num: msg.question_num,
            text: msg.text,
            answerA: msg.answerA,
            answerB: msg.answerB,
            answerC: msg.answerC,
            answerD: msg.answerD,
            subject: 'question',
            type: 'question',
            duration: msg.duration,
            startTime: msg.startTime,
          };
          let obs = new BehaviorSubject<Question>(new_question);
          this.questionSubject$.next(obs);
        } else if (msg.subject == 'timer') {
          let obs = new BehaviorSubject<any>(msg.value);
          this.timerSubject$.next(obs);
        }
      });
    }
  }

  private reconnect(observable: Observable<any>): Observable<any> {
    return observable.pipe(
      retryWhen((errors) =>
        errors.pipe(
          tap((val) => console.log('[Data Service] Try to reconnect', val)),
          delay(2000)
        )
      )
    );
  }

  public connectAns(cfg: { reconnect: boolean } = { reconnect: false }): void {
    let lg = this.isLoggedIn?.username;

    if (!this.ansSocket$ || this.ansSocket$.closed) {
      this.ansSocket$ = this.getNewAnsSocket();
      const res = this.ansSocket$.pipe(
        cfg.reconnect ? this.reconnect : (o) => o,
        tap({
          error: (error) => console.log(error),
        }),
        catchError((_) => EMPTY)
      );
      //toDO only next an observable if a new subscription was made double-check this

      res.subscribe((data) => {
        console.log('Message type: ' + data.type);
        if (data.type == 'answer') {
          let new_ans: Answer = {
            source: data.source,
            userID: data.userID,
            answer: data.answer,
            type: data.type,
            subject: data.subject,
            question_ID: data.question_ID,
            question_num: data.question_num,
            timeSpent: data.timeSpent,
          };
          let obs = new BehaviorSubject<Answer>(new_ans);
          this.answerSubject$.next(obs);
        } else if (data.type == 'playersList') {
          let pl: PlayerChannel[] = [];
          // let d = data.playersList;
          // let st = JSON.parse(d);
          // for(let p of st){
          //   pl.push(p);
          // }
          pl = JSON.parse(data.playersList);
          let obs = new BehaviorSubject<PlayerChannel[]>(pl);
          this.playerSubject$.next(obs);
        }
      });
    }
  }

  private reconnectAns(observable: Observable<any>): Observable<any> {
    return observable.pipe(
      retryWhen((errors) =>
        errors.pipe(
          tap((val) => console.log('[Ans Service] Try to reconnect', val)),
          delay(2000)
        )
      )
    );
  }

  closePlayer() {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
      this.isConnectedSubject.next(false);
    }
  }

  closeAns() {
    if (this.ansSocket$) {
      this.ansSocket$.complete();
      this.ansSocket$ = undefined;
      this.isConnectedAnsSubject.next(false);
    }
  }

  isConnected() {
    return this.isConnectedSubject.asObservable();
  }

  isAnsConnected() {
    return this.isConnectedAnsSubject.asObservable();
  }

  sendMessage(msg: any) {
    console.log('sending message!!!:' + msg.content);
    if (this.socket$) {
      this.socket$.next(msg);
    }
  }

  sendAnsMessage(msg: any) {
    console.log('sending Answer!!!:' + msg.content);
    if (this.ansSocket$) {
      this.ansSocket$.next(msg);
    }
  }

  sendIndMessage(msg: any) {
    if (this.ansSocket$) {
      this.ansSocket$.next(msg);
    }
  }

  sendQuestion(question: Question) {
    if (this.ansSocket$) {
      this.ansSocket$.next(question);
    }
  }

  sendGetPlayers(req: any) {
    if (this.ansSocket$) {
      this.ansSocket$.next(req);
    }
  }

  sendTime(timer: timerData) {
    if (this.ansSocket$) {
      this.ansSocket$.next(timer);
    }
  }

  /**
   * Return a custom WebSocket subject which reconnects after failure
   */
  private getNewWebSocket() {
    let username = this.isLoggedIn?.username
      ? this.isLoggedIn.username
      : 'Anonymous';
    let userID = this.isLoggedIn?.userID
      ? this.isLoggedIn.userID
      : 0;
    // ?quiz_name=lobby&token=test_token&username=Fred
    const game_url =
      this.WS_ENDPOINT +
      '?room_name=lobby' +
      '&token=' +
      'testToken' +
      '&username=' +
      username +
      '&userID=' +
      userID;

    return webSocket({
      url: game_url,
      openObserver: {
        next: () => {
          console.log('[DataService]: connection ok');
          this.isConnectedSubject.next(true);
        },
      },
      closeObserver: {
        next: () => {
          console.log('[DataService]: connection closed');
          this.socket$ = undefined;
          // this.connect({ reconnect: true });
          this.isConnectedSubject.next(false);
        },
      },
    });
  }

  private getNewAnsSocket() {
    let username = this.isLoggedIn?.username
      ? this.isLoggedIn.username
      : 'Anonymous';

    const ans_url =
      this.ANS_ENDPOINT +
      '?room_name=lobby1' +
      '&token=' +
      'testToken' +
      '&username=' +
      username;

    return webSocket({
      url: ans_url,
      openObserver: {
        next: () => {
          console.log('[AnsService]: connection ok');
          this.isConnectedSubject.next(true);
        },
      },
      closeObserver: {
        next: () => {
          console.log('[AnsService]: connection closed');
          this.ansSocket$ = undefined;
          // this.connectAns({ reconnect: true });
          this.isConnectedAnsSubject.next(false);
        },
      },
    });
  }
}
