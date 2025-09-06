import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListSales = () => {
    // State variables
    const [salesData, setSalesData] = useState([]);
    const [subAccount, setSubAccount] = useState(''); // For sub account filter
    const [saleId, setSaleId] = useState(''); // For sale ID filter
    const [date, setDate] = useState(''); // For date filter
    const [allSubAccounts, setAllSubAccounts] = useState([]); // To store sub accounts

    // To store sale data to edit
    const [orderData, setOrderData] = useState({
        date: '',
        reference: '',
        account: '',
        remarks: ''
    });
    const [salesItems, setSalesItems] = useState([]);
    const [taxAccount, setTaxAccount] = useState({});
    const [discountAccount, setDiscountAccount] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);

    // Fetch all subaccounts for the "Select Sub Account" dropdown
    useEffect(() => {
        axios.get('http://localhost:5000/api/subaccounts')
            .then(response => {
                setAllSubAccounts(response.data);
            })
            .catch(error => {
                console.error('Error fetching subaccounts:', error);
            });
    }, []);

    // Fetch sales data based on filters
    const fetchSalesData = () => {
        const params = {};
        
        // Add filters if they are provided
        if (subAccount) params.sub_account_id = subAccount;
        if (saleId) params.sale_id = saleId;
        if (date) params.date = date; // date format: mm/dd/yyyy
        
        axios.get('http://localhost:5000/api/sales', { params })
            .then(response => {
                setSalesData(response.data);
            })
            .catch(error => {
                console.error('Error fetching sales data:', error);
            });
    };

    // Handle form submission (filtering)
    const handleSearch = (e) => {
        e.preventDefault();
        fetchSalesData(); // Fetch data when the search is triggered
    };

    // Handle Edit
    const handleEdit = (sale) => {
        setOrderData({
            date: sale.order_date,
            reference: sale.reference,
            account: sale.sub_account_id,
            remarks: sale.remarks
        });
    
        setSalesItems(sale.sales_items.map(item => ({
            product: item.product_id,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
        })));
    
        setTaxAccount({ account: sale.tax_account_id, percent: sale.tax_percent, amount: sale.tax_amount });
        setDiscountAccount({ account: sale.discount_account_id, percent: sale.discount_percent, amount: sale.discount_amount });
        setTotalAmount(sale.total_amount);
    };

    // Handle Edit Submit
    const handleSubmitEdit = () => {
        const saleData = {
            order_date: orderData.date,
            reference: orderData.reference,
            sub_account_id: orderData.account,
            total_amount: totalAmount,
            sales_items: salesItems,
            receipt_rows: [], // Assuming no receipts in edit; if needed, handle accordingly
            tax_account: taxAccount,
            discount_account: discountAccount,
            remarks: orderData.remarks || ''
        };
    
        axios.put(`http://localhost:5000/api/sales/${saleData.sale_id}`, saleData)
            .then(response => {
                console.log('Sale updated:', response);
                alert('Sale updated successfully!');
                fetchSalesData(); // Refresh the sales list after editing
            })
            .catch(error => {
                console.error('Error updating sale:', error);
                alert('There was an error updating the sale.');
            });
    };

    // Handle Delete
    const handleDelete = (sale_id) => {
        axios.delete(`http://localhost:5000/api/sales/${sale_id}`)
            .then(response => {
                console.log('Sale deleted:', response);
                alert('Sale deleted successfully!');
                fetchSalesData(); // Refresh the sales list after deletion
            })
            .catch(error => {
                console.error('Error deleting sale:', error);
                alert('There was an error deleting the sale.');
            });
    };

    // Handle Print
    const handlePrint = (sale) => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Sale Invoice</title></head><body>');
        printWindow.document.write(`<h1>Sale Invoice #${sale.sale_id}</h1>`);
        printWindow.document.write(`<p>Date: ${sale.order_date}</p>`);
        printWindow.document.write(`<p>Customer: ${sale.customer_name}</p>`);
        printWindow.document.write(`<p>Amount: ${sale.total_amount}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="container mt-4">
            <h2>List Sales</h2>

            {/* Search Filters */}
            <form onSubmit={handleSearch} className="mb-4">
                <div className="row">
                    {/* Sub Account Filter */}
                    <div className="col-md-3">
                        <label htmlFor="subAccount">Search by Sub Account</label>
                        <select
                            id="subAccount"
                            className="form-control"
                            value={subAccount}
                            onChange={(e) => setSubAccount(e.target.value)}
                        >
                            <option value="">Select Sub Account</option>
                            {allSubAccounts.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sale ID Filter */}
                    <div className="col-md-3">
                        <label htmlFor="saleId">Search by Sale ID</label>
                        <input
                            type="text"
                            className="form-control"
                            id="saleId"
                            value={saleId}
                            onChange={(e) => setSaleId(e.target.value)}
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="col-md-3">
                        <label htmlFor="date">Search by Date</label>
                        <input
                            type="date"
                            className="form-control"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <button type="submit" className="btn btn-primary mt-4">Search</button>
                    </div>
                </div>
            </form>

            {/* Sales Data Table */}
            <table className="table table-bordered mt-3">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {salesData.map((sale) => (
                        <tr key={sale.sale_id}>
                            <td>{sale.order_date}</td>
                            <td>{sale.sale_id}</td>
                            <td>{sale.customer_name}</td> {/* Display Customer Name from Subaccount */}
                            <td>{sale.quantity}</td>
                            <td>{sale.amount}</td>
                            <td>
                                {/* Actions (Edit, Delete, Print) */}
                               
                                <button className="btn btn-danger btn-sm mx-1" onClick={() => handleDelete(sale.sale_id)}>Delete</button>
                                <button className="btn btn-secondary btn-sm mx-1" onClick={() => handlePrint(sale)}>Print</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListSales;
