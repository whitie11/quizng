import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  providers: [WebsocketService, ChatService]
})
export class AboutComponent implements OnInit {

  constructor(private chatService: ChatService) {
    // chatService.messages.subscribe(msg => {
    //   console.log("Response from websocket: " + msg);
    //   this.chatServiceMessage = msg.message;
    // });
  }

  ngOnInit(): void {
  }
  chatServiceMessage = 'Waiting...'

  private message = {
    author: "tutorialedge",
    message: "this is a test message"
  };

  sendMsg() {
    // console.log("new message from client to websocket: ", this.message);
    // this.chatService.messages.next(this.message);
    // // this.message.message = "";
  }

}
