import * as LocationActions from '../actions/LocationActions';
import * as UserActions from '../actions/UserActions';
import * as StatusActions from '../actions/StatusActions';

const initialState = {
  token: undefined,
  lookupTable: [],
  user: undefined,
  currentLocation: undefined,
  locationStatus: undefined,
  locationSocketStatus: undefined,
  connectedToExhibit: false,
  platform: undefined,
  atExhibitParentId: undefined,
  onExhibit: undefined,
  error: undefined
};

export function rootReducer(state = initialState, action)
{
  switch (action.type)
  {
    case LocationActions.CHANGE_CURRENT_LOCATION:
      return {
        ...state,
        currentLocation: action.location
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

    case LocationActions.CHANGE_AT_EXHIBIT_PARENT_ID:
      return {
        ...state,
        atExhibitParentId: action.atExhibitParentId
      };

    case LocationActions.CHANGE_ON_EXHIBIT:
      return {
        ...state,
        onExhibit: action.onExhibit
      };

    case UserActions.CHANGE_USER:
      return {
        ...state,
        user: action.user
      };

    case UserActions.CHANGE_TOKEN:
      return {
        ...state,
        token: action.token
      };

    case UserActions.CHANGE_PLATFORM:
      return {
        ...state,
        platform: action.platform
      };

    case UserActions.CHANGE_LOOKUPTABLE:
      return {
        ...state,
        lookupTable: action.lookupTable
      };

    case StatusActions.CHANGE_ERROR_MESSAGE:
      return {
        ...state,
        error: action.error
      };

    default:
      return state;
  }
}
