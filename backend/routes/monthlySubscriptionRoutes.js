const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Assuming you have a db.js file for DB connection

// Fetch all subscriptions
// 📌 Get all charts
router.get('/charts', (req, res) => {
    db.query('SELECT * FROM charts', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// 📌 Get all heads linked to a specific chart
router.get('/heads/:chart_id', (req, res) => {
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

// 📌 Get all monthly subscriptions
router.get('/monthly_subscriptions', (req, res) => {
    db.query('SELECT * FROM monthly_subscriptions', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// Add a new subscription
router.post('/monthly_subscriptions', (req, res) => {
    const { date, chart_from, from_account, chart_to, to_account, reference, amount } = req.body;

    if (!date || !chart_from || !from_account || !chart_to || !to_account || !reference || !amount) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO MonthlySubscriptions (date, chart_from, from_account, chart_to, to_account, reference, amount) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [date, chart_from, from_account, chart_to, to_account, reference, amount], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add subscription' });
        }

        res.status(201).json({
            id: result.insertId,
            date,
            chart_from,
            from_account,
            chart_to,
            to_account,
            reference,
            amount
        });
    });
});

// Update a subscription
router.put('/monthly_subscriptions/:id', (req, res) => {
    const { id } = req.params;
    const { date, chart_from, from_account, chart_to, to_account, reference, amount } = req.body;

    if (!date || !chart_from || !from_account || !chart_to || !to_account || !reference || !amount) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'UPDATE MonthlySubscriptions SET date = ?, chart_from = ?, from_account = ?, chart_to = ?, to_account = ?, reference = ?, amount = ? WHERE id = ?';
    db.query(query, [date, chart_from, from_account, chart_to, to_account, reference, amount, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update subscription' });
        }

        res.json({ id, date, chart_from, from_account, chart_to, to_account, reference, amount });
    });
});

// Delete a subscription
router.delete('/monthly_subscriptions/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM MonthlySubscriptions WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete subscription' });
        }

        res.json({ id });
    });
});

router.get('/heads/:chart_id', (req, res) => {
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
            res.json(result.length > 0 ? result : []);
        }
    );
});


module.exports = router;
