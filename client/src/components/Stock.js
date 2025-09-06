import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBox, FaChartBar, FaShoppingCart, FaCog } from 'react-icons/fa';
import './Stock.css';

const Stock = () => {
  const [products, setProducts] = useState([]);

  // Fetch products and their stock (quantity) from the backend
  useEffect(() => {
    axios
    .get('http://localhost:5000/api/inventory')
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the products!', error);
      });
  }, []);

  // Calculate total purchase price for all products
  const totalPurchasePrice = products.reduce(
    (total, item) => total + item.purchase_rate * item.quantity,
    0
  );

  return (
    <div className="stock-page">
      <div className="sidebar">
        <h2>Stock Dashboard</h2>
        <ul>
        <li><a href="/stock"><FaBox /> Stock</a></li>
                  <li><a href="/sales"><FaChartBar /> Sales</a></li>
                  <li><a href="/purchases"><FaShoppingCart /> Purchases</a></li>
                  <li><a href="/purchase_returns">Purchase Returns</a></li>
                  <li><a href="/main_ledger">Main Ledger</a></li>
                  <li><a href="/purchase_ledger"> Purchases Ledger</a></li>
        </ul>
      </div>

      <div className="main-content">
        <div className="card">
          <h3>Stock Overview</h3>
          <div className="stock-summary">
            <div className="stock-item">
              <p>Total Products</p>
              <h4>{products.length}</h4>
            </div>
            <div className="stock-item">
              <p>Total Purchase</p>
              <h4>{totalPurchasePrice.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Stock by Product</h3>
          <div className="product-list">
            {products.map((product) => (
              <div className={`product-item ${product.quantity === 0 ? 'sold-out' : ''}`} key={product.id}>
                <div className="product-details">
                  <div><strong>Item Title:</strong> {product.item_title}</div>
                  <div><strong>Measuring Unit:</strong> {product.measuring_unit}</div>
                  <div><strong>Quantity:</strong> {product.quantity}</div>
                  <div><strong>Purchase Rate:</strong> {product.purchase_rate}</div>
                </div>
                {product.quantity === 0 && <div className="sold-out-label">Sold Out</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;
