const tg = window.Telegram.WebApp;
tg.expand(); // растянуть на весь экран

const userName = document.getElementById("user-name");
const userPhoto = document.getElementById("user-photo");

// Получаем данные пользователя
tg.ready();
const user = tg.initDataUnsafe?.user;

if (user) {
  userName.textContent = user.first_name + (user.last_name ? " " + user.last_name : "");
  if (user.photo_url) userPhoto.src = user.photo_url;
  else userPhoto.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // дефолтный аватар
} else {
  userName.textContent = "Гость";
  userPhoto.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}

// Кнопка "Начать игру"
document.getElementById("start-btn").addEventListener("click", () => {
  // пока просто показываем сообщение — потом можно перейти к игре
  tg.showPopup({
    title: "В разработке",
    message: "Режим боя скоро будет доступен!",
    buttons: [{ type: "close" }]
  });
});
