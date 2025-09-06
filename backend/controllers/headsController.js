// /controllers/headsController.js
const db = require('../config/db');

// Get heads for a specific group
exports.getHeads = (req, res) => {
    const { group_id } = req.params;
    db.query('SELECT * FROM Heads WHERE group_id = ?', [group_id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

// Create a new head
exports.createHead = (req, res) => {
    const { group_id, head_name, description } = req.body;
    const query = 'INSERT INTO Heads (group_id, head_name, description) VALUES (?, ?, ?)';
    db.query(query, [group_id, head_name, description], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, group_id, head_name, description });
    });
};
