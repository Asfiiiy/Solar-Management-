const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Fetch all charts
router.get("/charts", (req, res) => {
    db.query("SELECT * FROM charts", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});




// Fetch all sub-accounts related to a selected chart
router.get("/subaccounts/chart/:chartId", (req, res) => {
    const { chartId } = req.params;
    if (!chartId) return res.status(400).json({ error: "Chart ID is required" });

    console.log(`Fetching sub-accounts for Chart ID: ${chartId}`);

    // Step 1: Get all group IDs related to the selected chart
    const groupQuery = "SELECT id FROM groups WHERE chart_id = ?";
    db.query(groupQuery, [chartId], (err, groupResults) => {
        if (err) {
            console.error("Error fetching groups:", err);
            return res.status(500).json({ error: "Database query error in fetching groups" });
        }

        if (groupResults.length === 0) {
            console.log("No groups found for Chart ID:", chartId);
            return res.json([]); // No groups found
        }

        const groupIds = groupResults.map(group => group.id);

        // Step 2: Get all head IDs related to those groups
        const headQuery = `SELECT id FROM heads WHERE group_id IN (${groupIds.join(",")})`;
        db.query(headQuery, (err, headResults) => {
            if (err) {
                console.error("Error fetching heads:", err);
                return res.status(500).json({ error: "Database query error in fetching heads" });
            }

            if (headResults.length === 0) {
                console.log("No heads found for Chart ID:", chartId);
                return res.json([]); // No heads found
            }

            const headIds = headResults.map(head => head.id);

            // Step 3: Get all sub-accounts related to those heads
            const subAccountQuery = `SELECT * FROM subaccounts WHERE head_id IN (${headIds.join(",")})`;
            db.query(subAccountQuery, (err, subAccountResults) => {
                if (err) {
                    console.error("Error fetching sub-accounts:", err);
                    return res.status(500).json({ error: "Database query error in fetching sub-accounts" });
                }

                console.log(`Fetched ${subAccountResults.length} sub-accounts for Chart ID ${chartId}`);
                res.json(subAccountResults);
            });
        });
    });
});


// Fetch all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();  // or whichever ORM method you're using
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
    }
});






