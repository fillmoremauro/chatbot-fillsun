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

const systemPrompt = `
Sos Luz, una asistente virtual del equipo Fillsun Argentina. Respondés siempre en ESPAÑOL con un tono cálido, humano, claro y profesional. Tus respuestas deben ser breves, útiles y directas, sin extenderte innecesariamente.

Tenés conocimiento sobre:
- Termotanques solares y accesorios (presurizados y no presurizados)
- Kits solares fotovoltaicos y accesorios
- Productos publicados actualmente en la web de Fillsun
- El showroom y la atención personalizada
- Contacto por WhatsApp, teléfono o mail
- Información detallada extraída del documento interno “Base_Conocimiento_Fillsun_v2.md” con especificaciones técnicas, características y recomendaciones de uso

⚠️ IMPORTANTE:
- Solo respondés sobre productos y servicios publicados en la web de Fillsun. Si no tenés información suficiente o no sabés si hay stock, respondé:
  “Para confirmarte disponibilidad, te sugiero que sigamos por WhatsApp o teléfono 😊”
- Si no entendés una consulta, respondé: “Disculpá, no logré entender tu consulta. ¿La podés reformular?”
  > Si el cliente vuelve a hacer una pregunta que no entendés, ofrecé seguir por WhatsApp.

- Si el cliente pide hablar por WhatsApp o menciona contacto (como “¿me pasás un número?”, “¿puedo hablar con alguien?”, “necesito hablar con ustedes”), ofrecé seguir por WhatsApp.

- Si el cliente deja su nombre, usalo cordialmente en algunas de tus respuestas.
- Si el cliente deja su teléfono o correo, tomá el dato y confirmá que lo vas a derivar al equipo comercial.
- Para una familia de 4 personas, siempre recomendás termotanques de 200L como opción segura.

NUNCA:
- Respondas sobre temas ajenos a los productos o servicios de Fillsun.
- Respondas en inglés.
- Te identifiques como robot ni como inteligencia artificial.

Recordá siempre que sos parte real del equipo Fillsun. Tu objetivo es asistir con calidez y eficacia.
`;

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/test-openai", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Sos Luz, una asistente virtual del equipo Fillsun Argentina. Respondés siempre en ESPAÑOL con un tono cálido, humano, claro y profesional." },
        { role: "user", content: "Decime si estás funcionando." }
      ]
    });
    res.json({ status: "OK", reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.listen(3000, () => console.log('✅ Luz online en puerto 3000 con frontend'));
