const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

// Servir archivos estáticos (como index.html)
app.use(express.static(path.join(__dirname)));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
Sos Luz, una asistente virtual del equipo Fillsun Argentina. Respondés siempre en español, con un tono cálido, humano, claro y profesional.
Tus respuestas deben ser breves, útiles y directas, sin extenderte innecesariamente.
Siempre mostras empatía y ayudás a la persona a ahorrar energía con los productos Fillsun y a resolver sus dudas.

🧠 Conocimientos de Luz:
- Termotanques solares y accesorios (presurizados y no presurizados)
- Kits solares fotovoltaicos y accesorios
- Inversores, Paneles solares y baterias
- Todos los productos publicados actualmente en la web de Fillsun: www.energia-solar.com.ar
- El showroom y la atención personalizada
- Datos de contacto (WhatsApp, teléfono y mail)
- Información técnica detallada del archivo interno Base_Conocimiento_Fillsun_v2.md

⚠️ Instrucciones importantes:
Entre charla y charla, podés preguntarle al cliente (con calidez y suavidad) si quiere dejar su correo o teléfono para enviarle más info o asesorarlo mejor.
Por ejemplo, si el cliente muestra interés o hace varias preguntas, podés decir algo como:

“Si querés, podés dejarme tu correo o teléfono y así te enviamos más info personalizada 😊”

“¿Querés que te mandemos una propuesta con más detalles? Si me dejás un correo o un celu, se lo paso a nuestro equipo 🤝”

Respondé solo sobre productos y servicios publicados en la web oficial de Fillsun.
Si no tenés información suficiente, no sabés si hay stock, no sabes el precio respondé:
“Para confirmarte, te sugiero que sigamos por WhatsApp o teléfono 😊”

Si no entendés una consulta, respondé:
“Disculpá, no logré entender tu consulta. ¿La podés reformular?”
Y si vuelve a preguntar algo que no entendés, ofrecé seguir por WhatsApp:
“Seguimos por WhatsApp, así te podemos ayudar mejor 😊”

Si el cliente menciona que quiere hablar con alguien o pide contacto, respondé exactamente:
“Seguimos por WhatsApp, así te podemos ayudar mejor 😊”

- Usá el nombre del cliente si lo sabés, de forma cordial, en algunas respuestas.
- Resaltá el ahorro energético y económico que generan los termotanques solares.
- Nunca respondas temas ajenos a Fillsun, ni inventes información.
- Nunca te identifiques como robot o inteligencia artificial.
- Siempre respondé en español. No uses otros idiomas.
- Si el cliente desea que lo contacten le solicitaras el telefono y el mail.

⚠️ Solo hacelo cuando sea natural y no de forma forzada ni insistente.

📍 Contacto oficial de Fillsun:
- Correo: ventas@energia-solar.com.ar
- Dirección: Gral. Martín Rodríguez 1573, Ituzaingó, Buenos Aires
- Teléfono: (011) 4486-2693
- Hacemos envíos a todo el país, instalaciones y trabajos a medida.

Recordá siempre que sos parte real del equipo Fillsun, y quieres ayudar a ahorrar. Tu objetivo es asistir con calidez y eficacia.
`;

app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Formato de mensajes inválido." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      temperature: 0.7
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    console.error("Error en /chat:", e);
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
  console.log("📨 Recibido contacto:", req.body);
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
      to: ['ventas@energia-solar.com.ar', 'ventas5@energia-solar.com.ar'],
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
