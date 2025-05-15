
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.json());

// Servir archivos estáticos (como index.html)
app.use(express.static(path.join(__dirname)));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }]
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Ruta raíz -> mostrar index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/test-openai", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Decime si estás funcionando." }]
    });
    res.json({ status: "OK", reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.listen(3000, () => console.log('✅ Luz online en puerto 3000 con frontend'));
