import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SaleInvoice = () => {
    
    const [orderData, setOrderData] = useState({
        date: '14-02-2025',
        reference: '',
        chart: '',
        account: ''
    });
    const [products, setProducts] = useState([]);
    const [subAccounts, setSubAccounts] = useState([]);
    const [remarks, setRemarks] = useState('');  // State for remarks input

    const [salesItems, setSalesItems] = useState([
        { product: '', quantity: 0, rate: 0, amount: 0 }
    ]);
    const [taxAccount, setTaxAccount] = useState({ account: '', percent: 0, amount: 0 });
    const [discountAccount, setDiscountAccount] = useState({ account: '', percent: 0, amount: 0 });
    const [totalAmount, setTotalAmount] = useState(0);
    const [receiptAccount, setReceiptAccount] = useState('');  // State for receipt subaccount

    const [receiptRows, setReceiptRows] = useState([
        { receiptAccount: '', amount: 0, remarks: '' }
    ]);

    const [charts, setCharts] = useState([]); // Define charts state

    const [activeTab, setActiveTab] = useState("invoice");  

 

    useEffect(() => {
        axios.get('http://localhost:5000/charts')
            .then(response => setCharts(response.data))
            .catch(error => console.error(error));
    }, []);

    // Fetch products from the backend
    useEffect(() => {
        axios.get('http://localhost:5000/api/products')
            .then(response => {
                setProducts(response.data);  // Set products array from response
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);
    // Define state for tax and discount subaccounts
// Define state for all subaccounts
const [allSubAccounts, setAllSubAccounts] = useState([]);

// Fetch all subaccounts (not filtering based on type)
useEffect(() => {
    axios.get('http://localhost:5000/api/subaccounts')  // Adjust your API endpoint
        .then(response => setAllSubAccounts(response.data))  // Set all subaccounts to state
        .catch(error => console.error('Error fetching subaccounts:', error));
}, []);  // Empty dependency array ensures it runs once when the component mounts
 // Empty dependency array means this will run once when the component is mounted


    // Fetch charts from the backend
    useEffect(() => {
        axios.get('http://localhost:5000/charts')
            .then(response => setCharts(response.data))
            .catch(error => console.error('Error fetching charts:', error));
    }, []);

   // Fetch subaccounts based on selected chart
   useEffect(() => {
    if (orderData.chart) {
        axios.get(`http://localhost:5000/api/subaccounts/chart/${orderData.chart}`)
            .then(response => setSubAccounts(response.data))
            .catch(error => console.error("Error fetching sub-accounts:", error));
    }
}, [orderData.chart]);

    const handleProductChange = (index, field, value) => {
        const updatedSalesItems = [...salesItems];
        updatedSalesItems[index][field] = value;
        updatedSalesItems[index].amount = updatedSalesItems[index].quantity * updatedSalesItems[index].rate;
        setSalesItems(updatedSalesItems);
        calculateTotal(updatedSalesItems);
    };

   // Function to calculate total based on product amount, tax, and discount
const calculateTotal = (updatedSalesItems) => {
    const total = updatedSalesItems.reduce((sum, item) => sum + item.amount, 0); // Sum of all product amounts
    
    // Calculate tax and discount based on percentages
    const taxAmount = (total * (taxAccount.percent / 100)); // Tax based on total
    const discountAmount = (total * (discountAccount.percent / 100)); // Discount based on total
    
    // Final total after applying tax and discount
    const finalTotal = total + taxAmount - discountAmount;
    
    // Update the states for tax amount, discount amount, and total amount
    setTaxAccount(prevState => ({ ...prevState, amount: taxAmount }));
    setDiscountAccount(prevState => ({ ...prevState, amount: discountAmount }));
    setTotalAmount(finalTotal); // Update the final total
};

// Handling the input change for tax amount (manual input)
const handleTaxAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTaxAccount({ ...taxAccount, amount: value });
    // Recalculate the total with the updated tax amount
    calculateTotalWithManualTax(value);
};

// Handling the input change for discount amount (manual input)
const handleDiscountAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscountAccount({ ...discountAccount, amount: value });
    // Recalculate the total with the updated discount amount
    calculateTotalWithManualDiscount(value);
};

// Function to calculate the total with the manual tax amount
const calculateTotalWithManualTax = (manualTaxAmount) => {
    const total = salesItems.reduce((sum, item) => sum + item.amount, 0);  // Sum of all product amounts
    const discountAmount = (total * (discountAccount.percent / 100));  // Apply discount based on percentage
    const finalTotal = total + manualTaxAmount - discountAmount;  // Apply the manually inputted tax amount
    setTotalAmount(finalTotal);
};

// Function to calculate the total with the manual discount amount
const calculateTotalWithManualDiscount = (manualDiscountAmount) => {
    const total = salesItems.reduce((sum, item) => sum + item.amount, 0);  // Sum of all product amounts
    const taxAmount = (total * (taxAccount.percent / 100));  // Apply tax based on percentage
    const finalTotal = total + taxAmount - manualDiscountAmount;  // Apply the manually inputted discount amount
    setTotalAmount(finalTotal);
};




const handleReceiptChange = (index, field, value) => {
    const updatedRows = [...receiptRows];  // Copy the current rows
    updatedRows[index][field] = value;  // Update the field (either 'receiptAccount' or 'remarks')
    setReceiptRows(updatedRows);  // Update the state with the modified rows
};

const handleAmountChange = (index, value) => {
    const updatedRows = [...receiptRows];  // Copy the current rows
    updatedRows[index].amount = value;  // Update the amount for the specific row
    setReceiptRows(updatedRows);  // Update the state with the modified rows
};



// Fetch all subaccounts when the Receipt Subaccount field is clicked
const handleReceiptAccountFocus = () => {
    if (allSubAccounts.length === 0) {
        // Fetch subaccounts only if they are not already fetched
        axios.get('http://localhost:5000/api/subaccounts')  // Adjust your API endpoint
            .then(response => {
                setAllSubAccounts(response.data);  // Set all subaccounts to state
            })
            .catch(error => console.error('Error fetching subaccounts:', error));
    }
};

const handleSubmit = () => {
    // Ensure taxAccount and discountAccount have all necessary fields
    if (!taxAccount || !taxAccount.account || !taxAccount.percent || !taxAccount.amount) {
        alert("Please provide complete tax account data.");
        return;
    }

    if (!discountAccount || !discountAccount.account || !discountAccount.percent || !discountAccount.amount) {
        alert("Please provide complete discount account data.");
        return;
    }

    const saleData = {
        order_date: orderData.date,
        reference: orderData.reference,
        sub_account_id: orderData.account,
        total_amount: totalAmount,
        sales_items: salesItems,
        receipt_rows: receiptRows,
        tax_account: taxAccount,
        discount_account: discountAccount,
        remarks: orderData.remarks || ''
    };

    axios.post('http://localhost:5000/api/sales', saleData)
        .then(response => {
            console.log('Sale saved:', response);
            alert('Sale saved successfully!');
        })
        .catch(error => {
            if (error.response && error.response.data && error.response.data.error) {
                // Display the error message received from backend
                alert(error.response.data.error);
            } else {
                // Handle unexpected errors (e.g., network issues)
                alert('There was an error saving the sale.');
            }
        });

    // Reset all the fields after submitting
    setOrderData({
        date: '14-02-2025',
        reference: '',
        chart: '',
        account: ''
    });
    setSalesItems([ { product: '', quantity: 0, rate: 0, amount: 0 } ]);
    setTaxAccount({ account: '', percent: 0, amount: 0 });
    setDiscountAccount({ account: '', percent: 0, amount: 0 });
    setReceiptRows([ { receiptAccount: '', amount: 0, remarks: '' } ]);
    setTotalAmount(0);
    setRemarks('');
    setSubAccounts([]);
    setCharts([]);
};



    return (
       
    
        <div>
            <h4>Sale Invoice (Add New)</h4>
            
            {/* Sale Date */}
            <div className="form-group">
                <label>Sale Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={orderData.date}
                    onChange={(e) => setOrderData({ ...orderData, date: e.target.value })}
                />
            </div>

            {/* Reference */}
            <div className="form-group">
                <label>Reference</label>
                <input
                    type="text"
                    className="form-control"
                    value={orderData.reference}
                    onChange={(e) => setOrderData({ ...orderData, reference: e.target.value })}
                />
            </div>

            {/* Chart */}
            <div className="form-group">
                <label>Chart</label>
                <select
                    className="form-control"
                    value={orderData.chart}
                    onChange={(e) => setOrderData({ ...orderData, chart: e.target.value })}
                >
                    <option value="">Select Chart</option>
                    {charts.map((chart) => (
                        <option key={chart.id} value={chart.id}>{chart.name}</option>
                    ))}
                </select>
            </div>

            {/* Sub Account */}
            <div className="form-group">
                <label>Sub Account</label>
                <select
                    className="form-control"
                    value={orderData.account}
                    onChange={(e) => setOrderData({ ...orderData, account: e.target.value })}
                >
                    <option value="">Select Sub Account</option>
                    {subAccounts.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.title}</option>
                    ))}
                </select>
            </div>

            {/* Products Table */}
            <table className="table table-bordered mt-3">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {salesItems.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <select
                                    className="form-control"
                                    value={item.product}
                                    onChange={(e) => handleProductChange(index, 'product', e.target.value)}
                                >
                                    <option value="">Select Product</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>{product.item_title}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={item.quantity}
                                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={item.rate}
                                    onChange={(e) => handleProductChange(index, 'rate', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={item.amount}
                                    disabled
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Tax and Discount Table */}
            <table className="table table-bordered mt-3">
    <thead>
        <tr>
            <th>Tax Account</th>
            <th>%</th>
            <th>Amount</th>
            <th>Discount Account</th>
            <th>%</th>
            <th>Amount</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <select
                    className="form-control"
                    value={taxAccount.account}
                    onChange={(e) => setTaxAccount({ ...taxAccount, account: e.target.value })}
                >
                    <option value="">Select Tax Account</option>
                    {allSubAccounts.length > 0 ? (
                        allSubAccounts.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.title}
                            </option>
                        ))
                    ) : (
                        <option>No Subaccounts Available</option>
                    )}
                </select>
            </td>
            <td>
                <input
                    type="number"
                    className="form-control"
                    value={taxAccount.percent}
                    onChange={(e) => setTaxAccount({ ...taxAccount, percent: e.target.value })}
                />
            </td>
            <td>
                <input
                    type="number"
                    className="form-control"
                    value={taxAccount.amount}
                    onChange={(e) => handleTaxAmountChange(e)}  // Allow manual input
                />
            </td>
            <td>
                <select
                    className="form-control"
                    value={discountAccount.account}
                    onChange={(e) => setDiscountAccount({ ...discountAccount, account: e.target.value })}
                >
                    <option value="">Select Discount Account</option>
                    {allSubAccounts.length > 0 ? (
                        allSubAccounts.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.title}
                            </option>
                        ))
                    ) : (
                        <option>No Subaccounts Available</option>
                    )}
                </select>
            </td>
            <td>
                <input
                    type="number"
                    className="form-control"
                    value={discountAccount.percent}
                    onChange={(e) => setDiscountAccount({ ...discountAccount, percent: e.target.value })}
                />
            </td>
            <td>
                <input
                    type="number"
                    className="form-control"
                    value={discountAccount.amount}
                    onChange={(e) => handleDiscountAmountChange(e)}  // Allow manual input
                />
            </td>
        </tr>
    </tbody>
