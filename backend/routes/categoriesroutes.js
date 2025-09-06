const express = require('express');
const router = express.Router();
const db = require('../config/db');  // Assuming the DB connection is in this file

// Fetch all products and their category details
router.get('/api/products', (req, res) => {
    const query = `
        SELECT p.id, p.item_title, p.quantity, p.purchase_rate, p.sale_rate, p.category_id, c.category_title 
        FROM products p
        LEFT JOIN productcategories c ON p.category_id = c.id
    `;
    db.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result); // Send the products along with their category details
    });
});

// Add a new product and ensure inventory is created
router.post('/api/products', (req, res) => {
    const { item_title, quantity, category_id, purchase_rate, sale_rate } = req.body;

    // Check that all required fields are provided
    if (!item_title || !quantity || !category_id || !purchase_rate || !sale_rate) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert the product into the 'products' table with category_id and quantity
    const query = 'INSERT INTO products(item_title, quantity, category_id, purchase_rate, sale_rate) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [item_title, quantity, category_id, purchase_rate, sale_rate], (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            return res.status(500).json({ error: 'Failed to add product' });
        }

        const productId = result.insertId;  // Get the inserted product's ID

        // Insert a new record into the 'inventory' table with quantity and sub_account_id set to NULL
        const inventoryQuery = 'INSERT INTO inventory (product_id, product_name, quantity, purchase_rate, sale_rate, sub_account_id) VALUES (?, ?, ?, ?, ?, NULL)';
        db.query(inventoryQuery, [productId, item_title, quantity, purchase_rate, sale_rate], (err, invResult) => {
            if (err) {
                console.error('Error inserting inventory record:', err);
                return res.status(500).json({ error: 'Failed to create inventory record' });
            }

            // Respond with success
            res.status(201).json({
                id: productId,
                item_title,
                quantity,
                category_id,
                purchase_rate,
                sale_rate,
                inventory: { product_id: productId, quantity, sub_account_id: null }
            });
        });
    });
});


// Fetch all categories
router.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM productcategories', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

// Add a new category
router.post('/api/categories', (req, res) => {
    const { category_title } = req.body;

    if (!category_title) {
        return res.status(400).json({ error: 'Category title is required' });
    }

    const query = 'INSERT INTO productcategories (category_title) VALUES (?)';
    db.query(query, [category_title], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add category' });
        }

        res.status(201).json({
            id: result.insertId,
            category_title
        });
    });
});

module.exports = router;
