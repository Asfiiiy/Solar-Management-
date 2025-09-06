
const express = require('express');
const mysql = require('mysql2');   

const cors = require('cors');  // Import the cors package
const app = express();

//Routes
const categoriesRoutes = require('./routes/categoriesroutes'); 
const groupsRoutes = require('./routes/groupsroutes');  // Import groups routes
const areasRoutes = require('./routes/areasroutes'); // For managing areas
const monthlySubscriptionRoutes = require('./routes/monthlySubscriptionRoutes'); // Import the routes
const chartRoutes = require('./routes/chartroutes');
const openingRoutes = require('./routes/openingroutes');
const purchasesRoutes = require("./routes/purchasesroutes");
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const mainledgerroutes = require('./routes/mainledgerroutes');
const managesaleroutes = require('./routes/managesaleroutes');
const salereturnroutes = require('./routes/salereturnroutes');
const voucherroutes = require('./routes/voucherroutes');
const balance = require('./routes/balance');



// Use CORS and body parser middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Handle form data



// Create the MySQL connection


// Use the categories routes
app.use('/', categoriesRoutes); 
app.use(groupsRoutes);
app.use( areasRoutes);
app.use(monthlySubscriptionRoutes);
app.use( chartRoutes); 
app.use(openingRoutes);
app.use("/api", purchasesRoutes);
app.use('/api', productRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', mainledgerroutes);
app.use('/api', managesaleroutes);
app.use('/api', salereturnroutes)
app.use( voucherroutes);
app.use( '/api',balance);




// Handle adding a new sub-account (Account Title)
app.post('/api/subaccounts', (req, res) => {
    const {
        head_id,
        code,
        title,
        area_region,
        primary_contact,
        secondary_contact,
        email,
        contact_person,
        address,
        dashboard_status,
        groups
    } = req.body;  // Get all the fields from the request body

    // Validate the incoming data
    if (!head_id || !code || !title) {
        return res.status(400).json({ error: 'Head ID, code, and title are required' });
    }

    // Insert into the SubAccounts table
    const query = `
        INSERT INTO subaccounts
        (head_id, code, title, area_region, primary_contact, secondary_contact, email, contact_person, address, dashboard_status, groups)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
        head_id, 
        code, 
        title, 
        area_region, 
        primary_contact, 
        secondary_contact, 
        email, 
        contact_person, 
        address, 
        dashboard_status, 
        groups
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add sub-account' });
        }

        // Respond with the new sub-account's data
        res.status(201).json({
            id: result.insertId,
            head_id,
            code,
            title,
            area_region,
            primary_contact,
            secondary_contact,
            email,
            contact_person,
            address,
            dashboard_status,
            groups
        });
    });
});


app.get('/heads/:chart_id', (req, res) => {
    const { chart_id } = req.params;

    db.query(
        `SELECT H.* FROM Heads H 
         JOIN Groups G ON H.group_id = G.id 
         WHERE G.chart_id = ?`,
        [chart_id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database query error' });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: 'No heads found for this chart' });
            }
            res.json(result);
        }
    );
});



// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
