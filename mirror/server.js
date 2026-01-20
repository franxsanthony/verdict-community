const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();
const PORT = 3099;

app.get('/fetch', async (req, res) => {
    const url = req.query.url;

    if (!url || !url.includes('codeforces.com')) {
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    console.log(`[Mirror Service] Fetching: ${url}`);

    try {
        const scriptPath = path.join(__dirname, 'cli_fetch.js');
        const { stdout, stderr } = await execPromise(`node "${scriptPath}" "${url}"`, {
            timeout: 120000 // 2 minute timeout
        });

        if (stderr) {
            console.log('[Mirror Service] Logs:', stderr);
        }

        const data = JSON.parse(stdout.trim());
        res.json(data);
    } catch (error) {
        console.error('[Mirror Service] Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch problem',
            detail: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔗 Mirror Service running on http://0.0.0.0:${PORT}`);
});
