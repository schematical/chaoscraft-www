import { Component, OnInit } from '@angular/core';
import { MinecraftMapService, MCWorldMap } from '../minecraft-map.service';
import { ActivatedRoute, Params } from '@angular/router';
import * as _ from 'underscore';
import { SocketService } from '../socket.service'
import { HttpClient }  from '../shared/data';
@Component({
  selector: 'app-world-top-view',
  templateUrl: './world-top-view.component.html',
  styleUrls: ['./world-top-view.component.css']
})
export class WorldTopViewComponent implements OnInit {
  private currBotUserame:string = null;
  private minecraftData:any = null;
  protected brainData:any = null;
  protected sidebarOpen:boolean = false;
  protected displayRange:any = {};
  protected debugNode:any;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private socket: SocketService
  ) {
    this.route.paramMap.subscribe((paramMap)=> {
      this.currBotUserame = paramMap.get('bot');
      this.http.loadMinecraftData()
        .then((minecraftData) => {
          this.minecraftData = minecraftData;
        })
        .then(() => {
          return this.http.loadBrain(this.currBotUserame)
        })
        .then((brainData: any) => {
          this.brainData = brainData;
          return this.loadWorld();
        })
        .then((worldData:any)=>{
           this.setupMap(worldData, this.brainData);
           this.displayRange.min = Math.floor(worldData.position.y) - 5;
           this.displayRange.max = Math.floor(worldData.position.y) + 5;
        })
        .catch((err) => {
          console.error("Error Loading MinecraftData:" + err.message);
        })
    });
  }

  ngOnInit() {
    this.socket.emit('map_nearby_request', {
      username: this.currBotUserame
    })
    this.socket.on('debug_update_entity', (payload)=>{
      //Check if entity exists
      if(!MinecraftMapService.Objects[payload.entity.id]){
        //TODO: Figure out what entity to display

        //MinecraftMapService.AddObject(payload.entity.id, )
      }
    })
  }
  updateMap(){
    if(this.displayRange.min && this.displayRange.max) {
      MinecraftMapService.Settings.viewport_max_y = this.displayRange.max;
      MinecraftMapService.Settings.viewport_min_y = this.displayRange.min;
    }
    MinecraftMapService.Cycle();

  }
  public loadWorld(){
    return new Promise((resolve, reject)=>{
      const req = new XMLHttpRequest();
      req.open('GET', `http://localhost:3000/bots/` + this.currBotUserame + `/world`);//`http://chaoscraft-api.schematical.com/bots`);

      req.onload = () => {
        let worldData = JSON.parse(req.response);

        return resolve(worldData);
      };


      req.send();
    })

  }
  setupMap(worldData, brainData){
    MinecraftMapService.InitMap(new MCWorldMap(worldData, brainData))
    MinecraftMapService.Start();
  }
  keyup($event){

  }
  toggleSidebar(){
    this.sidebarOpen = !this.sidebarOpen;
  }
  setDebugNode(){
    if(_.isString(this.debugNode)) {
      MinecraftMapService.Debug.brainNode = this.brainData.indexedNodes[this.debugNode];
    }else{
      MinecraftMapService.Debug.brainNode = this.debugNode;
    }
    MinecraftMapService.Cycle();
  }

}
