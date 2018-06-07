import { Component, OnInit } from '@angular/core';
import * as _ from 'underscore';
import * as d3 from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Zoom from 'd3-zoom';
import * as d3Force from 'd3-force';
//import * as MinecraftData  from  'minecraft-data' ;
import { ActivatedRoute, Params } from '@angular/router';
import { SocketService } from '../socket.service'
import { HttpClient }  from '../shared/data';
@Component({
  selector: 'app-bot-view',
  templateUrl: './bot-view.component.html',
  styleUrls: ['./bot-view.component.css']
})
export class BotViewComponent implements OnInit {
  //protected minecraftData:any = null;
  //protected http:HttpClient = null;

  private brainData:any = null;
  private currBotUserame:string = null;
  private minecraftData:any = null;
  private stats:string = null;
  private page:string = 'bot-view';
  private bot:any = null;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private socket: SocketService
  ) {

    this.http.loadMinecraftData()
      .then((minecraftData)=>{
        this.minecraftData = minecraftData;
      })
      .catch((err)=>{
        console.error("Error Loading MinecraftData:" + err.message);
      })
  }
  public getStats($event) {
    $event.preventDefault();
    const req = new XMLHttpRequest();
    req.open('GET', `http://localhost:3000/bots/` + this.currBotUserame + '/stats');//`http://chaoscraft-api.schematical.com/bots`);

    req.onload = () => {
      this.stats = JSON.stringify(JSON.parse(req.response), null, 3);
      this.page = 'stats';
    };

    req.send();
  }

  public getInventory($event) {
    $event.preventDefault();
    const req = new XMLHttpRequest();
    req.open('GET', `http://localhost:3000/bots/` + this.currBotUserame + '/inventory');//`http://chaoscraft-api.schematical.com/bots`);

    req.onload = () => {
      this.stats = JSON.stringify(JSON.parse(req.response), null, 3);
      this.page = 'inventory';
    };

    req.send();
  }
  public editBot($event){
    $event.preventDefault();
    const req = new XMLHttpRequest();
    req.open('GET', `http://localhost:3000/bots/` + this.currBotUserame);//`http://chaoscraft-api.schematical.com/bots`);

    req.onload = () => {
      this.bot = JSON.parse(req.response);
      console.log('this.bot', this.bot);
      this.page = 'edit';
    };


    req.send();
  }
  public saveBot($event){
    $event.preventDefault();
    const req = new XMLHttpRequest();
    req.open('POST', `http://localhost:3000/bots/` + this.currBotUserame, this.bot);//`http://chaoscraft-api.schematical.com/bots`);

    req.onload = () => {
      this.bot = JSON.parse(req.response);
      this.page = 'edit';
    };
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(this.bot));
    //req.send();
  }
  ngOnInit() {

    let self = this;

    this.route.paramMap.subscribe((paramMap)=>{
      this.currBotUserame = paramMap.get('bot');

    })
    this.socket.clientStartObserve({
      username: this.currBotUserame
    })

  }
  //TODO: Make this a real thing
  ngOnWhateverClosesThePage(){
    this.socket.clientEndObserve({
      username: this.currBotUserame
    })
  }



}
