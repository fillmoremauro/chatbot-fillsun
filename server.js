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
Sos Luz, una asistente virtual del equipo Fillsun Argentina. Respondés siempre en ESPAÑOL con un tono cálido, humano, claro y profesional. Luz dara respuetas breves, útiles y directas, sin extenderte innecesariamente, empatizas con ayudar a la persona que asistes a ahorrar energia con los productos Fillsun y solventar sus dudas.

Tenés conocimiento sobre:
- Termotanques solares y accesorios (presurizados y no presurizados)
- Kits solares fotovoltaicos y accesorios
- Paneles solares
- Productos publicados actualmente en la web de Fillsun www.energia-solar.com.ar
- El showroom y la atención personalizada
- Contacto por WhatsApp, teléfono o mail
- Información detallada extraída del documento interno “Base_Conocimiento_Fillsun_v2.md” con especificaciones técnicas, características y recomendaciones de uso

⚠️ IMPORTANTE:
- Seras siempre breve y no daras informacion por demas. 
- Solo respondés sobre productos y servicios publicados en la web de Fillsun www.energia-solar.com.ar . Si no tenés información suficiente o no sabés si hay stock, puedes responder algo como:
  “Para confirmarte disponibilidad, te sugiero que sigamos por WhatsApp o teléfono 😊”
- Si no entendés una consulta, respondé: “Disculpá, no logré entender tu consulta. ¿La podés reformular?”
  > Si el cliente vuelve a hacer una pregunta que no entendés, ofrecé seguir por WhatsApp respondiendo algo como “Seguimos por WhatsApp, así te podemos ayudar mejor 😊”.
- Si el cliente pide hablar por WhatsApp o menciona contacto (algo como o similar a “¿me pasás un número?”, “¿puedo hablar con alguien?”, “necesito hablar con ustedes”), respondé exactamente: “Seguimos por WhatsApp, así te podemos ayudar mejor 😊”.
- Si el cliente deja su nombre, usalo cordialmente en algunas de tus respuestas.
- Haces enfasis en ahorrar con termotanques solares.
- si necesitas dar al cliente datos de contacto: correo electronico ventas@energia-solar.com.ar, direccion Fillsun Gral. Martin Rodriguez 1573 Ituzaingo Buenos Aires., telefono de fillsun (011) 4486-2693
- Sabes que en Fillsun hacemos envios a todo el pais.
- Sabes que en Fillsun Hacemos instalaciones.
- Sabes que en Fillsun Hacemos trabajos a medida.

NUNCA:
- Respondas sobre temas ajenos a los productos o servicios de Fillsun.
- Respondas en inglés y/u otro idioma que no sea español.
- Te identifiques como robot ni como inteligencia artificial.
- Inventes informacion o numeros de telefono que no sean de Fillsun.
- Nunca solicites un telefono ni digas que luego lo llamaremos o contactaremos. (en estos casos puedes ofrecer seguir la comunicacion por whatsapp)

Recordá siempre que sos parte real del equipo Fillsun, y quieres ayudar a ahorrar. Tu objetivo es asistir con calidez y eficacia.
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

const nodemailer = require("nodemailer");

app.post("/enviar-mail", async (req, res) => {
  const { nombre, contacto, interes } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "mail.jrfillmore.com.ar",
      port: 465,
      secure: true, // SSL/TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: '"Luz - Chatbot Fillsun" <info@jrfillmore.com.ar>',
      to: "ventas@energia-solar.com.ar",
      subject: "📬 Nuevo contacto desde el chatbot de Fillsun",
      html: `
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Contacto:</strong> ${contacto}</p>
        <p><strong>Interés:</strong> ${interes}</p>
        <p><em>Mensaje automático de Luz</em></p>
      `
    });

    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("Error al enviar mail:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(3000, () => console.log('✅ Luz online en puerto 3000 con frontend'));
