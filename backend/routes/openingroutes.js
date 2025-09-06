const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import database connection

// 📌 Get all opening vouchers
router.get('/opening_voucher', (req, res) => {
    db.query(
        `SELECT o.*, c.name AS chart_name, h.name AS head_name 
         FROM opening_voucher o
         JOIN charts c ON o.chart_id = c.id
         JOIN heads h ON o.head_id = h.id`,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database query error' });
            }
            res.json(result);
        }
    );
});

// 📌 Add a new opening voucher
router.post('/opening_voucher', (req, res) => {
    const { date, chart_id, head_id, payable, receivable } = req.body;

    if (!date || !chart_id || !head_id || (!payable && !receivable)) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.query(
        `INSERT INTO opening_voucher (date, chart_id, head_id, payable, receivable)
         VALUES (?, ?, ?, ?, ?)`,
        [date, chart_id, head_id, payable || 0, receivable || 0],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save opening voucher' });
            }
            res.status(201).json({ id: result.insertId, date, chart_id, head_id, payable, receivable });
        }
    );
});

// 📌 Delete an opening voucher entry
router.delete('/opening_voucher/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM opening_voucher WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete opening voucher' });
        }
        res.json({ message: 'Voucher entry deleted successfully', id });
    });
});

module.exports = router;
