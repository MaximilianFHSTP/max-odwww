import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import {LocationService} from '../../services/location.service';
import {ExhibitService} from '../../services/exhibit/exhibit.service';
import {Unsubscribe} from 'redux';
import {LocationActions} from '../../store/actions/LocationActions';
import {NativeCommunicationService} from '../../services/native/native-communication.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-content-table-on',
  templateUrl: './content-table-on.component.html',
  styleUrls: ['./content-table-on.component.css']
})
export class ContentTableOnComponent implements OnInit, OnDestroy {
  public connectionSuccess: boolean;
  public locationName: string;
  public waitingToStart: boolean;
  public notAnswered: boolean;
  public noResponse: boolean;

  public locationId: any;
  public question: string;
  public answerA: string;
  public answerB: string;
  public answerC: string;
  public answerD: string;
  private answerChar: string;
  public yourAnswer: string;
  public yourPoints: string;
  public yourStatus: string;
  public correctAnswer: string;
  public elaboration: string;

  private _location: any;
  private readonly _unsubscribe: Unsubscribe;
  private subscriptionQuestion: any;
  private subscriptionAnswer: Subscription;
  private subscriptionPoints: Subscription;

  constructor(
    private exhibitService: ExhibitService,
    private locationService: LocationService,
    private nativeCommunicationService: NativeCommunicationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private alertService: AlertService,
    private router: Router
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.connectionSuccess = state.connectedToExhibit;
    });
  }

  ngOnInit() {
    this._location = this.locationService.currentLocation.value;
    this.locationName = this._location.description;
    this.locationId = this._location.parentId;

    const parentLocation = this.locationService.findLocation(this._location.parentId);

    if(this.locationId!==301){
      // TODO: get IP address from LocationService
      const url = 'http://' + parentLocation.ipAddress + ':8100';

      this.exhibitService.establishExhibitConnection(url);

      this.exhibitService.connectOD();
    }
    if(this.locationId===301){
      this.forwardToQuiz301();
    }

    if(this.locationId!==301){
      // localStorage.setItem('onExhibit', JSON.stringify(true));
      this.appStore.dispatch(this.locationActions.changeOnExhibit(false));
      this.locationService.stopLocationScanning();
    }
  }

  ngOnDestroy()
  {
    if(this.locationId!==301){
      this.exhibitService.disconnect();
    }
    this._unsubscribe();
  }

  public disconnectFromExhibit()
  {
    this.exhibitService.disconnect();
  }

  public sendMessageToExhibit()
  {
    this.exhibitService.sendMessage();
  }

  forwardToQuiz301(){
    this.router.navigate(['/quiz']);
  }
}
