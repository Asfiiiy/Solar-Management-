import React, { useState, useEffect } from 'react';
import { FaBox, FaChartBar, FaShoppingCart, FaCog } from 'react-icons/fa';
import './inventory.css';
import axios from 'axios';

const PurchaseLedger = () => {
  const [purchaseLedgerData, setPurchaseLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  // Fetching purchase ledger data from the backend
  useEffect(() => {
    const fetchPurchaseLedger = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/purchase-ledger');
        setPurchaseLedgerData(response.data);
      } catch (error) {
        setError('Failed to fetch data');
        console.error('Error fetching purchase ledger:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseLedger();
  }, []);

  // Calculate total value (memoized)
  const totalValue = purchaseLedgerData.reduce((total, item) => total + item.amount, 0).toLocaleString();

  return (
    <div className="purchase-ledger-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Purchase Ledger</h2>
        <ul>
          <li><a href="/stock"><FaBox /> Stock</a></li>
          <li><a href="/sales"><FaChartBar /> Sales</a></li>
          <li><a href="/purchases"><FaShoppingCart /> Purchases</a></li>
          <li><a href="/purchase_returns">Purchase Returns</a></li>
          <li><a href="/main_ledger">Main Ledger</a></li>
          <li><a href="/purchase_ledger">Purchases Ledger</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Purchase Ledger Overview */}
        <div className="card">
          <h3>Purchase Ledger Overview</h3>
          <div className="ledger-summary">
            <div className="ledger-item">
              <p>Total Entries</p>
              <h4>{purchaseLedgerData.length}</h4>
            </div>
            <div className="ledger-item">
              <p>Total Value</p>
              <h4>${totalValue}</h4>
            </div>
          </div>
        </div>

        {/* Loading and Error Handling */}
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {/* Purchase Ledger History */}
        <div className="card">
          <h3>Purchase Ledger History</h3>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Return Date</th>
                <th>Sub Account ID</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {purchaseLedgerData.length === 0 ? (
                <tr>
                  <td colSpan="8">No entries available</td>
                </tr>
              ) : (
                purchaseLedgerData.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.rate}</td>
                    <td>${item.amount ? item.amount.toLocaleString() : '0.00'}</td>
                    <td>{item.reason}</td>
                    <td>{item.return_date || 'N/A'}</td>
                    <td>{item.sub_account_id}</td>
                    <td>{item.remarks || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Purchase Button */}
        <button className="add-purchase-btn" onClick={() => { alert('Add Purchase clicked'); }}>Add Purchase</button>
      </div>
    </div>
  );
};

export default PurchaseLedger;
