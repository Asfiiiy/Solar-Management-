import React, { useState, useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import './product.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    item_title: '',
    quantity: '',
    category_id: '',
    purchase_rate: '',
    sale_rate: ''
  });
  const [newCategory, setNewCategory] = useState({ category_title: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products and categories on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.log(error));

    axios.get('http://localhost:5000/api/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.log(error));
  }, []);

  // Handle adding a new product
  const handleAddProduct = () => {
    const { item_title, quantity, category_id, purchase_rate, sale_rate } = newProduct;

    // Log to check if all fields are properly set
    console.log(newProduct);

    // Check if any required fields are missing
    if (!item_title || !quantity || !category_id || !purchase_rate || !sale_rate) {
        alert('All fields are required');
        return;
    }

    axios.post('http://localhost:5000/api/products', newProduct)
      .then(response => {
        setProducts([...products, response.data]);
        setNewProduct({ item_title: '', quantity: '', category_id: '', purchase_rate: '', sale_rate: '' });
      })
      .catch(error => {
        console.error("Error in POST request:", error.response ? error.response.data : error.message);
      });
};


  // Handle adding a new category
  const handleAddCategory = () => {
    const { category_title } = newCategory;

    if (!category_title) {
      alert('Category title is required');
      return;
    }

    axios.post('http://localhost:5000/api/categories', newCategory)
      .then(response => {
        setCategories([...categories, response.data]);
        setNewCategory({ category_title: '' });
      })
      .catch(error => console.log(error));
  };

  // Filter products based on the search query
  const filteredProducts = products.filter(product =>
    product.item_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid mt-3">
      <h2>Manage Products</h2>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link className="nav-link active" to="/manage_products/products">Products</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/manage_products/categories">Product Categories</Link>
        </li>
      </ul>

      <Routes>
        {/* Products Section */}
        <Route path="products" element={
          <div>
            <h4>Add New Product</h4>
            <div className="form-row">
            
            <div className="form-group">
              <label>Item Title</label>
              <input
                type="text"
                className="form-control"
                value={newProduct.item_title}
                onChange={(e) => setNewProduct({ ...newProduct, item_title: e.target.value })}
                placeholder="Enter item title"
              />
            </div>

            <div className="form-group">
                    <label>Quantity</label>
                    <input
                        type="number"
                        className="form-control"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        placeholder="Enter quantity"
                    />
                </div>

            <div className="form-group">
            <label>Category</label>
              <select
                className="form-control"
                  value={newProduct.category_id}  // This should bind to category_id
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.category_title}</option>
                ))}
              </select>



            </div>

            <div className="form-group">
              <label>Purchase Rate</label>
              <input
                type="number"
                className="form-control"
                value={newProduct.purchase_rate}
                onChange={(e) => setNewProduct({ ...newProduct, purchase_rate: e.target.value })}
                placeholder="Enter purchase rate"
              />
            </div>

            <div className="form rate">
              <label>Sale Rate</label>
              <input
                type="number"
                className=""
                value={newProduct.sale_rate}
                onChange={(e) => setNewProduct({ ...newProduct, sale_rate: e.target.value })}
                placeholder="Enter sale rate"
              />
            </div>

            <button className="btn btn-primary" onClick={handleAddProduct}>Submit</button>
           
            </div>
            {/* Product Search */}
            {/* Product Search */}
<div className="mt-4 search">
  <input  
    type="text"
    className="form-control"
    placeholder="Enter keyword to search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

{/* New Line */}
<br />

{/* Display Product List */}
<h3 className="mt-3">Product List</h3>

{/* New Line */}
<br />

<table className="table">
  <thead>
    <tr>
      <th>Item Code</th>
      <th>Item Title</th>
      <th>Quantity</th>
      <th>Category</th>
      <th>Purchase Rate</th>
      <th>Sale Rate</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {filteredProducts.map(product => (
      <tr key={product.id}>
        <td>{product.id}</td>
        <td>{product.item_title}</td>
        <td>{product.quantity}</td>
        <td>{product.category}</td>
        <td>{product.purchase_rate}</td>
        <td>{product.sale_rate}</td>
        <td>
          <button className="btn btn-danger btn-sm">Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

          </div>
        } />

        {/* Product Categories Section */}
        <Route path="categories" element={
          <div>
            <h4>Add New Category</h4>
            <div className="form-row">
            <div className="form-group">
              <label>Category Title</label>
              <input
                type="text"
                className="form-control"
                value={newCategory.category_title}
                onChange={(e) => setNewCategory({ ...newCategory, category_title: e.target.value })}
                placeholder="Enter category title"
              />
            </div>
            <button className="btn btn-primary" onClick={handleAddCategory}>Submit</button>

            {/* Display Categories List */}
            <h3 className="mt-4">Category List</h3>
            <ul>
              {categories.map(category => (
                <li key={category.id}>{category.category_title}</li>
              ))}
            </ul>
          </div> </div>
        } /> 
      </Routes> 
    </div> 
  );
}; 

export default ManageProducts;
