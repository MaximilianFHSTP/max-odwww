import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class GodService {

  constructor(private socket: Socket)
  {
    this.socket.on('news', msg =>
    {
      console.log(msg);
    });
  }

  public registerOD(data: any): any
  {
    this.socket.emit('registerOD', data);

    this.socket.on('registerODResult', result =>
    {
      //console.log(result.user);
      //console.log(result.locations);
      localStorage.setItem('user', result.user);
      localStorage.setItem('lookuptable', result.locations);
    });
  }
}
