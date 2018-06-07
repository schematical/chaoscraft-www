import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Params } from '@angular/router';
import { SocketService } from '../socket.service'
import { HttpClient }  from '../shared/data';

@Component({
  selector: 'app-bot-vision',
  templateUrl: './bot-vision.component.html',
  styleUrls: ['./bot-vision.component.css']
})
//I think we are going to need to put some type of tool to pass in the node we are monitoring
export class BotVisionComponent implements OnInit {

  private currBotUserame:string = null;
  private bot:any = null;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private socket: SocketService
  ) {

  }

  ngOnInit() {


    this.route.paramMap.subscribe((paramMap)=>{
      this.currBotUserame = paramMap.get('bot');

    })
    this.socket.clientStartObserve({
      username: this.currBotUserame
    })

  }

}
