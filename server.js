const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile('tasks.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.json([]);
    }
});

// Save tasks
app.post('/api/tasks', async (req, res) => {
    try {
        await fs.writeFile('tasks.json', JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));