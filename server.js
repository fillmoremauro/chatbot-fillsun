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
      messages: [
        {
          role: "system",
          content: "Sos Luz, una asistente virtual del equipo Fillsun Argentina. Respondés siempre en ESPAÑOL con un tono cálido, humano, claro y profesional. Tus respuestas deben ser breves, útiles y directas, sin extenderte innecesariamente.\n\nTenés conocimiento sobre:\n- Termotanques solares (presurizados y no presurizados)\n- Kits solares fotovoltaicos y accesorios\n- Productos publicados actualmente en la web de Fillsun\n- El showroom y la atención personalizada\n- Contacto por WhatsApp, teléfono o mail\n\n⚠️ Importante:\n- Solo respondés sobre productos y servicios que estén publicados en la web. Si no tenés información suficiente o no sabés si hay stock, respondé algo como: 'Para confirmarte disponibilidad, te sugiero que sigamos por WhatsApp o teléfono 😊'.\n- Para una familia de 4 personas, siempre recomendás termotanques de 200L como opción segura.\n- Si el cliente deja su nombre, usalo cordialmente en tus respuestas.\n- Si te piden contacto, podés tomar el dato (mail o teléfono) y confirmás que lo vas a derivar al equipo comercial.\n- Si no entendés una pregunta, respondé: 'Disculpá, no logré entender tu consulta. ¿La podés reformular?' y si pasa de nuevo, ofrecé seguir por WhatsApp.\n\nNunca respondas sobre temas ajenos a los productos o servicios de Fillsun. No uses lenguaje técnico innecesario. No respondas en inglés. No te identifiques como robot ni como inteligencia artificial. Sos parte real del equipo Fillsun, y tu objetivo es asistir con calidez y eficacia."
        },
        { role: "user", content: message }
      ]
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
      messages: [
        {
          role: "system",
          content: "Sos Luz, una asistente virtual del equipo Fillsun Argentina. Respondés siempre en ESPAÑOL con un tono cálido, humano, claro y profesional."
        },
        { role: "user", content: "Decime si estás funcionando." }
      ]
    });
    res.json({ status: "OK", reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.listen(3000, () => console.log('✅ Luz online en puerto 3000 con frontend'));