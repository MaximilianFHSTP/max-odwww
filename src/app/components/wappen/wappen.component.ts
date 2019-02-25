import { Component, OnInit, Inject, AfterViewInit, AfterViewChecked, Injectable, OnDestroy } from '@angular/core';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { Unsubscribe} from 'redux';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TransmissionService } from '../../services/transmission.service';
import { LanguageService } from '../../services/language.service';
import * as coaTypes from '../../config/COATypes';
import { CoaService } from '../../services/coa.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-wappen',
  templateUrl: './wappen.component.html',
  styleUrls: ['./wappen.component.css']
})
export class WappenComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  private readonly _unsubscribe: Unsubscribe;
  private registerLocationmessage: any;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;

  public user: any;
  subscriptionCoaParts: Subscription;
  userCoaParts: any;
  subscriptionUserCoaParts: Subscription;
  allCoaColors: any;
  subscriptionCoaColors: Subscription;

  public locationId: string;
  updatePart = false;
  showSettings = false;
  showHelp = false;
  settingsContent = 'shield';
  setShield = '';
  setEmblem = '';
  setHelmet = '';
  setWeapon = '';
  setColorPrimary = '';
  setColorSecondary = '';
  selectedShield = '';
  selectedEmblem = '';
  selectedHelmet = '';
  selectedWeapon = '';
  unlockedItems: any[];
  itemsList: any[];
  saveBtnActive = false;

  constructor(
    private transmissionService: TransmissionService,
    @Inject('AppStore') private appStore,
    private nativeCommunicationService: NativeCommunicationService,
    public router: Router,
    private languageService: LanguageService,
    private alertService: AlertService,
    private coaService: CoaService
  ){
    this._unsubscribe = this.appStore.subscribe(() =>{
      const state = this.appStore.getState();
      // console.log(state.user);
    });

    this.subscriptionUserCoaParts = this.alertService.getMessageUserCoaParts().subscribe(message => {
      coaService.setUserCoaParts(message.data);
      this.unlockedItems = coaService.unlockedItems;
    });

    this.subscriptionCoaColors = this.alertService.getMessageCoaColors().subscribe(message => {
      this.allCoaColors = message;
    });

    this.subscriptionLocationid = this.alertService.getMessageLocationid().subscribe(message => {
      this.registerLocationmessage = message;
    });
  }

  ngOnInit() {
    const state = this.appStore.getState();
    this.user = state.user;

    this.itemsList = this.coaService.allCoaParts;  
    // console.log(this.itemsList); 
    this.transmissionService.getUserCoaParts();
    this.setShield = this.coaService.getActive(coaTypes.SHIELD);
    this.selectedShield = this.setShield;
    this.setEmblem = this.coaService.getActive(coaTypes.SYMBOL);
    this.selectedEmblem = this.setEmblem;
    this.setHelmet = this.coaService.getActive(coaTypes.HELMET);
    this.selectedHelmet = this.setHelmet;
    this.setWeapon = this.coaService.getActive(coaTypes.MANTLING);
    this.selectedWeapon = this.setWeapon;
    this.setColorPrimary = 'Color' + this.user.primaryColor;
    this.setColorSecondary = 'Color' + this.user.secondaryColor;
    this.coaService.setColorPrimary = this.user.primaryColor;
    this.coaService.setColorSecondary = this.user.secondaryColor;
  }

  ngAfterViewInit(){
    this.setSVGColors();
  }

  ngAfterViewChecked(){
    // If boxes lose position after content update, call reDraw()
    if (this.updatePart){
      this.setSVGColors();
      this.updatePart = false;
    } 
  }

  ngOnDestroy() {
    this._unsubscribe();
    if (this.subscriptionBack){
      this.subscriptionBack.unsubscribe();
    }
    if (this.subscriptionCoaParts){
      this.subscriptionCoaParts.unsubscribe();
    }
    if (this.subscriptionUserCoaParts){
      this.subscriptionUserCoaParts.unsubscribe();
    }
    if (this.subscriptionCoaColors){
      this.subscriptionCoaColors.unsubscribe();
    }
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
      this.saveBtnActive = true;
      this.updatePart = true;
    } 
  }

  selectEmblem(id: string){
    this.selectedEmblem = id.toString();
    if (this.isUnlocked(this.selectedEmblem)){
      this.setEmblem = id.toString();
      this.saveBtnActive = true;
      this.updatePart = true;
    }
  }

  selectHelmet(id: string){
    this.selectedHelmet = id.toString();
    if (this.isUnlocked(this.selectedHelmet)){
      this.setHelmet = id.toString();
      this.saveBtnActive = true;
      this.updatePart = true;
    }
  }

  selectWeapon(id: string){
    this.selectedWeapon = id.toString();
    if (this.isUnlocked(this.selectedWeapon)){
      this.setWeapon = id.toString();
      this.saveBtnActive = true;
      this.updatePart = true;
    }
  }

  selectPrimaryColor(color: string){
    this.setColorPrimary = color.toString();
    this.saveBtnActive = true;
    this.setSVGColors();
  }

  selectSecondaryColor(color: string){
    this.setColorSecondary = color.toString();
    this.saveBtnActive = true;
    this.setSVGColors();  
  }

  setSVGColors(){
    switch(this.setColorPrimary){
      case 'Color1': 
        d3.selectAll('.svgPrimaryDark').attr('fill', '#7e0200');
        d3.selectAll('.strokePrimaryDark').attr('stroke', '#7e0200');
        d3.selectAll('.svgPrimary').attr('fill', '#ffb1af'); break;
      case 'Color2': 
        d3.selectAll('.svgPrimaryDark').attr('fill', '#202a3d');
        d3.selectAll('.strokePrimaryDark').attr('stroke', '#202a3d');
        d3.selectAll('.svgPrimary').attr('fill', '#7a9fed'); break;
      case 'Color3': 
        d3.selectAll('.svgPrimaryDark').attr('fill', '#002e03');
        d3.selectAll('.strokePrimaryDark').attr('stroke', '#002e03');
        d3.selectAll('.svgPrimary').attr('fill', '#8ee594'); break;
      case 'Color4': 
        d3.selectAll('.svgPrimaryDark').attr('fill', '#895c00');
        d3.selectAll('.strokePrimaryDark').attr('stroke', '#895c00');
        d3.selectAll('.svgPrimary').attr('fill', '#ffc152'); break;
      case 'Color5': 
        d3.selectAll('.svgPrimaryDark').attr('fill', '#3c3c3c');
        d3.selectAll('.strokePrimaryDark').attr('stroke', '#3c3c3c');
        d3.selectAll('.svgPrimary').attr('fill', '#a3a3a3'); break;
    }

    switch(this.setColorSecondary){
      case 'Color1': d3.selectAll('.svgSecondary').attr('fill', '#ffb1af'); break;
      case 'Color2': d3.selectAll('.svgSecondary').attr('fill', '#7a9fed'); break;
      case 'Color3': d3.selectAll('.svgSecondary').attr('fill', '#8ee594'); break;
      case 'Color4': d3.selectAll('.svgSecondary').attr('fill', '#ffc152'); break;
      case 'Color5': d3.selectAll('.svgSecondary').attr('fill', '#a3a3a3'); break;
    }
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

  public saveCoa(){
    if(this.saveBtnActive)
    {
    this.coaService.saveMyCoa(this.setShield, this.setEmblem, this.setHelmet, this.setWeapon, this.setColorPrimary, this.setColorSecondary);
    this.saveBtnActive = false;
    } 
  }

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

}
