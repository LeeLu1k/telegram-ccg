const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 400,
  backgroundColor: '#222',
  parent: 'game',
  scene: { preload, create, update }
};
const game = new Phaser.Game(config);

let playerUnits = [], enemyUnits = [];

function preload() {
  this.load.image('knight', 'assets/knight.png');
  this.load.image('orc', 'assets/orc.png');
}

function create() {
  // Создаём 3 бойцов
  for (let i = 0; i < 3; i++) {
    const y = 100 + i * 100;
    const knight = this.add.sprite(100, y, 'knight').setScale(0.5);
    const orc = this.add.sprite(500, y, 'orc').setScale(0.5);
    playerUnits.push(knight);
    enemyUnits.push(orc);
  }

  this.time.delayedCall(10000, () => endBattle(true)); // авто-победа через 10с
}

function update() {
  playerUnits.forEach(k => k.x += 0.3);
  enemyUnits.forEach(o => o.x -= 0.3);
}

function endBattle(win) {
  tg.sendData(JSON.stringify({ result: win ? "win" : "lose" }));
  tg.close(); // закрыть WebApp
}
