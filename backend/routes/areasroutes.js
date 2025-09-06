const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Fetch all areas
router.get('/api/areas', (req, res) => {
    db.query('SELECT * FROM Areas', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// Add a new area
router.post('/api/areas', (req, res) => {
    const { area_code, area_title } = req.body;

    if (!area_code || !area_title) {
        return res.status(400).json({ error: 'Area code and area title are required' });
    }

    const query = 'INSERT INTO Areas (area_code, area_title) VALUES (?, ?)';
    db.query(query, [area_code, area_title], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add area' });
        }

        res.status(201).json({
            id: result.insertId,
            area_code,
            area_title
        });
    });
});

// Update an area
// Update an area
router.put('/api/areas/:id', (req, res) => {
    const { id } = req.params; // Extracting area ID from the URL
    const { area_code, area_title } = req.body;

    if (!area_code || !area_title) {
        return res.status(400).json({ error: 'Area code and area title are required' });
    }

    const query = 'UPDATE Areas SET area_code = ?, area_title = ? WHERE id = ?';
    db.query(query, [area_code, area_title, id], (err, result) => {
        if (err) {
            console.error('Error during update:', err);
            return res.status(500).json({ error: 'Failed to update area' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Area not found' });
        }

        res.json({ id, area_code, area_title });
    });
});

// Delete an area
router.delete('/api/areas/:id', (req, res) => {
    const { id } = req.params; // Extracting area ID from the URL

    const query = 'DELETE FROM Areas WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error during deletion:', err);
            return res.status(500).json({ error: 'Failed to delete area' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Area not found' });
        }

        res.json({ message: 'Area deleted successfully', id });
    });
});



module.exports = router;
