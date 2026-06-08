export const userState = {
  uid: null,
  phone: null,
  isLoggedIn: false
};

export function setUser(user) {
  userState.uid = user.uid;
  userState.phone = user.phoneNumber;
  userState.isLoggedIn = true;
}

export function clearUser() {
  userState.uid = null;
  userState.phone = null;
  userState.isLoggedIn = false;
}
