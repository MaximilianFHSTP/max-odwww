import {Component, OnInit, Injectable} from '@angular/core';
import {TransmissionService} from '../../services/transmission.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
@Injectable()
export class MainViewComponent implements OnInit {

  constructor(private transmissionService: TransmissionService){}

  ngOnInit() {
    this.transmissionService.transmitLocationRegister({minor: 301, major: 40});
  }
}
