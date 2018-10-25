export const CHANGE_CURRENT_LOCATION = 'CHANGE_CURRENT_LOCATION';
export const CHANGE_CONNECTED_EXHIBIT = 'CHANGE_CONNECTED_EXHIBIT';
export const CHANGE_LOCATION_STATUS = 'CHANGE_LOCATION_STATUS';
export const CHANGE_LOCATION_SOCKET_STATUS = 'CHANGE_LOCATION_SOCKET_STATUS';
export const CHANGE_AT_EXHIBIT_PARENT_ID = 'CHANGE_AT_EXHIBIT_PARENT_ID';
export const CHANGE_ON_EXHIBIT = 'CHANGE_ON_EXHIBIT';
export const CHANGE_LAST_DISMISSED = 'CHANGE_LAST_DISMISSED';
export const CHANGE_SHOW_DISMISSED = 'CHANGE_SHOW_DISMISSED';
export const CHANGE_LOCATION_SCANNING = 'CHANGE_LOCATION_SCANNING';
export const CHANGE_CLOSEST_EXHIBIT = 'CHANGE_CLOSEST_EXHIBIT';
export const CHANGE_SHOW_CLOSEST_EXHIBIT = 'CHANGE_SHOW_CLOSEST_EXHIBIT';

export class LocationActions
{

  constructor()
  {
  }

  public changeCurrentLocation(location: JSON)
  {
    return {
      type: CHANGE_CURRENT_LOCATION,
      location: location
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

  public changeClosestExhibit(closestExhibitId: number)
  {
    return {
      type: CHANGE_CLOSEST_EXHIBIT,
      closestExhibit: closestExhibitId
    };
  }

  public changeShowClosestExhibit(shown: boolean)
  {
    return {
      type: CHANGE_SHOW_CLOSEST_EXHIBIT,
      showClosestExhibit: shown
    };
  }

  public changeLocationScanning(isScanning: boolean)
  {
    return {
      type: CHANGE_LOCATION_SCANNING,
      locationScanning: isScanning
    };
  }
}
