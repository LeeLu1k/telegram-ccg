// telegram Web App JS API доступна как Telegram.WebApp
const tg = window.Telegram?.WebApp;
if (!tg) {
  document.getElementById('game').innerText = 'Запуск вне Telegram — откройте в Telegram.';
} else {
  tg.expand(); // развернуть окно при необходимости
  // доступные параметры: tg.initData (подпись), tg.onEvent, tg.close(), tg.sendData()
  document.getElementById('sendState').onclick = async () => {
    const state = { hand: ['cardA','cardB'], score: 10 };
    // можно отправить серверу:
    const res = await fetch('/api/save-state', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId: tg.initDataUnsafe?.user?.id || 0, state })
    });
    const json = await res.json();
    console.log('saved', json);
    // или можно отправить результат боту через tg.sendData(JSON.stringify(state))
    tg.sendData(JSON.stringify({ type:'save', state }));
  };
}
