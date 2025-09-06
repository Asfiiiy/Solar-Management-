// /controllers/groupsController.js
const db = require('../config/db');

// Get all groups
exports.getGroups = (req, res) => {
    db.query('SELECT * FROM Groups', (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

// Create a new group
exports.createGroup = (req, res) => {
    const { group_name, description } = req.body;
    const query = 'INSERT INTO Groups (group_name, description) VALUES (?, ?)';
    db.query(query, [group_name, description], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, group_name, description });
    });
};
