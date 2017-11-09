import { Injectable } from '@angular/core';
import {Socket, SocketIoModule} from 'ngx-socket-io';

@Injectable()
export class ExhibitSocketService extends Socket {

  constructor() {
    super({ url: 'http://192.168.8.253:3000', options: {} });
  }
}
