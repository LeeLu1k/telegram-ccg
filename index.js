require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is required in env');

const bot = new Telegraf(TOKEN);
const app = express();
app.use(express.json());

// --- simple game storage (in-memory for demo; replace with DB later) ---
const games = {}; // { userId: { hand: [...], ... } }

// --- Bot handlers ---
bot.start((ctx) => {
  ctx.reply('Привет! Нажми кнопку, чтобы открыть игровое веб-приложение.', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть игру",
            web_app: { url: process.env.WEBAPP_URL } // url надо заменить на реальный после деплоя
          }
        ]
      ]
    }
  });
});

// Example: handle messages from webapp via answerWebAppQuery or via backend endpoints
bot.command('newgame', (ctx) => {
  const userId = ctx.from.id;
  games[userId] = { hand: ['card1','card2'], turn: 0 };
  ctx.reply('Новая игра создана. Открой веб-приложение.');
});

// Launch Telegraf via webhook callback on Express
const TELEGRAM_PATH = `/telegraf/${TOKEN}`;
app.use(bot.webhookCallback(TELEGRAM_PATH));

// Serve webapp static files
app.use('/webapp', express.static(path.join(__dirname, 'webapp')));

// Small endpoint: frontend can call this for server-side actions (matchmaking/save/etc.)
app.post('/api/save-state', (req, res) => {
  const { userId, state } = req.body;
  games[userId] = state;
  res.json({ ok: true });
});

// start server and set webhook
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);

  // set webhook to the Railway/GH domain
  const publicUrl = process.env.PUBLIC_URL; // например: https://your-app.up.railway.app
  if (!publicUrl) {
    console.warn('PUBLIC_URL not set — set it to your app domain so webhook can be registered');
    return;
  }
  const webhookUrl = `${publicUrl}${TELEGRAM_PATH}`;
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('Webhook set to', webhookUrl);
  } catch (err) {
    console.error('Failed to set webhook:', err);
  }
});