// Fetch all purchases
// Fetch all purchases with product details
router.get('/purchases', (req, res) => {
    const query = `
        SELECT p.id, p.order_date, p.reference, p.total_amount, p.remarks, 
               pi.product_id, pi.quantity, pi.amount, pr.product_name
        FROM purchases p
        JOIN purchase_items pi ON p.id = pi.purchase_id
        JOIN inventory pr ON pi.product_id = pr.product_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching purchases:', err);
            return res.status(500).json({ error: 'Failed to fetch purchases' });
        }

        // Return the purchases with product, quantity, and amount details
        res.json(results);
    });
});




///Purchase_items and inventory///

router.post('/purchases', (req, res) => {
    const { order_date, reference, sub_account_id, remarks, total_amount, purchase_items } = req.body;

    console.log("Purchase items data:", purchase_items);
    console.log('Received Purchase Data:', req.body);

    // Start a transaction to ensure both the purchase and inventory updates happen atomically
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // Insert into purchases table
        db.query('INSERT INTO purchases SET ?', {
            order_date, 
            reference, 
            sub_account_id, 
            remarks, 
            total_amount
        }, (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error inserting purchase:", err);
                    res.status(500).json({ error: "Failed to insert purchase" });
                });
            }

            const purchase_id = result.insertId;  // Get the purchase_id from the inserted purchase

            // Now process each purchase item
            // Inside the POST /purchases route
purchase_items.forEach(item => {
    // Always insert a new row into purchase_items, even if the product exists
    const insertQuery = `
        INSERT INTO purchase_items (purchase_id, product_id, quantity, waste, rate, amount, expense)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [purchase_id, item.product_id, item.quantity, item.waste, item.rate, item.amount, item.expense], (err) => {
        if (err) {
            return db.rollback(() => {
                console.error("Error inserting new purchase item:", err);
                res.status(500).json({ error: "Failed to insert new purchase item" });
            });
        }

        console.log(`Inserted new purchase item for product_id ${item.product_id}`);
    });
});

            


            // Now update the inventory for each purchased item directly in the backend
            purchase_items.forEach(item => {
                // Step 1: Fetch the current quantity and rate from the inventory
                const inventoryQuery = `SELECT quantity, purchase_rate FROM inventory WHERE product_id = ?`;
                db.query(inventoryQuery, [item.product_id], (err, inventoryResult) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Error fetching inventory details:", err);
                            res.status(500).json({ error: "Failed to fetch inventory details" });
                        });
                    }
            
                    if (inventoryResult.length === 0) {
                        return db.rollback(() => {
                            console.log(`No inventory record found for product_id: ${item.product_id}`);
                            res.status(404).json({ error: `Inventory not found for product_id: ${item.product_id}` });
                        });
                    }
            
                    const currentInventory = inventoryResult[0];
            
                    // Step 2: Update the quantity and rate in the inventory
                    const newQuantity = currentInventory.quantity + item.quantity;
            
                    // Here, you add `item.amount` to the existing `purchase_rate`
                    const updatedRate = currentInventory.purchase_rate + item.amount;
            
                    // Step 3: Update the inventory with the new quantity and rate
                    const updateInventoryQuery = `
                        UPDATE inventory
                        SET quantity = ?, purchase_rate = ?, sub_account_id = ?
                        WHERE product_id = ?
                    `;
                    db.query(updateInventoryQuery, [newQuantity, updatedRate, sub_account_id, item.product_id], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Error updating inventory:", err);
                                res.status(500).json({ error: "Failed to update inventory" });
                            });
                        }
            
                        if (result.affectedRows === 0) {
                            return db.rollback(() => {
                                console.log(`No inventory record found for product_id: ${item.product_id}`);
                                res.status(404).json({ error: `Inventory record not updated for product_id: ${item.product_id}` });
                            });
                        }
                    });
                });
            });

            // Commit the transaction if all the queries are successful
            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error committing transaction:", err);
                        res.status(500).json({ error: "Transaction failed" });
                    });
                }


                // Step 3: Insert into the purchase_ledger with debit, credit, and balance
            purchase_items.forEach(item => {
                const insertLedgerQuery = `
                    INSERT INTO purchase_ledger (purchase_id, product_id, quantity, rate, amount, sub_account_id, debit, credit, balance, remarks)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                // Initially, no payment is made, so set the debit to the amount and credit/balance to 0
                db.query(insertLedgerQuery, [
                    purchase_id,
                    item.product_id,
                    item.quantity,
                    item.rate,
                    item.amount,
                    sub_account_id,
                    item.amount,   // Debit is the purchase amount
                    0,             // No payment made, so credit is 0
                    item.amount,   // Balance is the same as the debit initially
                    remarks
                ], (err) => {
                    if (err) {
                        console.error("Error inserting into purchase ledger:", err);
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Failed to update purchase ledger' });
                        });
                    }
                    console.log('Purchase ledger updated successfully');
                });
            });
                res.status(200).json({ message: 'Purchase saved successfully!', purchase_id });
            });
        });
    });
});





/////////////Purchase Return//////////////

// Fetch all purchase IDs (from the purchase_items table)
router.get('/purchase-ids', (req, res) => {
    const query = `
        SELECT DISTINCT purchase_id FROM purchase_items
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching purchase IDs:", err);
            return res.status(500).json({ error: 'Failed to fetch purchase IDs' });
        }

        // Return the list of purchase IDs
        res.json(results.map(row => row.purchase_id));
    });
});


