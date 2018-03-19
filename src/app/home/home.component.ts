import { Component, OnInit } from '@angular/core';

import { SocketService } from '../socket.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selected: any[] = [];
  public rows = [];
  public loadingIndicator: boolean = true;
  public reorderable: boolean = true;

  public columns = [
    { prop: 'name' },
    { name: 'generation' },
    { name: 'username' },
    { name: 'alive' },
    {
      name: 'lastAction'
    }
  ];

  constructor(
    private socket:SocketService
  ) {

  }
  ngOnInit() {
    this.fetch((data) => {
      this.rows = data;
      setTimeout(() => { this.loadingIndicator = false; }, 1500);
    });
    this.socket.on('client_hello', (bot)=>{
      bot.updated = Date.now().toString();
      let botExists = false;
      this.rows.forEach((i)=>{
        if(this.rows[i].username == bot.username){
          botExists = true;
        }
        this.rows[i] = bot;
      })
      if(!botExists) {
        this.rows.push(bot);
      }
      this.rows = [...this.rows];
    })


    this.socket.on(SocketService.client_fire_outputnode, (payload)=> {
      console.log(SocketService.client_fire_outputnode, payload)
      this.rows.forEach((row)=>{
        if(row.username != payload.username){
          return;
        }
        row.lastAction = payload.type;
        row.updated = Date.now().toString();
        this.rows = [...this.rows];
        setTimeout(((row)=>{
          row.lastAction = null;
          row.updated = Date.now().toString();
        })(row), 5000);

      })
    });
  }

  public fetch(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `http://localhost:3000/bots`);//`http://chaoscraft-api.schematical.com/bots`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }



  onActivate(e){
    console.log("onActivate",e);
    window.location.href = '/bots/' + e.row.username;
  }
  onSelect(event) {
    console.log('Event: select', event, this.selected);
  }


}
