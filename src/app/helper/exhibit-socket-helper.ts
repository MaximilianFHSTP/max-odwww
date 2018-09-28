import {Socket} from 'ngx-socket-io';

export class ExhibitSocketHelper extends Socket {

  constructor(exhibitURL) {
    super({ url: exhibitURL, options: {} });
  }
}
