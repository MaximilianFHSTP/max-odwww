export const CHANGE_USER = 'CHANGE_USER';
export const CHANGE_PLATFORM = 'CHANGE_PLATFORM';
export const CHANGE_LOOKUPTABLE = 'CHANGE_LOOKUPTABLE';
export const CHANGE_TOKEN = 'CHANGE_TOKEN';

export class UserActions
{

  constructor()
  {
  }

  public changeUser(user: any)
  {
    return {
      type: CHANGE_USER,
      user: user
    };
  }

  public changePlatform(platform: String)
  {
    return {
      type: CHANGE_PLATFORM,
      platform: platform
    };
  }

  public changeLookupTable(lookupTable: any)
  {
    return {
      type: CHANGE_LOOKUPTABLE,
      lookupTable: lookupTable
    };
  }

  public changeToken(token: String)
  {
    return {
      type: CHANGE_TOKEN,
      token: token
    };
  }
}
