export const CHANGE_ERROR_MESSAGE = 'CHANGE_ERROR_MESSAGE';
export const CHANGE_SUCCESS_MESSAGE = 'CHANGE_SUCCESS_MESSAGE';

export class StatusActions
{

  constructor()
  {
  }

  public changeErrorMessage(error: Message)
  {
    return {
      type: CHANGE_ERROR_MESSAGE,
      error: error
    };
  }

  public changeSuccessMessage(success: Message)
  {
    return {
      type: CHANGE_SUCCESS_MESSAGE,
      success: success
    };
  }
}
