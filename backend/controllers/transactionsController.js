// /controllers/transactionsController.js
const db = require('../config/db');

// Create a new transaction
exports.createTransaction = (req, res) => {
    const { sub_account_id, amount, transaction_date, description } = req.body;
    const query = 'INSERT INTO Transactions (sub_account_id, amount, transaction_date, description) VALUES (?, ?, ?, ?)';
    db.query(query, [sub_account_id, amount, transaction_date, description], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, sub_account_id, amount, transaction_date, description });
    });
};
