const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 📌 Fetch all charts
router.get('/charts', (req, res) => {
    db.query('SELECT * FROM charts', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// 📌 Fetch groups for a specific chart
router.get('/groups/:chart_id', (req, res) => {
    const { chart_id } = req.params;
    db.query('SELECT * FROM Groups WHERE chart_id = ?', [chart_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// 📌 Fetch heads for a specific group (Corrected)
router.get('/heads/group/:group_id', (req, res) => {
    const { group_id } = req.params;
    db.query('SELECT * FROM Heads WHERE group_id = ?', [group_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// 📌 Fetch heads for a specific chart (If needed)
router.get('/heads/chart/:chart_id', (req, res) => {
    const { chart_id } = req.params;
    db.query(
        `SELECT H.* FROM Heads H 
         JOIN Groups G ON H.group_id = G.id 
         WHERE G.chart_id = ?`,
        [chart_id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database query error' });
            }
            res.json(result);
        }
    );
});

// 📌 Fetch sub-accounts for a specific head
router.get('/subaccounts/:head_id', (req, res) => {
    const { head_id } = req.params;
    db.query('SELECT * FROM SubAccounts WHERE head_id = ?', [head_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// 📌 Add a new group
router.post('/groups', (req, res) => {
    const { chart_id, name } = req.body;
    if (!chart_id || !name) {
        return res.status(400).json({ error: 'Chart ID and name are required' });
    }
    db.query('INSERT INTO Groups (chart_id, name) VALUES (?, ?)', [chart_id, name], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add group' });
        }
        res.status(201).json({ id: result.insertId, chart_id, name });
    });
});

// 📌 Add a new head
router.post('/heads', (req, res) => {
    const { group_id, name } = req.body;
    if (!group_id || !name) {
        return res.status(400).json({ error: 'Group ID and name are required' });
    }
    db.query('INSERT INTO Heads (group_id, name) VALUES (?, ?)', [group_id, name], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add head' });
        }
        res.status(201).json({ id: result.insertId, group_id, name });
    });
});

// 📌 Add a new sub-account
router.post('/subaccounts', (req, res) => {
    const { head_id, code, title } = req.body;
    if (!head_id || !code || !title) {
        return res.status(400).json({ error: 'Head ID, code, and title are required' });
    }
    db.query('INSERT INTO SubAccounts (head_id, code, title) VALUES (?, ?, ?)', [head_id, code, title], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add sub-account' });
        }
        res.status(201).json({ id: result.insertId, head_id, code, title });
    });
});

// 📌 Delete a group
router.delete('/groups/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Groups WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete group' });
        }
        res.json({ id });
    });
});

// 📌 Delete a head
router.delete('/heads/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Heads WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete head' });
        }
        res.json({ id });
    });
});

// 📌 Delete a sub-account
router.delete('/subaccounts/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM SubAccounts WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete sub-account' });
        }
        res.json({ id });
    });
});

module.exports = router;
