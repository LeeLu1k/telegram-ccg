require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is required');

const bot = new Telegraf(TOKEN);
const app = express();
app.use(express.json());

// URL веб-приложения
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://yourapp-production.up.railway.app/webapp/index.html';

// --- Команды бота ---
bot.start((ctx) => {
  ctx.reply(`👋 Привет, ${ctx.from.first_name || ctx.from.username || 'Игрок'}!`, {
    reply_markup: {
      inline_keyboard: [[
        { text: '🚀 Открыть игру', web_app: { url: WEBAPP_URL } }
      ]]
    }
  });
});

bot.command('play', (ctx) => {
  ctx.reply('🎮 Запуск мини-игры', {
    reply_markup: {
      inline_keyboard: [[
        { text: '⚔️ Играть сейчас', web_app: { url: WEBAPP_URL } }
      ]]
    }
  });
});

// --- Webhook ---
const TELEGRAM_PATH = `/telegraf/${TOKEN}`;
app.use(bot.webhookCallback(TELEGRAM_PATH));

// --- WebApp статические файлы ---
app.use('/webapp', express.static(path.join(__dirname, 'webapp')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  const publicUrl = process.env.PUBLIC_URL || `https://yourapp-production.up.railway.app`;
  const webhookUrl = `${publicUrl}${TELEGRAM_PATH}`;
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('✅ Webhook set to', webhookUrl);
  } catch (err) {
    console.error('❌ Failed to set webhook:', err);
  }
  console.log(`🚀 Server running on port ${PORT}`);
});
