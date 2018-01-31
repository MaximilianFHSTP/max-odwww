export const CHANGE_LOCATION = 'CHANGE_LOCATION';
export const CHANGE_CONNECTED_EXHIBIT = 'CHANGE_CONNECTED_EXHIBIT';
export const CHANGE_LOCATION_STATUS = 'CHANGE_LOCATION_STATUS';
export const CHANGE_LOCATION_SOCKET_STATUS = 'CHANGE_LOCATION_SOCKET_STATUS';
export const CHANGE_AT_EXHIBIT_PARENT_ID = 'CHANGE_AT_EXHIBIT_PARENT_ID';
export const CHANGE_ON_EXHIBIT = 'CHANGE_ON_EXHIBIT';

export class LocationActions
{

  constructor()
  {
  }

  public changeLocation(locationId: number)
  {
    return {
      type: CHANGE_LOCATION,
      locationId: locationId
    };
  }

  public changeLocationStatus(status: string)
  {
    return {
      type: CHANGE_LOCATION_STATUS,
      locationStatus: status
    };
  }

  public changeLocationSocketStatus(status: string)
  {
    return {
      type: CHANGE_LOCATION_SOCKET_STATUS,
      locationSocketStatus: status
    };
  }
  public changeConnectedExhibit(connected: boolean)
  {
    return {
      type: CHANGE_CONNECTED_EXHIBIT,
      connectedToExhibit: connected
    };
  }

  public changeAtExhibitParentId(locationId: number)
  {
    return {
      type: CHANGE_AT_EXHIBIT_PARENT_ID,
      atExhibitParentId: locationId
    };
  }

  public changeOnExhibit(isOnExhibit: boolean)
  {
    return {
      type: CHANGE_ON_EXHIBIT,
      onExhibit: isOnExhibit
    };
  }
}
