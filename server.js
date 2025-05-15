const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.json());

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

app.listen(3000, () => console.log('✅ Chatbot Luz corriendo en el puerto 3000'));
