// /controllers/subAccountsController.js
const db = require('../config/db');

// Get sub-accounts for a specific head
exports.getSubAccounts = (req, res) => {
    const { head_id } = req.params;
    db.query('SELECT * FROM SubAccounts WHERE head_id = ?', [head_id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

// Create a new sub-account
exports.createSubAccount = (req, res) => {
    const { head_id, sub_account_code, sub_account_name, description } = req.body;
    const query = 'INSERT INTO SubAccounts (head_id, sub_account_code, sub_account_name, description) VALUES (?, ?, ?, ?)';
    db.query(query, [head_id, sub_account_code, sub_account_name, description], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, head_id, sub_account_code, sub_account_name, description });
    });
};
