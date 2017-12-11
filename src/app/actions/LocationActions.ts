export const CHANGE_LOCATION = 'CHANGE_LOCATION';
export const CHANGE_CONNECTED_EXHIBIT = 'CHANGE_CONNECTED_EXHIBIT';
export const CHANGE_LOCATION_STATUS = 'CHANGE_LOCATION_STATUS';
export const CHANGE_LOCATION_SOCKET_STATUS = 'CHANGE_LOCATION_SOCKET_STATUS';


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
}
