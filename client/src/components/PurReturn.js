import React, { useState, useEffect } from 'react';
import { FaBox, FaChartBar, FaShoppingCart, FaCog } from 'react-icons/fa';  // Sidebar icons
import './inventory.css';  // Import the same CSS for consistent styling
import axios from 'axios'; // To fetch data from the backend

const Purchases = () => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [purchaseReturnData, setPurchaseReturnData] = useState([]);  // State for purchase returns

  // Fetching purchases and purchase returns data
  useEffect(() => {
    // Fetching purchase data from the backend
    const fetchPurchases = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/purchases');
        setPurchaseData(response.data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };

    // Fetching purchase return data from the backend
    const fetchPurchaseReturns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/purchase-returns');
        setPurchaseReturnData(response.data);
      } catch (error) {
        console.error('Error fetching purchase returns:', error);
      }
    };

    fetchPurchases();
    fetchPurchaseReturns();
  }, []);

  return (
    <div className="purchases-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Purchases</h2>
        <ul>
          <li><a href="/stock"><FaBox /> Stock</a></li>
                    <li><a href="/sales"><FaChartBar /> Sales</a></li>
                    <li><a href="/purchases"><FaShoppingCart /> Purchases</a></li>
                    <li><a href="/purchase_returns">Purchase Returns</a></li>
                    <li><a href="/main_ledger">Main Ledger</a></li>
                    <li><a href="/purchase_ledger"> Purchases Ledger</a></li>
        </ul>
      </div>

      {/* Main Content (Right side) */}
      <div className="main-content">
        {/* Purchases Overview */}
        <div className="card">
          <h3>Purchases Overview</h3>
          <div className="purchases-summary">
            <div className="purchase-item">
              <p>Total Purchases</p>
              <h4>{purchaseData.length}</h4>
            </div>
            <div className="purchase-item">
              <p>Total Value</p>
              <h4>${purchaseData.reduce((total, item) => total + item.totalCost, 0).toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Purchase Return History */}
        <div className="card">
          <h3>Purchase Return History</h3>
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Return Date</th>
                <th>Sub Account ID</th>
              </tr>
            </thead>
            <tbody>
              {purchaseReturnData.map(item => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.rate}</td>
                  <td>${item.amount ? item.amount.toLocaleString() : '0.00'}</td> {/* Check for undefined */}
                  <td>{item.reason}</td>
                  <td>{item.return_date}</td>
                  <td>{item.sub_account_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Purchase Button */}
        <button className="add-purchase-btn">Add Purchase</button>
      </div>
    </div>
  );
};

export default Purchases;
