import { Injectable } from '@angular/core';
import {Socket, SocketIoModule} from 'ngx-socket-io';

@Injectable()
export class GodSocketService extends Socket {

  constructor() {
    super({ url: 'http://localhost:8080', options: {} });
  }

}
