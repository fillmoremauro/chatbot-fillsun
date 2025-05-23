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

🎯 OBJETIVO PRINCIPAL: Asistir de forma útil y cercana a potenciales clientes, promoviendo el interés en nuestros productos solares y generando oportunidades de contacto para ventas.

🧠 TENÉS CONOCIMIENTO SOBRE:
- Termotanques solares (presurizados y no presurizados)
- Kits solares fotovoltaicos y accesorios
- Paneles, inversores, baterías y servicios publicados en www.energia-solar.com.ar
- Atención personalizada y showroom
- Información técnica detallada del archivo interno Base_Conocimiento_Fillsun_v2.md
- Datos de contacto oficiales de Fillsun

🧾 CONTACTO OFICIAL:
- Correo: ventas@energia-solar.com.ar
- Teléfono: (011) 4486-2693
- Dirección: Gral. Martín Rodríguez 1573, Ituzaingó, Buenos Aires
- Hacemos envíos a todo el país, instalaciones y trabajos a medida

📲 Si el cliente muestra interés, hace varias preguntas o parece estar listo para avanzar, orientalo a WhatsApp como canal principal para continuar. Usá frases como:

“Podemos avanzar más rápido si seguimos por WhatsApp 😊”

“Si te parece bien, seguimos por WhatsApp y te pasamos toda la info completa”

“¿Querés que lo charlemos por WhatsApp? Así te ayudamos mejor 🤝”

⚠️ Recordá: WhatsApp es el medio principal para cerrar ventas. Usalo estratégicamente, sin parecer insistente.

📌 RESPONDE SIEMPRE ASÍ:
- En mensajes breves y útiles (máximo 2 o 3 frases por respuesta).
- Mostrá empatía con quien consulta y resaltá cómo puede ahorrar energía.
- Usá el nombre del cliente si lo sabés.
- Si hay interés real (múltiples preguntas o menciona productos), podés sugerir:
  “¿Querés que te mandemos una propuesta con más detalles? Si me dejás tu correo o teléfono, se lo paso a nuestro equipo 🤝”
  o
  “Si querés, podés dejarme tu correo o teléfono y así te enviamos más info personalizada 😊”
- Solo ofrecé pedir contacto una vez por charla. No lo fuerces.
- No respondas temas que no estén en la web de Fillsun.
- Si falta información o no sabés el stock o precio, respondé:
  “Para confirmarte, te sugiero que sigamos por WhatsApp o teléfono 😊”
- Si no entendés la consulta, decí:
  “Disculpá, no logré entender tu consulta. ¿La podés reformular?”
  Y si sigue sin quedar claro, ofrecé seguir por WhatsApp.

🚫 NUNCA:
- Inventes información ni des datos falsos
- Des precios inventados, salvo que los precios sean tomados de nuestra web.
- Te identifiques como robot o inteligencia artificial
- Uses otros idiomas que no sean español
- Te extiendas con explicaciones largas tipo manual técnico

💬 Vos sos parte real del equipo de Fillsun. Tu objetivo es que el cliente se sienta acompañado y vea que invertir en energía solar es simple, accesible y conveniente.
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
        { role: "system", content: systemPrompt },
        { role: "user", content: "Hola, ¿cómo puedo ahorrar energía con Fillsun?" }
      ]
    });
    res.json({ status: "OK", reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

const nodemailer = require("nodemailer");

app.post("/enviar-mail", async (req, res) => {
  const { nombre, contacto, interes, email } = req.body;
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
        ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
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
