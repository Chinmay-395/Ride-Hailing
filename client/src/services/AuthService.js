/*  =================================================
    • If the user has not logged into the app, 
      then our getUser() function will return undefined
    • taxi.auth is the key we use to store the JSON Web 
      Tokens that get returned when a user logs in. 
      If the item is in localStorage, then we take the access 
      token string and split it into it's three 
      constituent parts: The header, the payload, and the signature. 
      (We ignore the header and the signature because we don't need them.) 
      Next, we decode the payload data using the window.atob() function.
    =================================================
*/
export const getUser = () => {
  const auth = JSON.parse(window.localStorage.getItem('taxi.auth'));
  if (auth) {
    const [, payload,] = auth.access.split('.');
    const decoded = window.atob(payload);
    return JSON.parse(decoded);
  }
  return undefined;
};

export const isDriver = () => {
  const user = getUser();
  return user && user.group === 'driver';
};

export const isRider = () => {
  const user = getUser();
  return user && user.group === 'rider';
};

export const getAccessToken = () => {
  const auth = JSON.parse(window.localStorage.getItem('taxi.auth'));
  if (auth) {
    return auth.access;
  }
  return undefined;
};