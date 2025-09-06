import React, { useState, useEffect } from 'react';
import { FaChartBar, FaBox, FaShoppingCart, FaCog } from 'react-icons/fa';  // Sidebar icons
import './Sales.css';  // Import the same CSS for consistent styling

const Sales = () => {
  const [salesData, setSalesData] = useState([]);

  // Mock sales data (you can replace this with real data)
  useEffect(() => {
    const fetchedSalesData = [
      { id: 1, product: 'Solar Panel', unitsSold: 150, revenue: 20000 },
      { id: 2, product: 'Solar Battery', unitsSold: 80, revenue: 16000 },
      { id: 3, product: 'Inverter', unitsSold: 60, revenue: 18000 },
    ];
    setSalesData(fetchedSalesData);
  }, []);

  return (
    <div className="sales-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Sales Dashboard</h2>
        <ul>
          <li><a href="stock"><FaBox /> Stock</a></li>
          <li><a href="sales"><FaChartBar /> Sales</a></li>
          <li><a href="/purchases"><FaShoppingCart /> Purchases</a></li>
          <li><a href="purchase returns">Purchase Returns</a></li>
          <li><a href="/purchase_ledger"> Purchases Ledger</a></li>
        </ul>
      </div>

      {/* Main Content (Right side) */}
      <div className="main-content">
        {/* Sales Overview */}
        <div className="card">
          <h3>Sales Overview</h3>
          <div className="sales-summary">
            <div className="sales-item">
              <p>Total Units Sold</p>
              <h4>{salesData.reduce((total, item) => total + item.unitsSold, 0)}</h4>
            </div>
            <div className="sales-item">
              <p>Total Revenue</p>
              <h4>${salesData.reduce((total, item) => total + item.revenue, 0).toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Sales by Product */}
        <div className="card">
          <h3>Sales by Product</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map(item => (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{item.unitsSold}</td>
                  <td>${item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sales Performance */}
        <div className="card">
          <h3>Sales Performance</h3>
          <div className="sales-bar-chart">
            {salesData.map(item => (
              <div key={item.id} className="bar">
                <div className="bar-fill" style={{ height: `${(item.revenue / 20000) * 100}%` }}></div>
                <span>{item.product}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="card">
          <h3>Sales by Category</h3>
          <div className="categories-list">
            <div className="category-item">Solar Panels</div>
            <div className="category-item">Batteries</div>
            <div className="category-item">Inverters</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
