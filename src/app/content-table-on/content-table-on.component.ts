import { Component, OnInit, OnDestroy } from '@angular/core';
import { GodService } from '../god.service';

@Component({
  selector: 'app-content-table-on',
  templateUrl: './content-table-on.component.html',
  styleUrls: ['./content-table-on.component.css']
})
export class ContentTableOnComponent implements OnInit {
  private connectionSuccess: boolean;

  constructor(
    private godService: GodService,
  ) { }

  ngOnInit() {
    // TODO get IP address from LocationService

    // TODO open SocketConnection connectOD(user)
    // if success set connectionSuccess true
    this.connectionSuccess = true;
  }

  ngOnDestroy() {
    // TODO socket-Verbindung schließen disconnectOD
  }
}
