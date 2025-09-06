const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Route to fetch sale and sale items for return by sale_id
router.get('/sales/:sale_id/return', (req, res) => {
    const { sale_id } = req.params;

    // Query to fetch sale data and sale items for the given sale_id
    const query = `
        SELECT s.id AS sale_id, s.order_date, s.reference, s.total_amount, s.remarks, 
               si.id AS sale_item_id, si.product_id, si.quantity, si.rate, si.amount 
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        WHERE s.id = ?
    `;

    db.query(query, [sale_id], (err, results) => {
        if (err) {
            console.error('Error fetching sale data:', err);
            return res.status(500).json({ error: 'Failed to fetch sale data' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.json(results);  // Return sale and sale items data
    });
});



// Route to process sale return and update relevant tables
router.post('/sales/return', (req, res) => {
    const { sale_id, sale_items, return_quantity, return_amount, remarks } = req.body;

    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // Update sale_items with returned quantity and amount
        sale_items.forEach(item => {
            const updateSaleItemQuery = `
                UPDATE sale_items 
                SET quantity = quantity - ?, amount = amount - ? 
                WHERE sale_id = ? AND product_id = ?
            `;
            db.query(updateSaleItemQuery, [return_quantity, return_amount, sale_id, item.product_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error updating sale item:", err);
                        return res.status(500).json({ error: "Failed to update sale item" });
                    });
                }
            });

            // Update inventory sale_rate column based on return
            const updateInventoryQuery = `
                UPDATE inventory 
                SET sale_rate = sale_rate - ? 
                WHERE product_id = ?
            `;
            db.query(updateInventoryQuery, [return_amount, item.product_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error updating inventory:", err);
                        return res.status(500).json({ error: "Failed to update inventory" });
                    });
                }
            });
        });

        // Update total amount in sales table (after return)
        const updateSaleQuery = `
            UPDATE sales 
            SET total_amount = total_amount - ? 
            WHERE id = ?
        `;
        db.query(updateSaleQuery, [return_amount, sale_id], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error updating sale:", err);
                    return res.status(500).json({ error: "Failed to update sale" });
                });
            }

            // Commit the transaction
            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error committing transaction:", err);
                        return res.status(500).json({ error: "Transaction failed" });
                    });
                }

                res.status(200).json({ message: "Sale return processed successfully" });
            });
        });
    });
});


module.exports = router;