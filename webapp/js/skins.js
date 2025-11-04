export const cards = [
  {
    id: 1,
    name: "Spikly",
    type: "🌿 Необычный",
    rarity: "uncommon",
    level: 1,
    hp: 700,
    attack: 180,
    defense: 60,
    image: "img/skins/spikly.png",
    description: "Колючий защитник природы, даром дан новичкам."
  },
  {
    id: 2,
    name: "Bullit",
    type: "💥 Обычный",
    rarity: "common",
    level: 1,
    hp: 600,
    attack: 150,
    defense: 40,
    image: "img/skins/bullit.png",
    description: "Простой, но надёжный стрелок."
  },
  {
    id: 3,
    name: "Frosty",
    type: "❄️ Редкий",
    rarity: "rare",
    level: 1,
    hp: 900,
    attack: 200,
    defense: 80,
    image: "img/skins/frosty.png",
    description: "Морозный маг, способный замораживать противников."
  },
  {
    id: 4,
    name: "Inferno",
    type: "🔥 Эпический",
    rarity: "epic",
    level: 1,
    hp: 1000,
    attack: 250,
    defense: 90,
    image: "img/skins/inferno.png",
    description: "Огненный воин, пылающий яростью битвы."
  },
  {
    id: 5,
    name: "Shadow",
    type: "🌑 Легендарный",
    rarity: "legendary",
    level: 1,
    hp: 1200,
    attack: 300,
    defense: 120,
    image: "img/skins/shadow.png",
    description: "Мастер теней, наносит удары из невидимости."
  }
];

// ---- подарок новичку (сохранение в localStorage) ----

if (!localStorage.getItem("playerSkins")) {
  // при первом входе выдаём spikly (id:1)
  const starter = cards.find(c => c.id === 1);
  localStorage.setItem("playerSkins", JSON.stringify([starter]));
  console.log("🎁 Новый игрок! Выдан бесплатный скин:", starter.name);
}

export function getOwnedSkins() {
  try {
    return JSON.parse(localStorage.getItem("playerSkins")) || [];
  } catch {
    return [];
  }
}

export function addSkin(skin) {
  const owned = getOwnedSkins();
  if (!owned.find(s => s.id === skin.id)) {
    owned.push(skin);
    localStorage.setItem("playerSkins", JSON.stringify(owned));
  }
}
