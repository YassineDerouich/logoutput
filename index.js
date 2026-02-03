const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const randomString = Math.random().toString(36).substring(2);

// URL de Ping-pong définie par variable d'env (ex: http://pingpong-svc:2348/pings)
const PINGPONG_URL = process.env.PINGPONG_URL || 'http://pingpong-svc:2348/pings';

// --- ENDPOINT POUR READINESS PROBE ---
app.get('/healthz', async (req, res) => {
    try {
        // On considère Log Output "prêt" seulement s'il peut parler à Ping-pong
        await axios.get(PINGPONG_URL);
        res.status(200).send('OK');
    } catch (error) {
        console.error("Readiness check failed (Ping-pong unreachable):", error.message);
        res.status(500).send('Dependency not ready');
    }
});

app.get('/status', async (req, res) => {
    const timestamp = new Date().toISOString();
    let pings = 0;

    try {
        const response = await axios.get(PINGPONG_URL);
        pings = response.data.pings;
    } catch (error) {
        console.error("Erreur de connexion à Ping-pong:", error.message);
        pings = "indisponible";
    }

    res.send(`${timestamp}: ${randomString}.\nPings / Pongs: ${pings}`);
});

app.listen(port,'0.0.0.0', () => {
    console.log(`Log output app listening on port ${port}`);
});