</table>

           

            {/* Receipt Account and Remarks */}
            {/* Add Receipt Subaccount, Remarks, and Amount */}<div className="form-group mt-4">
           
<table className="table table-bordered mt-3">
    <thead>
        <tr>
            <th>Receipt Account</th>
            <th>Remarks</th>
            <th>Amount</th>
        </tr>
    </thead>
    <tbody>
        {receiptRows.map((row, index) => (
            <tr key={index}>
                <td>
                    <select
                        className="form-control"
                        value={row.receiptAccount}
                        onChange={(e) => handleReceiptChange(index, 'receiptAccount', e.target.value)}
                    >
                        <option value="">Select Receipt Account</option>
                        {allSubAccounts.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.title}
                            </option>
                        ))}
                    </select>
                </td>
                <td>
                    <input
                        type="text"
                        className="form-control"
                        value={row.remarks}
                        onChange={(e) => handleReceiptChange(index, 'remarks', e.target.value)}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        className="form-control"
                        value={row.amount}
                        onChange={(e) => handleAmountChange(index, e.target.value)}  // Handle manual amount input
                    />
                </td>
            </tr>
        ))}
    </tbody>
</table>

</div>

            <div className="form-group">
                <label>Remarks</label>
                <input
                    type="text"
                    className="form-control"
                    value={orderData.remarks || ''}
                    onChange={(e) => setOrderData({ ...orderData, remarks: e.target.value })}
                />
            </div>

            {/* Total Amount */}
            <div>
                <h5>Total Amount: {totalAmount}</h5>
            </div>

            {/* Submit Button */}
            <button className="btn btn-primary mt-3" onClick={handleSubmit}>Submit Sale</button>
        </div>
    );
};

export default SaleInvoice;
