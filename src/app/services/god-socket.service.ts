import { Injectable } from '@angular/core';
import {Socket, SocketIoModule} from 'ngx-socket-io';

@Injectable()
export class GodSocketService extends Socket {

  constructor() {
    // super({ url: 'https://god.meeteux.fhstp.ac.at:3000', options: {secure: true} });
    super({ url: 'https://192.168.178.48:3000', options: {secure: true} });
    // super({ url: 'https://god.meeteux.fhstp.ac.at', options: {secure: true} });
  }

}
