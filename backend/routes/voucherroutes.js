const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Route to handle payment submission
router.post("/vouchers/payment", (req, res) => {
    const { paymentType, formData, rows, totalAmount } = req.body;

    console.log("Received payment data:", req.body);

    // Validate input
    if (!paymentType || !formData || !rows || !totalAmount) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // Step 1: Insert payment into the payments table
        const insertPaymentQuery = `
            INSERT INTO payments (transaction_type, reference_id, payment_date, payment_amount, payment_method, remarks)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const paymentDate = formData.date || new Date().toISOString().split("T")[0]; // Use provided date or today's date
        const paymentMethod = paymentType === "CR" || paymentType === "CP" ? "cash" : "bank_transfer"; // Determine payment method
        const remarks = formData.remarks || "Payment processed";

        db.query(
            insertPaymentQuery,
            [paymentType, formData.reference, paymentDate, totalAmount, paymentMethod, remarks],
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error inserting payment:", err);
                        res.status(500).json({ error: "Failed to insert payment" });
                    });
                }

                const paymentId = result.insertId; // Get the inserted payment ID

                // Step 2: Process each row and insert into the appropriate ledger table
                const processRow = (row, index) => {
                    return new Promise((resolve, reject) => {
                        if (paymentType === "CP" || paymentType === "BP") {
                            // Fetch purchase_id based on subaccount_id
                            const fetchPurchaseIdQuery = `
                                SELECT purchase_id 
                                FROM purchase_ledger 
                                WHERE sub_account_id = ? 
                                LIMIT 1
                            `;
                            db.query(fetchPurchaseIdQuery, [row.subaccountId], (err, results) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                if (results.length === 0) {
                                    reject(new Error("No purchase found for subaccount_id"));
                                    return;
                                }

                                const purchase_id = results[0].purchase_id;

                                // Insert into purchase_ledger
                                const insertPurchaseLedgerQuery = `
                                    INSERT INTO purchase_ledger (
                                        sub_account_id, credit, transaction_date, transaction_type, purchase_id
                                    )
                                    VALUES (?, ?, ?, ?, ?)
                                `;
                                const purchaseLedgerValues = [
                                    row.subaccountId, // sub_account_id
                                    row.amount, // credit
                                    paymentDate, // transaction_date
                                    paymentType, // transaction_type
                                    purchase_id // purchase_id
                                ];

                                db.query(insertPurchaseLedgerQuery, purchaseLedgerValues, (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        } else if (paymentType === "CR" || paymentType === "BR") {
                            // Fetch reference_id based on subaccount_id
                            const fetchReferenceIdQuery = `
                                SELECT reference_id 
                                FROM sales_ledger 
                                WHERE sub_account_id = ? 
                                LIMIT 1
                            `;
                            db.query(fetchReferenceIdQuery, [row.subaccountId], (err, results) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                if (results.length === 0) {
                                    reject(new Error("No sale found for subaccount_id"));
                                    return;
                                }

                                const reference_id = results[0].reference_id;

                                // Insert into sales_ledger
                                const insertSalesLedgerQuery = `
                                    INSERT INTO sales_ledger (
                                        sub_account_id, credit_amount, transaction_date, transaction_type, reference_id
                                    )
                                    VALUES (?, ?, ?, ?, ?)
                                `;
                                const salesLedgerValues = [
                                    row.subaccountId, // sub_account_id
                                    row.amount, // credit_amount
                                    paymentDate, // transaction_date
                                    paymentType, // transaction_type
                                    reference_id // reference_id
                                ];

                                db.query(insertSalesLedgerQuery, salesLedgerValues, (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        } else {
                            reject(new Error("Invalid payment type"));
                        }
                    });
                };

                // Process all rows
                Promise.all(rows.map(processRow))
                    .then(() => {
                        // Commit the transaction
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Error committing transaction:", err);
                                    res.status(500).json({ error: "Transaction failed" });
                                });
                            }

                            res.status(200).json({ message: "Payment processed successfully!", paymentId });
                        });
                    })
                    .catch((err) => {
                        return db.rollback(() => {
                            console.error("Error processing rows:", err);
                            res.status(500).json({ error: "Failed to process rows" });
                        });
                    });
            }
        );
    });
});

module.exports = router;


