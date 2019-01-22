import { Injectable } from '@angular/core';
import {ExhibitSocketHelper} from '../../helper/exhibit-socket-helper';

@Injectable()
export class ExhibitSocketService
{

  private _connection: ExhibitSocketHelper;

  public openNewExhibitConnection(url: string): void
  {
    if (this._connection)
    {
      this._connection.disconnect();
    }
    this._connection = new ExhibitSocketHelper(url);
  }

  get connection(): ExhibitSocketHelper
  {
    return this._connection;
  }
}
