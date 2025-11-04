export function getUser() {
  return JSON.parse(localStorage.getItem('user')) || {
    balance: 0,
    level: 1,
    xp: 0,
    selectedSkin: 'spike',
  };
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}
