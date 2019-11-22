import { Component, OnInit, Inject, AfterViewInit, AfterViewChecked, Injectable, OnDestroy } from '@angular/core';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { Unsubscribe} from 'redux';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import * as coaTypes from '../../config/COATypes';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import * as COAConfig from '../../config/COAItems';

@Component({
  selector: 'app-wappen',
  templateUrl: './wappen.component.html',
  styleUrls: ['./wappen.component.css']
})
export class WappenComponent implements OnInit, AfterViewInit, AfterViewChecked {
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
    @Inject('AppStore') private appStore,
    private nativeCommunicationService: NativeCommunicationService,
    public router: Router,
    private languageService: LanguageService,
    private alertService: AlertService,
    private translate: TranslateService
  ){}

  ngOnInit() {
    this.itemsList = COAConfig.COA;
    this.unlockedItems = this.itemsList;
    // console.log(this.itemsList); 
    this.setShield = 'Shield1';
    this.selectedShield = this.setShield;
    this.setEmblem = 'Emblem2';
    this.selectedEmblem = this.setEmblem;
    this.setHelmet = 'Helmet4';
    this.selectedHelmet = this.setHelmet;
    this.setWeapon = 'Mantle1';
    this.selectedWeapon = this.setWeapon;
    this.setColorPrimary = 'Color2';
    this.setColorSecondary = 'Color4';
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

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

  get ariaShieldBtn(): string { return this.translate.instant('ariaLabels.ariaShieldBtn');}
  get ariaEmblemBtn(): string { return this.translate.instant('ariaLabels.ariaEmblemBtn');}
  get ariaHelmetBtn(): string { return this.translate.instant('ariaLabels.ariaHelmetBtn');}
  get ariaWeaponBtn(): string { return this.translate.instant('ariaLabels.ariaWeaponBtn');}
  get ariaColorBtn(): string { return this.translate.instant('ariaLabels.ariaColorBtn');}
  get ariaClr1Btn(): string { return this.translate.instant('ariaLabels.ariaClr1Btn');}
  get ariaClr2Btn(): string { return this.translate.instant('ariaLabels.ariaClr2Btn');}
  get ariaClr3Btn(): string { return this.translate.instant('ariaLabels.ariaClr3Btn');}
  get ariaClr4Btn(): string { return this.translate.instant('ariaLabels.ariaClr4Btn');}
  get ariaClr5Btn(): string { return this.translate.instant('ariaLabels.ariaClr5Btn');}
  get ariaCloseBtn(): string { return this.translate.instant('ariaLabels.ariaCloseBtn');}
}
