import { Component, OnInit } from '@angular/core';
import * as _ from 'underscore'
@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  private stats:any = {};
  private orderedStats:Array<any> =[];
  private statKeys:Array<string> = [];
  constructor() { }

  ngOnInit() {
    this.getStats();
  }

  showStats($event, statKey){
    $event.preventDefault();
    let stats = [];
    Object.keys(this.stats[statKey]).forEach((username)=>{
      stats.push({
        username:username,
        value:this.stats[statKey][username]
      })
    })
    this.orderedStats = _.sortBy(stats, (statData)=>{
      return 0 - statData.value;
    })
  }


  public getStats() {
    const req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:3000/stats');//`http://chaoscraft-api.schematical.com/bots`);

    req.onload = () => {
      this.stats = JSON.parse(req.response);
      this.statKeys = Object.keys(this.stats);
      console.log(this.statKeys);
    };

    req.send();
  }

}
