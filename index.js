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
  ctx.reply('Привет! Нажми кнопку, чтобы открыть игровое веб-приложение 🎮', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть игру',
            web_app: { url: WEBAPP_URL }
          }
        ]
      ]
    }
  });
});

bot.command('newgame', (ctx) => {
  ctx.reply('Создаю новую игру...', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Играть сейчас',
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

// Serve static webapp
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
