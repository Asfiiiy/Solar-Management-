import React, { useState, useEffect } from 'react';
import { FaBox, FaChartBar, FaShoppingCart, FaCog } from 'react-icons/fa';  // Sidebar icons
import './inventory.css';  // Import the same CSS for consistent styling

const Purchases = () => {
  const [purchaseData, setPurchaseData] = useState([]);

  // Mock purchase data (replace with real data from your backend)
  useEffect(() => {
    const fetchedPurchaseData = [
      { id: 1, product: 'Solar Panel', quantity: 100, unitCost: 150, totalCost: 15000, status: 'Delivered' },
      { id: 2, product: 'Solar Battery', quantity: 50, unitCost: 200, totalCost: 10000, status: 'Pending' },
      { id: 3, product: 'Inverter', quantity: 30, unitCost: 300, totalCost: 9000, status: 'Shipped' },
    ];
    setPurchaseData(fetchedPurchaseData);
  }, []);

  return (
    <div className="purchases-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Purchases </h2>
        <ul>
          <li><a href="/stock"><FaBox /> Stock</a></li>
          <li><a href="/sales"><FaChartBar /> Sales</a></li>
          <li><a href="/purchases"><FaShoppingCart /> Purchases</a></li>
          <li><a href="/purchase_returns">Purchase Returns</a></li>
          <li><a href="/main_ledger">Main Ledger</a></li>
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

        {/* Purchase History */}
        <div className="card">
          <h3>Purchase History</h3>
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseData.map(item => (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unitCost}</td>
                  <td>${item.totalCost.toLocaleString()}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Purchases by Status */}
        <div className="card">
          <h3>Purchases by Status</h3>
          <div className="status-summary">
            <div className="status-item">
              <p>Delivered</p>
              <h4>{purchaseData.filter(item => item.status === 'Delivered').length}</h4>
            </div>
            <div className="status-item">
              <p>Pending</p>
              <h4>{purchaseData.filter(item => item.status === 'Pending').length}</h4>
            </div>
            <div className="status-item">
              <p>Shipped</p>
              <h4>{purchaseData.filter(item => item.status === 'Shipped').length}</h4>
            </div>
          </div>
        </div>

        {/* Add Purchase Button */}
        <button className="add-purchase-btn">Add Purchase</button>
      </div>
    </div>
  );
};

export default Purchases;
