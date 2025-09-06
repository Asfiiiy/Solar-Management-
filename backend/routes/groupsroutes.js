const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Fetch all groups
router.get('/api/groups', (req, res) => {
    db.query('SELECT * FROM Groupes', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// Add a new group
router.post('/api/groups', (req, res) => {
    const { group_title, contact_no } = req.body;

    if (!group_title || !contact_no) {
        return res.status(400).json({ error: 'Group title and contact number are required' });
    }

    const query = 'INSERT INTO Groupes (group_title, contact_no) VALUES (?, ?)';
    db.query(query, [group_title, contact_no], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add group' });
        }

        res.status(201).json({
            id: result.insertId,
            group_title,
            contact_no
        });
    });
});

// Update a group
router.put('/api/groups/:id', (req, res) => {
    const { id } = req.params;
    const { group_title, contact_no } = req.body;

    if (!group_title || !contact_no) {
        return res.status(400).json({ error: 'Group title and contact number are required' });
    }

    const query = 'UPDATE Groupes SET group_title = ?, contact_no = ? WHERE id = ?';
    db.query(query, [group_title, contact_no, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update group' });
        }

        res.json({ id, group_title, contact_no });
    });
});

// Delete a group
router.delete('/api/groups/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM Groupes WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete group' });
        }

        res.json({ id });
    });
});




module.exports = router;
