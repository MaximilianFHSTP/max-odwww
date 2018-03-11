export const CHANGE_ERROR_MESSAGE = 'CHANGE_ERROR_MESSAGE';

export class StatusActions
{

  constructor()
  {
  }

  public changeErrorMessage(error: any)
  {
    return {
      type: CHANGE_ERROR_MESSAGE,
      error: error
    };
  }
}
