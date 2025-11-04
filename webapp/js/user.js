export function getUser() {
  // Пытаемся загрузить данные пользователя
  let data = localStorage.getItem("user");

  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Ошибка чтения данных пользователя:", e);
    }
  }

  // Если данных нет — создаём нового пользователя
  const newUser = {
    balance: 0,
    level: 1,
    xp: 0,
    selectedSkin: 0
  };

  localStorage.setItem("user", JSON.stringify(newUser));
  return newUser;
}

export function saveUser(user) {
  if (!user) return;
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (e) {
    console.error("Ошибка сохранения пользователя:", e);
  }
}
