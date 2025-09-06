import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBox, FaChartBar, FaShoppingCart, FaCog } from 'react-icons/fa';  // Sidebar icons
import './inventory.css';  // Import the same CSS for consistent styling

const Ledger = () => {
  const [ledgerData, setLedgerData] = useState([]);

  // Fetch ledger data from the backend
  useEffect(() => {
    axios
      .get('http://localhost:5000/ledger')  // Adjust this URL to your backend API
      .then((response) => {
        setLedgerData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching ledger data:', error);
      });
  }, []);

  return (
    <div className="ledger-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Ledger</h2>
        <ul>
          <li><a href="/stock"><FaBox /> Stock</a></li>
          <li><a href="/sales"><FaChartBar /> Sales</a></li>
          <li><a href="/purchases"><FaShoppingCart /> Purchases</a></li>
          <li><a href="purchase-returns">Purchase Returns</a></li>
          <li><a href="/purchase_ledger"> Purchases Ledger</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Ledger Overview */}
        <div className="card">
          <h3>Ledger Overview</h3>
          <div className="ledger-summary">
            <div className="ledger-item">
              <p>Total Entries</p>
              <h4>{ledgerData.length}</h4>
            </div>
            <div className="ledger-item">
              <p>Total Debit</p>
              <h4>${ledgerData.reduce((total, entry) => total + entry.debit_amount, 0).toLocaleString()}</h4>
            </div>
            <div className="ledger-item">
              <p>Total Credit</p>
              <h4>${ledgerData.reduce((total, entry) => total + entry.credit_amount, 0).toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Ledger History */}
        <div className="card">
          <h3>Ledger History</h3>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subaccount</th>
                <th>Transaction Type</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
                <th>Description</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.transaction_date}</td>
                  <td>{entry.subaccount_id}</td>
                  <td>{entry.transaction_type}</td>
                  <td>${entry.debit_amount.toLocaleString()}</td>
                  <td>${entry.credit_amount.toLocaleString()}</td>
                  <td>${entry.balance.toLocaleString()}</td>
                  <td>{entry.description}</td>
                  <td>{entry.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Ledger Button (Optional) */}
      </div>
    </div>
  );
};

export default Ledger;
