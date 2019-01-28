import {Component, OnInit, Inject, Injectable, OnDestroy} from '@angular/core';
import {NativeResponseService} from '../../services/native/native-response.service';
import {LocationService} from '../../services/location.service';
import {UserActions} from '../../store/actions/UserActions';
import {LocationActions} from '../../store/actions/LocationActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {Unsubscribe} from 'redux';
import {MatIconRegistry, MatDialog, MatDialogConfig} from '@angular/material';
import {AlertDialogComponent} from '../alert-dialog/alert-dialog.component';
import {AlertService} from '../../services/alert.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {TransmissionService} from '../../services/transmission.service';

@Component({
  selector: 'app-wappen',
  templateUrl: './wappen.component.html',
  styleUrls: ['./wappen.component.css']
})
export class WappenComponent implements OnInit {
  private readonly _unsubscribe: Unsubscribe;
  private registerLocationmessage: any;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;

  public user: any;
  public timelineLocations: any;
  public isWeb: boolean;
  public closestExhibit: number;

  public locationId: string;

  showSettings = false;
  showHelp = false;
  settingsContent = 'shield';
  setShield = 'Shield1';
  setEmblem = 'Emblem2';
  setHelmet = 'Helmet2';
  setWeapon = 'Mantle1';
  setColorPrimary = 'Color2';
  setColorSecondary = 'Color4';
  selectedShield = 'Shield1';
  selectedEmblem = 'Emblem2';
  selectedHelmet = 'Helmet2';
  selectedWeapon = 'Mantle1';
  unlockedItems: string[] = ['Shield1','Shield2','Shield3','Shield4','Emblem2','Emblem3','Emblem4','Emblem5',
  'Emblem6','Helmet1','Helmet2','Helmet3','Mantle1','Mantle3'];
  /* unlockedItems: string[] = ['Shield1','Shield2','Shield3','Shield4','Emblem1','Emblem2','Emblem3','Emblem4','Emblem5',
  'Emblem6','Helmet1','Helmet2','Helmet3','Helmet4','Mantle1','Mantle2', 'Mantle3','Mantle4']; */
  itemsList: any[];
/* {{user.name}} */
  constructor(
    private transmissionService: TransmissionService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private nativeCommunicationService: NativeCommunicationService,
    private nativeResponseService: NativeResponseService,
    private dialog: MatDialog,
    public router: Router,
    private alertService: AlertService
  )
  {
    this._unsubscribe = this.appStore.subscribe(() =>
    {
      const state = this.appStore.getState();
      this.closestExhibit = state.closestExhibit;
      this.timelineLocations = this.locationService.getTimelineLocations();
    });

    this.subscriptionLocationid = this.alertService.getMessageLocationid().subscribe(message => {
      this.registerLocationmessage = message;
    });
  }

  ngOnInit() {
    const state = this.appStore.getState();
    this.user = state.user;
    this.locationService.lookuptable = state.lookupTable;
    this.timelineLocations = this.locationService.getTimelineLocations();
    this.closestExhibit = state.closestExhibit;
    console.log('ClosestExhibit: ' + this.closestExhibit);

    this.isWeb = this.nativeCommunicationService.isWeb;

    this.getItemsWappen();
  }

  getItemsWappen(){
    this.itemsList = [];
    // Escutcheon 
    this.itemsList.push({id:  1, type: 'shield', name: 'Shield1', task: ''});
    this.itemsList.push({id:  2, type: 'shield', name: 'Shield2', task: ''});
    this.itemsList.push({id:  3, type: 'shield', name: 'Shield3', task: ''});
    this.itemsList.push({id:  4, type: 'shield', name: 'Shield4', task: ''});
    // Charge
    this.itemsList.push({id:  5, type: 'symbol', name: 'Emblem2', task: 'Switch to Sunthaym’s perspective on any exhibit.'});
    this.itemsList.push({id:  6, type: 'symbol', name: 'Emblem5', task: 'Have 5 questions right in the Weißkunig game.'});
    this.itemsList.push({id:  7, type: 'symbol', name: 'Emblem6', task: 'Participate in the Legend Game.'});
    this.itemsList.push({id:  8, type: 'symbol', name: 'Emblem1', task: 'Create the legend of Klosterneuburg in the Legend Game.'});
    this.itemsList.push({id:  9, type: 'symbol', name: 'Emblem3', task: 'Attend the audience (unlock all exhibits until throne).'});
    this.itemsList.push({id: 10, type: 'symbol', name: 'Emblem4', task: 'Participate in the GenVis'});
    // Helmet 
    this.itemsList.push({id: 11, type: 'helmet', name: 'Helmet1', task: 'Explore the Sunthaym Panels with AR.'});
    this.itemsList.push({id: 12, type: 'helmet', name: 'Helmet2', task: 'Create any legend in the Legend Game.'});
    this.itemsList.push({id: 13, type: 'helmet', name: 'Helmet3', task: 'Have 10 questions right in the Weißkunig game.'});
    this.itemsList.push({id: 14, type: 'helmet', name: 'Helmet4', task: 'Learn more about Maximilian’s death on the upper floor.'});
    // Mantling 
    this.itemsList.push({id: 15, type: 'mantling', name: 'Mantle1', task: 'Explore the shrine with AR.'});
    this.itemsList.push({id: 16, type: 'mantling', name: 'Mantle2', task: 'Switch to Till’s perspective on any exhibit.'});
    this.itemsList.push({id: 15, type: 'mantling', name: 'Mantle3', task: 'Participating in the Weißkunig game.'});
    this.itemsList.push({id: 16, type: 'mantling', name: 'Mantle4', task: 'Find one special person in the GenVis.'});
  }

  // Check if item is unlocked
  isUnlocked(item: string): boolean{
    if (this.unlockedItems.indexOf(item) !== -1){
      return true;
    }
    return false;
  }

  selectShield(id: string){
    this.selectedShield = id.toString();
    if (this.isUnlocked(this.selectedShield)){
      this.setShield = id.toString();
    }
  }

  selectEmblem(id: string){
    this.selectedEmblem = id.toString();
    if (this.isUnlocked(this.selectedEmblem)){
      this.setEmblem = id.toString();
    }
  }

  selectHelmet(id: string){
    this.selectedHelmet = id.toString();
    if (this.isUnlocked(this.selectedHelmet)){
      this.setHelmet = id.toString();
    }
  }

  selectWeapon(id: string){
    this.selectedWeapon = id.toString();
    if (this.isUnlocked(this.selectedWeapon)){
      this.setWeapon = id.toString();
    }
  }

  selectPrimaryColor(color: string){
    this.setColorPrimary = color.toString();
  }

  selectSecondaryColor(color: string){
    this.setColorSecondary = color.toString();
  }

  displaySettings(id: string){
    this.selectedShield = this.setShield;
    this.selectedEmblem = this.setEmblem;
    this.selectedHelmet = this.setHelmet;
    this.selectedWeapon = this.setWeapon;

    if(this.settingsContent === id.toString()){
      if(this.showSettings){
        this.showSettings = false;
      } else{
        this.showSettings = true;
      }
    } else {
      this.settingsContent = id.toString();
      this.showSettings = true;
    }
  }

  closeWappenSettings(){
    this.showSettings = false;
  }

  displayHelp(){
    this.showHelp = true;
  }

  closeHelp(){
    this.showHelp = false;
  }

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

}
