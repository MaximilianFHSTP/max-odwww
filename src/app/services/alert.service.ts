import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AlertService {
  private subjectAlert = new Subject<any>();
  private subjectResponse = new Subject<any>();
  private subjectLocationId = new Subject<any>();
  private subjectNativeSettingCheck = new Subject<any>();
  private subjectNativeWifiSettingCheckResult = new Subject<any>();
  private subjectNativeBluetoothSettingCheckResult = new Subject<any>();
  private subjectNativeBackbuttonTimeline = new Subject<any>();
  private subjectNativeBackbuttonStart = new Subject<any>();
  private subjectWrongLoginCheck = new Subject<any>();
  private subjectLocationBackId = new Subject<any>();
  private subjectExistingCredentials = new Subject<any>();
  private subjectUsernameRegisterCheckResult = new Subject<any>();
  private subjectEmailRegisterCheckResult = new Subject<any>();
  private subjectExistingCredentialsRealUser = new Subject<any>();

  sendMessage(message: any) {
      this.subjectAlert.next(message);
  }

  getMessage(): Observable<any> {
      return this.subjectAlert.asObservable();
  }

  sendMessageResponse(message: any) {
    this.subjectResponse.next(message);
  }

  getMessageResponse(): Observable<any> {
      return this.subjectResponse.asObservable();
  }

  sendMessageLocationid(message: any) {
    this.subjectLocationId.next(message);
  }

  getMessageLocationid(): Observable<any> {
      return this.subjectLocationId.asObservable();
  }

  sendMessageNativeSettingCheck(message: any) {
    this.subjectNativeSettingCheck.next(message);
  }

  getMessageNativeSettingCheck(): Observable<any> {
      return this.subjectNativeSettingCheck.asObservable();
  }

  sendMessageNativeBluetoothSettingCheckResult(message: any) {
    this.subjectNativeBluetoothSettingCheckResult.next(message);
  }

  getMessageNativeBluetoothSettingCheckResult(): Observable<any> {
      return this.subjectNativeBluetoothSettingCheckResult.asObservable();
  }

  sendMessageNativeWifiSettingCheckResult(message: any) {
    this.subjectNativeWifiSettingCheckResult.next(message);
  }

  getMessageNativeWifiSettingCheckResult(): Observable<any> {
      return this.subjectNativeWifiSettingCheckResult.asObservable();
  }

  sendMessageNativeBackbuttonTimeline() {
    this.subjectNativeBackbuttonTimeline.next();
  }

  getMessageNativeBackbuttonTimeline(): Observable<any> {
      return this.subjectNativeBackbuttonTimeline.asObservable();
  }

  sendMessageNativeBackbuttonStart() {
    this.subjectNativeBackbuttonStart.next();
  }

  getMessageNativeBackbuttonStart(): Observable<any> {
      return this.subjectNativeBackbuttonStart.asObservable();
  }

  setMessageWrongLoginCheck(message: any) {
    this.subjectWrongLoginCheck.next(message);
  }

  getMessageWrongLoginCheck(): Observable<any>{
    return this.subjectWrongLoginCheck.asObservable();
  }

  sendMessageExistingCredentials(message: any) {
    this.subjectExistingCredentials.next(message);
  }

  getMessageExistingCredentials(): Observable<any>{
    return this.subjectExistingCredentials.asObservable();
  }

  sendUsernameRegisterCheckResult(message: any) {
    this.subjectUsernameRegisterCheckResult.next(message);
  }

  getUsernameRegisterCheckResult(): Observable<any>{
    return this.subjectUsernameRegisterCheckResult.asObservable();
  }

  sendEmailRegisterCheckResult(message: any) {
    this.subjectEmailRegisterCheckResult.next(message);
  }

  getEmailRegisterCheckResult(): Observable<any>{
    return this.subjectEmailRegisterCheckResult.asObservable();
  }

  sendMessageExistingCredentialsRealUser(message: any): Observable<any>{
    return this.subjectExistingCredentialsRealUser.asObservable();
  }

  getMessageExistingCredentialsRealUser(): Observable<any>{
    return this.subjectExistingCredentialsRealUser.asObservable();
  }

  /*setMessageLocationBackid(message: any) {
    this.subjectLocationBackId.next(message);
  }

  getMessageLocationBackid(): Observable<any>{
    return this.subjectLocationBackId.asObservable();
  }*/
}
