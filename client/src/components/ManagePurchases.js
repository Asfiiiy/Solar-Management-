import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const ManagePurchases = () => {
    const [activeTab, setActiveTab] = useState("invoice");

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Manage Purchases</h2>

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "invoice" ? "active" : ""}`}
                        onClick={() => setActiveTab("invoice")}>Purchase Invoice</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "list" ? "active" : ""}`}
                        onClick={() => setActiveTab("list")}>List Purchases</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "return" ? "active" : ""}`}
                        onClick={() => setActiveTab("return")}>Purchases Return</button>
                </li>
            </ul>

            {/* Content Sections */}
            <div className="tab-content mt-3">
                {activeTab === "invoice" && <PurchaseInvoice />}
                {activeTab === "list" && <ListPurchases />}
                {activeTab === "return" && <PurchaseReturn />}
            </div>
        </div>
    );
};

const ListPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const [itemsPerPage] = useState(10); // Show 10 items per page

    // Fetch all purchases from the backend
    useEffect(() => {
        axios
            .get('http://localhost:5000/api/purchases') // Endpoint for fetching all purchases with product details
            .then((response) => {
                setPurchases(response.data);
                setFilteredPurchases(response.data); // Initialize filteredPurchases with all purchases
            })
            .catch((error) => {
                console.error('There was an error fetching the purchases!', error);
            });
    }, []);

    // Handle search by ID
    const handleSearchById = (e) => {
        setSearchId(e.target.value);
        filterPurchases(e.target.value, searchDate);
    };

    // Handle search by Date
    const handleSearchByDate = (e) => {
        setSearchDate(e.target.value);
        filterPurchases(searchId, e.target.value);
    };

    // Filter purchases based on search criteria
    const filterPurchases = (id, date) => {
        let filtered = purchases;

        if (id) {
            filtered = filtered.filter(purchase =>
                purchase.id.toString().includes(id) // Filter by purchase ID
            );
        }

        if (date) {
            filtered = filtered.filter(purchase =>
                purchase.order_date.includes(date) // Filter by order date
            );
        }

        setFilteredPurchases(filtered);
    };

    // Get the items to display for the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <h4>List Purchases</h4>

            <div className="form-group">
                <label>Search by ID</label>
                <input
                    type="text"
                    className="form-control"
                    value={searchId}
                    onChange={handleSearchById}
                    placeholder="Enter purchase ID"
                />
            </div>

            <div className="form-group">
                <label>Search by Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={searchDate}
                    onChange={handleSearchByDate}
                />
            </div>

            <table className="table table-bordered mt-3">
                <thead>
                    <tr>
                        <th>Purchase ID</th>
                        <th>Order Date</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Total Amount</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((purchase) => (
                            <tr key={purchase.id}>
                                <td>{purchase.id}</td>
                                <td>{purchase.order_date}</td>
                                <td>{purchase.product_name}</td>
                                <td>{purchase.quantity}</td>
                                <td>{purchase.amount ? purchase.amount.toLocaleString() : 'N/A'}</td>
                                <td>{purchase.total_amount ? purchase.total_amount.toLocaleString() : 'N/A'}</td>
                                <td>{purchase.remarks || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No purchases found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination controls */}
            <div className="pagination">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                <span>Page {currentPage}</span>

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage * itemsPerPage >= filteredPurchases.length}
                >
                    Next
                </button>
            </div>
        </div>
    );
};


//////////////   Purchase Reutrn //////////////////////
///////////////////////////////////////////////////////



const PurchaseReturn = () => {
    const [products, setProducts] = useState([]);
    const [purchaseDetails, setPurchaseDetails] = useState(null);
    const [returnItems, setReturnItems] = useState([{ product: '', quantity: '', rate: '', amount: '', purchase_id: '', sub_account_id: '' }]);
    const [remarks, setRemarks] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [purchaseIds, setPurchaseIds] = useState([]); // To store the list of purchase IDs

    // Fetch purchase IDs from the backend
    useEffect(() => {
        axios.get('http://localhost:5000/api/purchase-ids') // Assuming you have an endpoint that returns all purchase_ids
            .then(response => setPurchaseIds(response.data))
            .catch(error => console.error("Error fetching purchase IDs:", error));
    }, []);

    // Fetch products for the dropdown
    useEffect(() => {
        axios.get('http://localhost:5000/api/products')
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    // Fetch purchase details when a purchase ID is selected
    const handlePurchaseSelect = (index, purchaseId) => {
        setReturnItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index].purchase_id = purchaseId;

            // Fetch purchase details for the selected purchase_id
            axios.get(`http://localhost:5000/api/purchase-details/${purchaseId}`)
                .then(response => {
                    const { product_id, rate, quantity, sub_account_id } = response.data;
                    updatedItems[index].product = product_id;
                    updatedItems[index].rate = rate;
                    updatedItems[index].quantity = quantity; // Set the available quantity
                    updatedItems[index].sub_account_id = sub_account_id;
                    updatedItems[index].amount = 0; // Reset amount initially
                })
                .catch(error => console.error("Error fetching purchase details:", error));

            return updatedItems;
        });
    };

    // Handle changes in quantity or rate
    const handleChange = (index, field, value) => {
        const updatedItems = [...returnItems];
        updatedItems[index][field] = value;

        // If quantity or rate changes, calculate the amount
        if (field === 'quantity' || field === 'rate') {
            updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
        }

        setReturnItems(updatedItems);
        calculateTotal(updatedItems);
    };

    // Calculate total amount for the return
    const calculateTotal = (updatedItems) => {
        const total = updatedItems.reduce((sum, item) => sum + (item.amount ? parseFloat(item.amount) : 0), 0);
        setTotalAmount(total);
    };

    // Add a new row for another product return
    const addRow = () => {
        setReturnItems([...returnItems, { product: '', quantity: '', rate: '', amount: '', purchase_id: '', sub_account_id: '' }]);
    };

    // Submit the return
    const handleSubmit = () => {
        const returnData = {
            remarks,
            total_amount: totalAmount,
            return_items: returnItems.map(item => ({
                product_id: item.product,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                purchase_id: item.purchase_id,
                sub_account_id: item.sub_account_id
            }))
        };

        // Submit purchase return data
        axios.post('http://localhost:5000/api/purchase-return', returnData)
            .then(response => {
                console.log("✅ Purchase return processed successfully!", response.data);

                // Now update the purchase_items and inventory for each return item
                returnData.return_items.forEach(item => {
                    // Update purchase_items table by subtracting quantity from the existing quantity
                    axios.put('http://localhost:5000/api/purchase-items/update-quantity', {
                        purchase_id: item.purchase_id,
                        product_id: item.product_id,
                        quantity: item.quantity // Subtract the return quantity
                    })
                    .then(res => {
                        console.log("✅ Purchase items updated successfully!", res.data);
                    })
                    .catch(err => {
                        console.error("❌ Error updating purchase items:", err.response ? err.response.data : err);
                    });

                    // Check inventory availability and update quantity and amount
                    axios.put('http://localhost:5000/api/inventory/update', {
                        product_id: item.product_id,
                        quantity: item.quantity, // Subtract from inventory
                        amount: item.amount, // Subtract the amount calculated
                        purchase_rate: item.rate // Pass the purchase rate to calculate inventory changes
                    })
                    .then(res => {
                        console.log("✅ Inventory updated successfully!", res.data);
                    })
                    .catch(err => {
                        console.error("❌ Error updating inventory:", err.response ? err.response.data : err);
                    });
                });

                // Reset form after submission
                setReturnItems([{ product: '', quantity: '', rate: '', amount: '', purchase_id: '', sub_account_id: '' }]);
                setRemarks('');
                setTotalAmount(0);
            })
            .catch(error => {
                console.error("❌ Error processing purchase return:", error.response ? error.response.data : error);
            });
    };

    return (
        <div>
            <h4>Purchase Return</h4>

            {returnItems.map((item, index) => (
                <div key={index} className="form-row">
                    <div className="form-group col-md-3">
                        <label>Purchase ID</label>
                        <select
                            className="form-control"
                            value={item.purchase_id}
                            onChange={(e) => handlePurchaseSelect(index, e.target.value)} // Use handlePurchaseSelect
                        >
                            <option value="">Select Purchase ID</option>
                            {purchaseIds.map(id => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group col-md-3">
                        <label>Product</label>
                        <input
                            type="text"
                            className="form-control"
                            value={item.product} // Auto-filled product
                            disabled
                        />
                    </div>
                    <div className="form-group col-md-3">
                        <label>Rate</label>
                        <input
                            type="number"
                            className="form-control"
                            value={item.rate} // Auto-filled rate
                            disabled
                        />
                    </div>
                    <div className="form-group col-md-3">
                        <label>Quantity</label>
                        <input
                            type="number"
                            className="form-control"
                            value={item.quantity} // Auto-filled quantity
                            disabled
                        />
                    </div>
                    <div className="form-group col-md-3">
                        <label>Return Quantity</label>
                        <input
                            type="number"
                            className="form-control"
                            value={item.quantity} // Default quantity
                            onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                            max={item.quantity} // Prevent return quantity greater than available quantity
                        />
                    </div>
                    <div className="form-group col-md-3">
                        <label>Amount</label>
                        <input
                            type="number"
                            className="form-control"
                            value={item.amount}
                            disabled
                        />
                    </div>
                </div>
            ))}

            <div className="form-group">
                <label>Remarks</label>
                <input
                    type="text"
                    className="form-control"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Total Amount</label>
                <input type="text" className="form-control" value={totalAmount} disabled />
            </div>

            <button className="btn btn-secondary" onClick={addRow}>Add Row</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit Return</button>
        </div>
    );
};



///////////////////// PURCHASE INVOICE /////////////////////
/////////////////////////////////////////////////////////////

const PurchaseInvoice = () => {
    const [charts, setCharts] = useState([]);
    const [subAccounts, setSubAccounts] = useState([]);
    const [products, setProducts] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [purchases, setPurchases] = useState(Array.from({ length: 8 }, () => ({ product: '', quantity: '', waste: '', rate: '', amount: '', expense: '' })));
    const [orderData, setOrderData] = useState({
        date: '07-02-2025',
        reference: '',
        chart: '',
        account: ''
    });
    const [remarks, setRemarks] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);

    // Fetch charts
    useEffect(() => {
        axios.get('http://localhost:5000/charts')
            .then(response => setCharts(response.data))
            .catch(error => console.error(error));
    }, []);

    // Fetch subaccounts based on selected chart
    useEffect(() => {
        if (orderData.chart) {
            axios.get(`http://localhost:5000/api/subaccounts/chart/${orderData.chart}`)
                .then(response => setSubAccounts(response.data))
                .catch(error => console.error("Error fetching sub-accounts:", error));
        }
    }, [orderData.chart]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/products')
            .then(response => {
                setProducts(response.data);  // Set products array from response
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    // Handle changes in purchase item fields (quantity, rate, etc.)
    const handleChange = (index, field, value) => {
        // Ensure valid input for quantity, rate, etc.
        if (field === 'quantity' || field === 'rate') {
            // Make sure the value is a valid number
            value = value.replace(/^0+/, '');  // Remove leading zeroes
            if (isNaN(value) || value === '') {
                value = 0; // Default to 0 if the value is not valid
            }
        }
    
        const updatedPurchases = purchases.map((row, i) =>
            i === index ? { ...row, [field]: value } : row
        );
    
        // Calculate the amount based on valid quantity and rate
        if ((field === 'quantity' || field === 'rate') && updatedPurchases[index].product) {
            updatedPurchases[index].amount = parseFloat(updatedPurchases[index].quantity || 0) * parseFloat(updatedPurchases[index].rate || 0);
        }
    
        setPurchases(updatedPurchases);
        calculateTotal(updatedPurchases);
    };

    // Calculate total purchase amount
    const calculateTotal = (updatedPurchases) => {
        const total = updatedPurchases.reduce((sum, row) => sum + (row.product ? parseInt(row.amount || 0) : 0), 0);
        setTotalAmount(total);
    };

    // Add a new row for more purchase items
    const addRow = () => {
        setPurchases([...purchases, { product: '', quantity: '', waste: '', rate: '', amount: '', expense: '' }]);
    };

    const handleSubmit = () => {
        const formattedDate = new Date(orderData.date).toISOString().split("T")[0];
    
        const purchaseData = {
            order_date: formattedDate,
            reference: orderData.reference || null,
            sub_account_id: orderData.account ? Number(orderData.account) : null,
            remarks: remarks || null,
            total_amount: Number(totalAmount) || 0,
            purchase_items: purchases
                .filter(item => item.product)  // Filter out rows without product selected
                .map(item => ({
                    product_id: Number(item.product),
                    quantity: Number(item.quantity) || 0,
                    waste: Number(item.waste) || 0,
                    rate: Number(item.rate) || 0,
                    amount: Number(item.amount) || 0,
                    expense: Number(item.expense) || 0
                }))
        };
    
        // Add inventory update logic here by sending each product's data
        
    
        // Submit purchase data to the backend
        axios.post('http://localhost:5000/api/purchases', purchaseData)
            .then(response => {
                console.log("✅ Purchase saved successfully!", response.data);
    
                // Reset form fields after submission
                setOrderData({ date: "07-02-2025", reference: "", chart: "", account: "" });
                setPurchases(Array.from({ length: 8 }, () => ({ product: '', quantity: '', waste: '', rate: '', amount: '', expense: '' })));
                setRemarks(""); 
                setTotalAmount(0);
            })
            .catch(error => {
                console.error("❌ Error saving purchase:", error.response ? error.response.data : error);
            });
    };
    

    return (
        <div>
            <h4>Purchase Invoice</h4>
            <div className="form-group">
                <label>Order Date</label>
                <input type="date" className="form-control" value={orderData.date} onChange={(e) => setOrderData({ ...orderData, date: e.target.value })} />
            </div>
            <div className="form-group">
                <label>Reference</label>
                <input type="text" className="form-control" value={orderData.reference} onChange={(e) => setOrderData({ ...orderData, reference: e.target.value })} />
            </div>
            <div className="form-group">
                <label>Charts</label>
                <select className="form-control" value={orderData.chart} onChange={(e) => setOrderData({ ...orderData, chart: e.target.value })}>
                    <option value="">Select Chart</option>
                    {charts.map(chart => <option key={chart.id} value={chart.id}>{chart.name}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>Sub Accounts</label>
                <select className="form-control" value={orderData.account} onChange={(e) => setOrderData({ ...orderData, account: e.target.value })}>
                    <option value="">Select Sub Account</option>
                    {subAccounts.map(sub => <option key={sub.id} value={sub.id}>{sub.title}</option>)}
                </select>
            </div>

            <table className="table table-bordered mt-3">
                <thead>
                    <tr>
                        <th>Product</th><th>Quantity</th><th>Waste</th><th>Rate</th><th>Amount</th><th>Expense</th>
                    </tr>
                </thead>
                <tbody>
                    {purchases.map((p, index) => (
                        <tr key={index}>
                            <td>
                            <select
    className="form-control"
    onChange={(e) => handleChange(index, 'product', e.target.value)}
>
    <option value="">Select Product</option>
    {products.length > 0 ? (
        products.map(product => (
            <option key={product.id} value={product.id}>
                {product.item_title}  {/* Show product title, but use id as value */}
            </option>
        ))
    ) : (
        <option value="">No Products Available</option>
    )}
</select>
                            </td>
                            <td><input type="number" className="form-control" value={p.quantity} onChange={(e) => handleChange(index, 'quantity', e.target.value)} /></td>
                            <td><input type="number" className="form-control" value={p.waste} onChange={(e) => handleChange(index, 'waste', e.target.value)} /></td>
                            <td><input type="number" className="form-control" value={p.rate} onChange={(e) => handleChange(index, 'rate', e.target.value)} /></td>
                            <td><input type="text" className="form-control" value={p.amount} disabled /></td>
                            <td><input type="text" className="form-control" value={p.expense} onChange={(e) => handleChange(index, 'expense', e.target.value)} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="form-group mt-3">
                <label>Remarks</label>
                <input type="text" className="form-control" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Total Amount</label>
                <input type="text" className="form-control" value={totalAmount} disabled />
            </div>

            <button className="btn btn-secondary mt-3" onClick={addRow}>Add Row</button>
            <button className="btn btn-primary mt-3 ms-2" onClick={handleSubmit}>Submit Purchase</button>
        </div>
    );
};

export default ManagePurchases;
