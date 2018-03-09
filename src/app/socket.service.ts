import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
@Injectable()
export class SocketService {
  public static client_fire_outputnode = 'client_fire_outputnode';
  protected socket:SocketIOClient.Socket = null;
  constructor() {

    this.socket = io('http://localhost:3000');//https://chaoscraft-api.schematical.com');
    console.log("Setting Up Socket");

    this.socket.on('www_hello_response', (message) => {
      console.log('www_hello_response', message)
    })

    this.socket.emit('www_hello', {foo: 'bar'});
  }
  on(event, callback){
    this.socket.on(event, callback);
  }

}
