import React, { useState, useEffect } from 'react';
import { FaBox, FaChartBar, FaShoppingCart, FaCog } from 'react-icons/fa'; 
import axios from 'axios';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Fetch product data dynamically
  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products') // API to fetch products
      .then(response => {
        const fetchedProducts = response.data;
        setProducts(fetchedProducts);
        setLowStockItems(fetchedProducts.filter(product => product.quantity < 20)); // Update low stock items
      })
      .catch(error => console.error("Error fetching products:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="inventory-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Inventory</h2>
        <ul>
          <li><a href="/stock"><FaBox /> Stock</a></li>
                    <li><a href="/sales"><FaChartBar /> Sales</a></li>
                    <li><a href="/purchases"><FaShoppingCart /> Purchases</a></li>
                    <li><a href="/purchase_returns">Purchase Returns</a></li>
                    <li><a href="/main_ledger">Main Ledger</a></li>
                    <li><a href="/purchase_ledger"> Purchases Ledger</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Recent Activity Card */}
        <div className="card">
          <h3>Recent Activity</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <p>{products.length}</p>
              <span>New Items</span>
            </div>
            
          </div>
        </div>

        {/* Stock Numbers Card */}
      
      </div>
    </div>
  );
};

export default Inventory;
