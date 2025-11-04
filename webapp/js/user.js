export function getUser() {
  const data = JSON.parse(localStorage.getItem("playerData") || "{}");
  return {
    balance: data.balance || 0,
    level: data.level || 1,
    exp: data.exp || 0,
    ownedSkins: data.ownedSkins || [1], // по умолчанию первый
    selectedSkin: data.selectedSkin || 1,
  };
}

export function saveUser(data) {
  localStorage.setItem("playerData", JSON.stringify(data));
}
