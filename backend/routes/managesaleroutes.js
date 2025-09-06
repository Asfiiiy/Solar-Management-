const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post('/sales', (req, res) => {
    const { 
        order_date, 
        reference, 
        sub_account_id, 
        total_amount, 
        sales_items, 
        receipt_rows, 
        tax_account, 
        discount_account, 
        remarks 
    } = req.body;

    console.log("Received sale data:", req.body);

    // Ensure tax_account is present and contains the required fields
    if (!tax_account || !tax_account.account || !tax_account.percent || !tax_account.amount) {
        return res.status(400).json({ error: "Tax account data is incomplete. Please provide 'account', 'percent', and 'amount'." });
    }

    // Ensure discount_account is present and contains the required fields
    if (!discount_account || !discount_account.account || !discount_account.percent || !discount_account.amount) {
        return res.status(400).json({ error: "Discount account data is incomplete. Please provide 'account', 'percent', and 'amount'." });
    }

    // Ensure sales_items is present and contains at least one item
    if (!sales_items || sales_items.length === 0) {
        return res.status(400).json({ error: "Sales items are required." });
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // Step 1: Insert into 'sales' table
        const saleQuery = `
            INSERT INTO sales (order_date, reference, sub_account_id, total_amount, remarks)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(saleQuery, [order_date, reference, sub_account_id, total_amount, remarks], (err, result) => {
            if (err) {
                db.rollback(() => {
                    console.error("Error inserting sale:", err);
                    return res.status(500).json({ error: "Failed to insert sale" });
                });
            }

            const sale_id = result.insertId; // Get the last inserted sale_id

            // Process each sale item and insert into sale_items table
            let salesProcessed = 0;  // To track the number of sales processed correctly
            sales_items.forEach(item => {
                // Check quantity and update inventory
                const checkPurchaseItemQuantityQuery = `
                    SELECT quantity FROM purchase_items WHERE product_id = ?
                `;
                db.query(checkPurchaseItemQuantityQuery, [item.product], (err, result) => {
                    if (err) {
                        db.rollback(() => {
                            console.error("Error checking quantity in purchase_items:", err);
                            return res.status(500).json({ error: "Failed to check purchase item quantity" });
                        });
                    }

                    if (result.length === 0 || result[0].quantity <= 0) {
                        return res.status(400).json({ error: `Your stock of product_id ${item.product} is zero, cannot make a sale.` });
                    }

                    const inventoryQuery = `
                        SELECT * FROM inventory WHERE product_id = ?
                    `;
                    db.query(inventoryQuery, [item.product], (err, result) => {
                        if (err) {
                            db.rollback(() => {
                                console.error("Error checking inventory:", err);
                                return res.status(500).json({ error: "Failed to check inventory" });
                            });
                        }

                        if (result.length > 0) {
                            // Update inventory purchase_rate
                            const updatedSaleRate = result[0].sale_rate + item.amount;

                            // Update inventory and reduce stock
                            const updateInventoryQuery = `
                                UPDATE inventory
                                SET quantity = quantity - ?, sale_rate = ?
                                WHERE product_id = ?
                            `;
                            db.query(updateInventoryQuery, [item.quantity, updatedSaleRate, item.product], (err) => {
                                if (err) {
                                    db.rollback(() => {
                                        console.error("Error updating inventory:", err);
                                        return res.status(500).json({ error: "Failed to update inventory" });
                                    });
                                }
                                console.log(`Updated inventory for product_id ${item.product}`);
                            });
                        } else {
                            return res.status(400).json({ error: `Product with ID ${item.product} not found in inventory.` });
                        }

                        // Insert sale item
                        const saleItemQuery = `
                            INSERT INTO sale_items (sale_id, product_id, quantity, rate, amount)
                            VALUES (?, ?, ?, ?, ?)
                        `;
                        db.query(saleItemQuery, [sale_id, item.product, item.quantity, item.rate, item.amount], (err) => {
                            if (err) {
                                db.rollback(() => {
                                    console.error("Error inserting sale item:", err);
                                    return res.status(500).json({ error: "Failed to insert sale item" });
                                });
                            }

                            console.log(`Inserted sale item for product_id ${item.product}`);
                            salesProcessed++;

                            // Only send the response once all items have been processed
                            if (salesProcessed === sales_items.length) {
                                // Insert into sales ledger, tax_discount_accounts, and receipt_accounts
                                const ledgerQuery = `
                                INSERT INTO sales_ledger (transaction_date, sub_account_id, transaction_type, debit_amount, credit_amount, balance, description, reference_id, remarks)
                                VALUES (?, ?, 'sale', ?, 0, ?, 'Sale Transaction', ?, ?)
                            `;
                            db.query(ledgerQuery, [order_date, sub_account_id, total_amount, total_amount, sale_id, remarks], (err) => {
                                if (err) {
                                    db.rollback(() => {
                                        console.error("Error inserting into sales ledger:", err);
                                        return res.status(500).json({ error: "Failed to insert into sales ledger" });
                                    });
                                }
                            
                                console.log('Sales ledger updated');
                            });
                            

                                

                                // Commit the transaction after all operations are successful
                                db.commit((err) => {
                                    if (err) {
                                        db.rollback(() => {
                                            console.error("Error committing transaction:", err);
                                            return res.status(500).json({ error: "Failed to commit transaction" });
                                        });
                                    }

                                    res.status(200).json({ message: "Sale processed successfully!" });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});



// Route to fetch all sales
router.get('/sales', (req, res) => {
    const { sub_account_id, sale_id, date } = req.query;

    // Construct SQL query dynamically based on provided filters
    let query = `
        SELECT s.id AS sale_id, s.order_date, s.reference, s.sub_account_id, s.total_amount, s.remarks, 
               si.id AS sale_item_id, si.product_id, si.quantity, si.amount, 
               sa.title AS customer_name  /* Joining with subaccounts to fetch customer name */
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN subaccounts sa ON s.sub_account_id = sa.id  /* Assuming 'subaccounts' table exists and contains subaccount names */
        WHERE 1=1
    `;
    
    const params = [];

    // Apply filters if present
    if (sub_account_id) {
        query += ' AND s.sub_account_id = ?';
        params.push(sub_account_id);
    }
    if (sale_id) {
        query += ' AND s.id = ?';
        params.push(sale_id);
    }
    if (date) {
        query += ' AND s.order_date = ?';
        params.push(date);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching sales:', err);
            return res.status(500).json({ error: 'Failed to fetch sales' });
        }

        res.json(results);  // Return the results as the response
    });
});




// Route to delete a sale
router.delete('/sales/:sale_id', (req, res) => {
    const { sale_id } = req.params;

    // Delete the sale items associated with the sale
    const deleteSaleItemsQuery = `DELETE FROM sale_items WHERE sale_id = ?`;
    db.query(deleteSaleItemsQuery, [sale_id], (err) => {
        if (err) {
            console.error("Error deleting sale items:", err);
            return res.status(500).json({ error: "Failed to delete sale items" });
        }

        // Delete the sale record
        const deleteSaleQuery = `DELETE FROM sales WHERE id = ?`;
        db.query(deleteSaleQuery, [sale_id], (err) => {
            if (err) {
                console.error("Error deleting sale:", err);
                return res.status(500).json({ error: "Failed to delete sale" });
            }

            res.status(200).json({ message: "Sale deleted successfully" });
        });
    });
});



// Route to fetch a sale for printing
router.get('/sales/:sale_id/print', (req, res) => {
    const { sale_id } = req.params;

    // Fetch the sale data and sale items based on the sale_id
    const query = `
        SELECT s.id AS sale_id, s.order_date, s.reference, s.sub_account_id, s.total_amount, s.remarks, 
               si.id AS sale_item_id, si.product_id, si.quantity, si.rate, si.amount, 
               sa.title AS customer_name
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN subaccounts sa ON s.sub_account_id = sa.id
        WHERE s.id = ?
    `;
    
    db.query(query, [sale_id], (err, results) => {
        if (err) {
            console.error('Error fetching sale for print:', err);
            return res.status(500).json({ error: 'Failed to fetch sale data for printing' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        // Return the sale data (this could be formatted for printing)
        res.json(results);
    });
});






module.exports = router;
