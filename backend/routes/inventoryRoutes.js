const express = require('express');
const router = express.Router();
const db = require('../config/db');  // Assuming db connection is in config/db.js

router.post('/update_inventory', (req, res) => {
    const { product_id, quantity, sub_account_id, purchase_rate, amount } = req.body;

    // Input validation: check if required fields are present and valid
    if (!product_id || !quantity || quantity <= 0 || !purchase_rate || !amount) {
        return res.status(400).json({ error: 'Invalid product_id, quantity, purchase_rate, or amount' });
    }

    // Fetch the current inventory purchase_rate and quantity for the product
    const getCurrentInventoryQuery = 'SELECT purchase_rate, quantity FROM inventory WHERE product_id = ?';
    db.query(getCurrentInventoryQuery, [product_id], (err, result) => {
        if (err) {
            console.error('Error fetching current inventory:', err);
            return res.status(500).json({ error: 'Failed to fetch current inventory' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found in inventory' });
        }

        const currentQuantity = parseInt(result[0].quantity, 10) || 0;
        const currentRate = parseInt(result[0].purchase_rate, 10) || 0;

        const newQuantity = parseInt(quantity, 10);
        const newAmount = parseInt(amount, 10);

        // Step 1: Calculate the new total quantity
        const newTotalQuantity = currentQuantity + newQuantity;

        // Step 2: Add the new amount to the current purchase rate
        const updatedRate = currentRate + newAmount;  // Add the new amount to the current purchase rate

        // Step 3: Update the inventory with the new quantity and updated purchase_rate
        const updateInventoryQuery = `
            UPDATE inventory
            SET quantity = ?, sub_account_id = ?, purchase_rate = ?
            WHERE product_id = ?
        `;

        db.query(updateInventoryQuery, [newTotalQuantity, sub_account_id, updatedRate, product_id], (err, result) => {
            if (err) {
                console.error('Error updating inventory:', err);
                return res.status(500).json({ error: 'Failed to update inventory' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Inventory record not found for product_id: ' + product_id });
            }

            res.json({ message: 'Inventory updated successfully', product_id, quantity: newTotalQuantity, purchase_rate: updatedRate });
        });
    });
});





// Fetch inventory (Stock) details
// Fetch inventory (Stock) details
router.get('/inventory', (req, res) => {
    // Updated query to match the fields you have in your inventory table
    const query = 'SELECT product_id, product_name, quantity, purchase_rate FROM inventory';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: 'Failed to fetch inventory' });
        }

        res.json(results);
    });
});




router.post('/purchase_return', (req, res) => {
    const { purchase_id, product_id, quantity, amount, reason, return_date, remarks } = req.body;

    if (!purchase_id || !product_id || !quantity || !amount || !reason || !return_date || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid data. Please provide valid fields.' });
    }

    // Step 1: Verify if the purchase_id exists in the purchases table
    const purchaseCheckQuery = 'SELECT id FROM purchases WHERE id = ?';
    db.query(purchaseCheckQuery, [purchase_id], (err, result) => {
        if (err) {
            console.error('Error checking purchase_id:', err);
            return res.status(500).json({ error: 'Failed to check purchase_id' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'purchase_id not found in purchases table' });
        }

        // Step 2: Fetch the current inventory for the product
        const inventoryQuery = 'SELECT quantity, purchase_rate FROM inventory WHERE product_id = ?';
        db.query(inventoryQuery, [product_id], (err, result) => {
            if (err) {
                console.error('Error fetching inventory:', err);
                return res.status(500).json({ error: 'Failed to fetch inventory' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'Product not found in inventory' });
            }

            const currentInventory = result[0];
            const updatedQuantity = currentInventory.quantity - quantity;
            const updatedRate = currentInventory.purchase_rate - (amount / quantity);  // Adjust the purchase rate if needed

            // Step 3: Update the inventory with the new quantity and purchase_rate
            const updateInventoryQuery = `
                UPDATE inventory
                SET quantity = ?, purchase_rate = ?
                WHERE product_id = ?
            `;
            db.query(updateInventoryQuery, [updatedQuantity, updatedRate, product_id], (err, result) => {
                if (err) {
                    console.error('Error updating inventory:', err);
                    return res.status(500).json({ error: 'Failed to update inventory' });
                }

                // Step 4: Insert the return record into the purchase_returns table
                const insertReturnQuery = `
                    INSERT INTO purchase_returns (purchase_id, product_id, quantity, amount, reason, return_date, remarks)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                db.query(insertReturnQuery, [purchase_id, product_id, quantity, amount, reason, return_date, remarks], (err, result) => {
                    if (err) {
                        console.error('Error inserting purchase return:', err);
                        return res.status(500).json({ error: 'Failed to insert purchase return' });
                    }

                    // Step 5: Update the purchase_items table (subtract the returned quantity and amount)
                    const updatePurchaseItemsQuery = `
                        UPDATE purchase_items
                        SET quantity = quantity - ?, amount = amount - ?
                        WHERE purchase_id = ? AND product_id = ?
                    `;
                    db.query(updatePurchaseItemsQuery, [quantity, amount, purchase_id, product_id], (err, result) => {
                        if (err) {
                            console.error('Error updating purchase items:', err);
                            return res.status(500).json({ error: 'Failed to update purchase items' });
                        }

                        // Step 6: Respond with success
                        res.status(200).json({ message: 'Purchase return processed successfully' });
                    });
                });
            });
        });
    });
});






// Define the route for processing purchase returns
router.post('/purchase_return', (req, res) => {
    const { purchase_id, product_id, quantity, amount, reason, return_date, remarks } = req.body;

    if (!purchase_id || !product_id || !quantity || !amount || !reason || !return_date || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid data. Please provide valid fields.' });
    }

    // Check if the purchase_id exists in the purchases table
    const purchaseCheckQuery = 'SELECT id FROM purchases WHERE id = ?';
    db.query(purchaseCheckQuery, [purchase_id], (err, result) => {
        if (err) {
            console.error('Error checking purchase_id:', err);
            return res.status(500).json({ error: 'Failed to check purchase_id' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'purchase_id not found in purchases table' });
        }

        // Proceed with processing the return...
    });
});



// Backend Route: Fetch Purchase Return Data
// Backend Route: Fetch Purchase Return Data
router.get('/purchase-returns', (req, res) => {
    const query = `
    SELECT pr.id, pr.purchase_id, pr.product_id, pr.quantity, pr.rate, pr.amount, 
           pr.reason, pr.return_date, pr.sub_account_id, p.item_title AS product_name
    FROM purchase_returns pr
    JOIN products p ON pr.product_id = p.id
`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching purchase returns:', err);
            return res.status(500).json({ error: 'Failed to fetch purchase returns' });
        }
        res.json(results);  // Send the data back to the frontend
    });
});





// Export the router
module.exports = router;
