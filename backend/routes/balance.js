const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Fetch balance for a sub-account
router.get("/balance", async (req, res) => {
    const { subAccountId, transactionType } = req.query;

    try {
        const balanceQuery = `
            SELECT balance 
            FROM ${transactionType === 'sale' ? 'sales_ledger' : 'purchase_ledger'}
            WHERE sub_account_id = ?
            ORDER BY transaction_date DESC
            LIMIT 1
        `;
        const balanceResult = await db.query(balanceQuery, [subAccountId]);
        const balance = balanceResult[0]?.balance || 0;
        res.status(200).json({ balance });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ error: "Failed to fetch balance" });
    }
});

module.exports = router;