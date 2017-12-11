import * as LocationActions from '../actions/LocationActions';

const initialState = {
  lookupTable: [],
  user: undefined,
  currentLocation: undefined,
  locationStatus: undefined,
  locationSocketStatus: undefined,
  connectedToExhibit: false
};

export function rootReducer(state = initialState, action)
{
  switch (action.type)
  {
    case LocationActions.CHANGE_LOCATION:
      return {
        ...state,
        currentLocation: action.locationId
      };

    case LocationActions.CHANGE_CONNECTED_EXHIBIT:
      return {
        ...state,
        connectedToExhibit: action.connectedToExhibit
      };

    case LocationActions.CHANGE_LOCATION_STATUS:
      return {
        ...state,
        locationStatus: action.locationStatus
      };

    case LocationActions.CHANGE_LOCATION_SOCKET_STATUS:
      return {
        ...state,
        locationSocketStatus: action.locationSocketStatus
      };

    default:
      return state;
  }
}
