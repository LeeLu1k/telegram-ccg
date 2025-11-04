const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

export function initUser() {
  const user = tg.initDataUnsafe?.user;
  const nameEl = document.getElementById("user-name");
  const photoEl = document.getElementById("user-photo");
  if (nameEl) nameEl.textContent = user ? user.first_name : "Игрок";
  if (photoEl) photoEl.src = user?.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}
