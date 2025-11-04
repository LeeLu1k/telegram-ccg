require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is required');

const bot = new Telegraf(TOKEN);
const app = express();
app.use(express.json());

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://telegram-ccg-production.up.railway.app/webapp/index.html';

// --- Bot handlers ---
bot.start((ctx) => {
  const user = ctx.from;
  console.log(`Игрок вошёл: ${user.username || user.first_name} (ID: ${user.id})`);

  ctx.reply(`👋 Привет, ${user.first_name || user.username || 'Игрок'}! Добро пожаловать в Коллекционную Карточную Игру 🎮`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Открыть игру',
            web_app: { url: WEBAPP_URL }
          }
        ]
      ]
    }
  });
});

bot.command('newgame', (ctx) => {
  ctx.reply('Создаю новую игру ⚔️', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎮 Играть сейчас',
            web_app: { url: WEBAPP_URL }
          }
        ]
      ]
    }
  });
});

// --- Webhook setup ---
const TELEGRAM_PATH = `/telegraf/${TOKEN}`;
app.use(bot.webhookCallback(TELEGRAM_PATH));

// Serve static webapp (HTML + JS + CSS)
app.use('/webapp', express.static(path.join(__dirname, 'webapp')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  const publicUrl = process.env.PUBLIC_URL || 'https://telegram-ccg-production.up.railway.app';
  const webhookUrl = `${publicUrl}${TELEGRAM_PATH}`;
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('✅ Webhook set to', webhookUrl);
  } catch (err) {
    console.error('❌ Failed to set webhook:', err);
  }
  console.log(`Server running on ${PORT}`);
});
