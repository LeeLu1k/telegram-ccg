export function getUser() {
  const data = localStorage.getItem('user');
  if (data) return JSON.parse(data);
  // при первом входе
  const newUser = { balance: 0, level: 1, selectedSkin: 0 };
  localStorage.setItem('user', JSON.stringify(newUser));
  return newUser;
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}
export function getUser() {
  const data = JSON.parse(localStorage.getItem("userData"));
  return data || { balance: 0, level: 1, xp: 0, selectedSkin: 0 };
}
