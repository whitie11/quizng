import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Subject } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/operators';
import { isLoggedIn } from '../_models/isLoggedIn';
import { Question } from '../_models/question';
import { AuthService } from './auth.service';

const CHAT_URL =
  'ws://127.0.0.1:8000/quiz/?quiz_name=lobby&token=test_token&username=Fred';
const QM_URL =
  'ws://127.0.0.1:8000/quizmaster/?quiz_name=quiz1&token=test_token&username=QM';

export interface Message {
  source: string;
  content: string;
  type: string;
}

export interface Answer {
  source: any;
  type: any;
  player: string;
  question_no: string;
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private subject: AnonymousSubject<MessageEvent> | undefined;
  public messages: Subject<Message>;



  // private qmChannel: AnonymousSubject<MessageEvent> | undefined;
  // public qm_questions: Subject<Message>;

  isLoggedIn?: isLoggedIn;
  isLoggedIn$: Observable<isLoggedIn>;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = authService.isLoggedIn();

    this.isLoggedIn$.subscribe((d) => {
      this.isLoggedIn = {
        state: d.state,
        username: d.username,
        userID: d.userID,
      };
    });

    const username = this.isLoggedIn?.username ? this.isLoggedIn?.username : 'Fred';
    const QP_URL =
    'ws://127.0.0.1:8000/quiz/?quiz_name=lobby&token=test_token&username='+ username;

    this.messages = <Subject<Message>>this.connect(QP_URL).pipe(
      map((response: MessageEvent): Message => {
        console.log(response.data);
        let data = JSON.parse(response.data);
        return data;
      })
    );

    // this.qm_questions = <Subject<Message>>this.connectQM(QM_URL).pipe(
    //   map((response: MessageEvent): Message => {
    //     console.log(response.data);
    //     let data = JSON.parse(response.data);
    //     return data;
    //   })
    // );
  }

  ngOnInit(): void {

    // const username = this.isLoggedIn?.username ? this.isLoggedIn?.username : 'Fred';
    // const QP_URL =
    // 'ws://127.0.0.1:8000/quiz/?quiz_name=lobby&token=test_token&username='+ username;



  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log('Successfully connected: ' + url);
    }
    return this.subject;
  }

  // public connectQM(url: string): AnonymousSubject<MessageEvent> {
  //   if (!this.qmChannel) {
  //     this.qmChannel = this.createQM(url);
  //     console.log('Successfully connected: ' + url);
  //   }
  //   return this.qmChannel;
  // }

  private create(url: string): AnonymousSubject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      error: function () {},
      complete: function () {},
      next: (data: Object) => {
        console.log('Message sent to websocket: ', data);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      },
    };
    return new AnonymousSubject(observer, observable);
  }

  // private createQM(url: string): AnonymousSubject<MessageEvent> {
  //   let ws2 = new WebSocket(url);

  //   let observable = new Observable((obs: Observer<MessageEvent>) => {
  //     ws2.onmessage = obs.next.bind(obs);
  //     ws2.onerror = obs.error.bind(obs);
  //     ws2.onclose = obs.complete.bind(obs);
  //     return ws2.close.bind(ws2);
  //   });
  //   let observer = {
  //     error: function () {},
  //     complete: function () {},
  //     next: (data: Object) => {
  //       console.log('Question sent to websocket: ', data);
  //       if (ws2.readyState === WebSocket.OPEN) {
  //         ws2.send(JSON.stringify(data));
  //       }
  //     },
  //   };
  //   return new AnonymousSubject(observer, observable);

  // }
}
