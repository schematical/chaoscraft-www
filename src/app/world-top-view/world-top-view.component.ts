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
          this.loadWorld();
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
  }
  public loadWorld(){
    const req = new XMLHttpRequest();
    req.open('GET', `http://localhost:3000/bots/` + this.currBotUserame + `/world`);//`http://chaoscraft-api.schematical.com/bots`);

    req.onload = () => {
      let worldData = JSON.parse(req.response);
      console.log('this.worldData', worldData);
      this.setupMap(worldData);
    };


    req.send();
  }
  setupMap(worldData){
    MinecraftMapService.InitMap(new MCWorldMap(worldData))
    MinecraftMapService.Start();
  }
  keyup($event){

  }

}
