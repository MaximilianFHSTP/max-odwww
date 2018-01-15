export const CHANGE_USER = 'CHANGE_USER';

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
}
