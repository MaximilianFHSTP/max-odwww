import { Injectable } from '@angular/core';
import {Socket, SocketIoModule} from 'ngx-socket-io';

@Injectable()
export class ExhibitSocketService extends Socket {

  constructor() {
    super({ url: 'http://localhost:8100', options: {} });
  }
}
