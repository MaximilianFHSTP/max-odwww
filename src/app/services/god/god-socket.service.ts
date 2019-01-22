import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable()
export class GodSocketService extends Socket {

  constructor() {
    super({ url: environment.godURL});
  }

}
