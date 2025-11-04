export function getUser() {
  const data = JSON.parse(localStorage.getItem('player') || '{}');
  return {
    balance: data.balance || 0,
    selectedSkin: data.selectedSkin || 1,
    ownedSkins: data.ownedSkins || [1],
    level: data.level || 1,
    exp: data.exp || 0,
  };
}

export function saveUser(user) {
  localStorage.setItem('player', JSON.stringify(user));
}