// Fetch purchase details by product_id
// Fetch purchase details by purchase_id
router.get('/purchase-details/:purchaseId', (req, res) => {
    const { purchaseId } = req.params;

    const query = `
        SELECT pi.purchase_id, pi.product_id, pi.quantity, pi.rate, p.sub_account_id
        FROM purchase_items pi
        JOIN purchases p ON pi.purchase_id = p.id
        WHERE pi.purchase_id = ?
    `;
    
    db.query(query, [purchaseId], (err, results) => {
        if (err) {
            console.error("Error fetching purchase details:", err);
            return res.status(500).json({ error: 'Failed to fetch purchase details' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No purchase found for this purchase_id' });
        }

        // Return the purchase details (product_id, rate, sub_account_id, quantity)
        res.json(results[0]);
    });
});

// Handle product return
// Handle purchase 
router.post('/purchase-return', (req, res) => {
    const { return_items, remarks, total_amount } = req.body;

    console.log('Processing Purchase Return:', req.body);

    // Start a transaction to ensure both the purchase_items and inventory are updated atomically
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        return_items.forEach(item => {
            // Step 1: Update the purchase_items table (subtract the return quantity and amount)
            const updatePurchaseItemQuery = `
                UPDATE purchase_items
                SET quantity = quantity - ?, amount = amount - ?
                WHERE purchase_id = ? AND product_id = ?
            `;
            db.query(updatePurchaseItemQuery, [item.quantity, item.amount, item.purchase_id, item.product_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error updating purchase items:", err);
                        return res.status(500).json({ error: 'Failed to update purchase items' });
                    });
                }

                console.log(`Updated purchase item for product_id ${item.product_id}`);
            });

            // Step 2: Insert the return details into the purchase_returns table
            const insertReturnQuery = `
                INSERT INTO purchase_returns (purchase_id, product_id, quantity, rate, amount, reason, return_date, sub_account_id, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const returnDate = new Date().toISOString().split('T')[0]; // Get today's date
            const reason = "Returned product"; // You can make this dynamic based on user input

            db.query(insertReturnQuery, [
                item.purchase_id,
                item.product_id,
                item.quantity,
                item.rate,
                item.amount,
                reason,
                returnDate,
                item.sub_account_id,
                remarks
            ], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error inserting into purchase_returns table:", err);
                        return res.status(500).json({ error: 'Failed to insert into purchase_returns table' });
                    });
                }

                console.log(`Inserted purchase return for product_id ${item.product_id}`);
            });

            // Step 3: Update the inventory (subtract quantity and adjust purchase_rate)
            const updateInventoryQuery = `
                UPDATE inventory
                SET quantity = quantity - ?, purchase_rate = purchase_rate - ?
                WHERE product_id = ?
            `;
            db.query(updateInventoryQuery, [item.quantity, item.amount, item.product_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error updating inventory:", err);
                        return res.status(500).json({ error: 'Failed to update inventory' });
                    });
                }

                console.log(`Updated inventory for product_id ${item.product_id}`);
            });

            // Step 4: Update the debit and return_amount in the purchase_ledger (adjusting for return)
            const updateLedgerQuery = `
                UPDATE purchase_ledger
                SET 
                    debit = debit - ?,            
                    balance = balance - ?,        
                    return_amount = return_amount + ?  
                WHERE purchase_id = ? AND product_id = ?
            `;
            db.query(updateLedgerQuery, [item.amount, item.amount, item.amount, item.purchase_id, item.product_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error updating purchase ledger after return:", err);
                        return res.status(500).json({ error: 'Failed to update purchase ledger after return' });
                    });
                }

                console.log(`Updated debit, balance, and return_amount for purchase_ledger product_id ${item.product_id}`);
            });
        });

        // Commit the transaction if everything is successful
        db.commit((err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error committing transaction:", err);
                    return res.status(500).json({ error: 'Transaction failed' });
                });
            }

            res.status(200).json({ message: 'Purchase return processed successfully!' });
        });
    });
});


// Route to fetch all subaccounts
router.get('/subaccounts', (req, res) => {
    // Query to fetch all subaccounts from the database
    const query = 'SELECT * FROM subaccounts';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching subaccounts:', err);
            return res.status(500).json({ error: 'Failed to fetch subaccounts' });
        }

        // Return the fetched subaccounts
        res.json(results);
    });
});

// Route to update purchase ledger
router.post('/purchase-ledger/update-purchase-ledger', (req, res) => {
    const { purchase_id, product_id, quantity, amount } = req.body;

    // Step 1: Check if the row exists for the given purchase_id and product_id
    const checkLedgerQuery = `
        SELECT * FROM purchase_ledger 
        WHERE purchase_id = ? AND product_id = ?
    `;

    db.query(checkLedgerQuery, [purchase_id, product_id], (err, results) => {
        if (err) {
            console.error('Error checking purchase ledger:', err);
            return res.status(500).json({ error: 'Failed to check purchase ledger' });
        }

        if (results.length > 0) {
            console.log("Matching ledger entry found:", results);  // Debug log for matched results

            // If the row exists, update the quantity and amount in the purchase ledger
            const updateLedgerQuery = `
                UPDATE purchase_ledger
                SET quantity = quantity - ?, amount = amount - ?
                WHERE purchase_id = ? AND product_id = ? AND quantity >= ? AND amount >= ?
            `;

            db.query(updateLedgerQuery, [quantity, amount, purchase_id, product_id, quantity, amount], (err, result) => {
                if (err) {
                    console.error('Error updating purchase ledger on return:', err);
                    return res.status(500).json({ error: 'Failed to update purchase ledger' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'No matching ledger entry found to update' });
                }

                res.status(200).json({ message: `Purchase ledger updated: ${result.affectedRows} row(s) affected` });
            });
        } else {
            // If no matching record is found
            res.status(404).json({ error: 'No matching purchase ledger entry found' });
        }
    });
});



module.exports = router;
