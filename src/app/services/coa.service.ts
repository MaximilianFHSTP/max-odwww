import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import * as coaTypes from '../config/COATypes';

@Injectable({
  providedIn: 'root'
})
export class CoaService {
  unlockedItemsId: number[];
  unlockedItems: string[];
  allCoaParts: any[];
  userCoaParts: any[];
  thereIsEmblem = false;
  thereIsHelmet = false;
  thereIsWeapon = false;
  setShield = 0;
  setEmblem = 0;
  setHelmet = 0;
  setWeapon = 0;
  setColorPrimary = 1;
  setColorSecondary = 1;
  newItem = false;
  newEmblem = false;
  newHelmet = false;
  newWeapon = false;

  constructor(private alertService: AlertService) { 
  }

  getActiveId(coaTypeId: any){
    if(coaTypeId === coaTypes.SYMBOL){ 
     return this.setEmblem;
    } else if(coaTypeId === coaTypes.HELMET){ 
      return this.setHelmet;
    } else if(coaTypeId === coaTypes.MANTLING){ 
      return this.setWeapon;
    } else if(coaTypeId === coaTypes.SHIELD){ 
      return this.setShield;
    }
  }
  
  getActive(coaTypeId: any): string{
    if(coaTypeId === coaTypes.SYMBOL){ 
     return this.getPartName(this.setEmblem);
    } else if(coaTypeId === coaTypes.HELMET){ 
      return this.getPartName(this.setHelmet);
    } else if(coaTypeId === coaTypes.MANTLING){ 
      return this.getPartName(this.setWeapon);
    } else if(coaTypeId === coaTypes.SHIELD){ 
      return this.getPartName(this.setShield);
    }
  }

  getPartName(coaPartId: any): string{
    let partName = '';
    this.allCoaParts.forEach(part => {
      if(part.id === coaPartId){
        partName = part.image;
      }
    });
    return partName;
  }

  getPartType(coaPartId: any){
    let coaTypeId = 0;
    this.allCoaParts.forEach(part => {
      if(part.id === coaPartId){
        coaTypeId = part.coaTypeId;
      }
    });
    return coaTypeId;
  }

  getPartId(coaPartName: string): number{
    let partId = 0;
    this.allCoaParts.forEach(part => {
      if(part.image === coaPartName){
        partId = part.id;
      }
    });
    return partId;
  }

  getColorId(coaColorName: string): number{
    const color = coaColorName.split('Color');
    return +(color[1]);
  }

  getPrimaryColor(){
    return this.setColorPrimary;
  }

  getSecondaryColor(){
    return this.setColorSecondary;
  }

  have(coaPartId: any): boolean{
    let userHasIt = false;
    this.unlockedItemsId.indexOf(coaPartId) === -1 ? userHasIt = false : userHasIt = true;
    return userHasIt; 
  }

  tryUnlock(coaPartId: any){

  }

  dismissNewItem(){
    this.newItem = false;
  }

  dismissNewEmblem(){
    this.newEmblem = false;
  }

  dismissNewHelmet(){
    this.newHelmet = false;
  }

  dismissNewWeapon(){
    this.newWeapon = false;
  }

  setCoaParts(coaParts: any[]){
    this.allCoaParts = coaParts;
  }

  setUserCoaParts(coaParts: any[]){
    this.userCoaParts = coaParts;
    this.setUnlockedItems();
  }

  setUnlockedItems(){
    this.unlockedItemsId = [];
    this.unlockedItems = [];

    this.userCoaParts.forEach(part => {
      this.unlockedItemsId.push(part.id);
      this.unlockedItems.push(part.image);

      // Get active parts
      if(part.coaTypeId === coaTypes.SYMBOL){ 
        this.thereIsEmblem = true; 
        if(part.UserCoaPart.isActive){
          this.setEmblem = part.id;
        }
      }
      else if(part.coaTypeId === coaTypes.HELMET){ 
        this.thereIsHelmet = true; 
        if(part.UserCoaPart.isActive){
          this.setHelmet = part.id;
        }
      }
      else if(part.coaTypeId === coaTypes.MANTLING){ 
        this.thereIsWeapon = true; 
        if(part.UserCoaPart.isActive){
          this.setWeapon = part.id;
        }
      } else if(part.coaTypeId === coaTypes.SHIELD){ 
        if(part.UserCoaPart.isActive){
          this.setShield = part.id;
        }
      }
    });
  }

  saveMyCoa(shield: string, symbol: string, helmet: string, mantling: string, primColor: string, secColor: string){

  }
}
