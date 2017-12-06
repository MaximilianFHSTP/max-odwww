
class User
{
  private _name: string;
  private _currentLocation: number;
  private _avatar: string;
  private _deviceAddress: string;
  private _ipAddress: string;
  private _deviceOS: string;
  private _deviceModel: string;
  private _deviceVersion: string;

  constructor(name, avatar, deviceAddress, ipAddress)
  {
    this._name = name;
    this._avatar = avatar;
    this._deviceAddress = deviceAddress;
    this._ipAddress = ipAddress;
  }

  get name(): string {
    return this._name;
  }

  get currentLocation(): number {
    return this._currentLocation;
  }

  get avatar(): string {
    return this._avatar;
  }

  get deviceAddress(): string {
    return this._deviceAddress;
  }

  get ipAddress(): string {
    return this._ipAddress;
  }

  get deviceOS(): string {
    return this._deviceOS;
  }

  get deviceModel(): string {
    return this._deviceModel;
  }

  get deviceVersion(): string {
    return this._deviceVersion;
  }

  set name(value: string) {
    this._name = value;
  }

  set currentLocation(value: number) {
    this._currentLocation = value;
  }

  set avatar(value: string) {
    this._avatar = value;
  }

  set deviceAddress(value: string) {
    this._deviceAddress = value;
  }

  set ipAddress(value: string) {
    this._ipAddress = value;
  }

  set deviceOS(value: string) {
    this._deviceOS = value;
  }

  set deviceModel(value: string) {
    this._deviceModel = value;
  }

  set deviceVersion(value: string) {
    this._deviceVersion = value;
  }
}
