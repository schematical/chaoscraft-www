import { Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
export interface Node {
  label: string,
  layer: number,
}
@Injectable()
class HttpClient{
  constructor(private http:Http){

  }
  loadBrain(brainId:string){

    let p = new Promise((resolve, reject)=>{

      let options:any = {}
      //options.headers =  this.headers;
      options.withCredentials = true;

      return this.http.get(
        'http://localhost:3000/bots/' + brainId + '/brain',
        new RequestOptions(options)
      )
      .subscribe((res: Response) => {
        let rawNodes = res.json();
        let parsedNodes = [];
        let links = [];
        Object.keys(rawNodes).forEach((id)=>{
          rawNodes[id].id = id;
          parsedNodes.push(rawNodes[id]);
          if(!rawNodes[id].dependants){
            return;
          }
          rawNodes[id].dependants.forEach((dependant)=>{
            links.push({
              source: id,
              target: dependant.id,
              value: dependant.weight || (1/rawNodes[id].dependants)
            })
          })
        })
        return resolve({
          nodes:parsedNodes,
          links:links
        });
      })
    })
    return p;


  }
}
export { HttpClient };
