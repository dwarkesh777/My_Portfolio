const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

app.post("/send-message", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Please complete all fields." });
    }

    const safe = (value) => String(value)
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

    await Promise.all([
      transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.OWNER_EMAIL,
        replyTo: email,
        subject: `Portfolio Message: ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;background:#071426;color:#fff;border-radius:20px">
            <h1 style="color:#22d3ee">New Portfolio Message</h1>
            <p><b>Name:</b> ${safe(name)}</p>
            <p><b>Email:</b> ${safe(email)}</p>
            <p><b>Subject:</b> ${safe(subject)}</p>
            <div style="background:#020817;padding:20px;border-radius:12px;white-space:pre-wrap">${safe(message)}</div>
          </div>`
      }),
      transporter.sendMail({
        from: `"Dwarkesh S. Savaliya" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Thank you for contacting Dwarkesh",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:35px;background:#071426;color:#fff;border-radius:20px">
            <h1 style="color:#22d3ee">Thank You, ${safe(name)}!</h1>
            <p style="color:#cbd5e1;font-size:17px;line-height:1.7">
              I received your message successfully and will respond as soon as possible.
            </p>
            <div style="padding:20px;background:#020817;border-radius:12px">
              <b>Your subject:</b><p>${safe(subject)}</p>
            </div>
            <p>Regards,<br><b style="color:#22d3ee">Dwarkesh S. Savaliya</b><br>React Native & Full Stack Developer</p>
          </div>`
      })
    ]);

    res.json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Email could not be sent. Check the server email configuration." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
