import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SaleReturn = () => {
    const [saleId, setSaleId] = useState('');
    const [saleData, setSaleData] = useState([]);
    const [returnQuantity, setReturnQuantity] = useState('');
    const [returnAmount, setReturnAmount] = useState(0);

    // Handle sale ID search and fetch data
    const handleSearchSale = () => {
        axios.get(`http://localhost:5000/api/sales/${saleId}/return`)
            .then(response => {
                setSaleData(response.data);
            })
            .catch(error => {
                console.error('Error fetching sale data:', error);
                alert('Sale not found!');
            });
    };

    // Handle change in quantity
    const handleReturnQuantityChange = (index, quantity) => {
        const rate = saleData[index].rate;
        setReturnQuantity(quantity);
        setReturnAmount(quantity * rate);
    };

    // Submit sale return data
    const handleSubmitReturn = () => {
        const saleItems = saleData.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
        }));

        const returnData = {
            sale_id: saleId,
            sale_items: saleItems,
            return_quantity: returnQuantity,
            return_amount: returnAmount,
            remarks: 'Sale return processed' // Add any remarks you want to use
        };

        axios.post('http://localhost:5000/api/sales/return', returnData)
            .then(response => {
                alert('Sale return processed successfully');
            })
            .catch(error => {
                console.error('Error processing return:', error);
                alert('Error processing sale return');
            });
    };

    return (
        <div className="container mt-4">
            <h2>Sale Return</h2>

            {/* Sale ID Search */}
            <div className="form-group">
                <label htmlFor="saleId">Enter Sale ID</label>
                <input
                    type="text"
                    className="form-control"
                    value={saleId}
                    onChange={(e) => setSaleId(e.target.value)}
                />
                <button className="btn btn-primary mt-3" onClick={handleSearchSale}>Search Sale</button>
            </div>

            {/* Sale Items Data */}
            <table className="table table-bordered mt-3">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Return Quantity</th>
                        <th>Return Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {saleData.map((item, index) => (
                        <tr key={item.sale_item_id}>
                            <td>{item.product_id}</td>
                            <td>{item.quantity}</td>
                            <td>{item.rate}</td>
                            <td>
                                <input
                                    type="number"
                                    value={returnQuantity}
                                    onChange={(e) => handleReturnQuantityChange(index, e.target.value)}
                                />
                            </td>
                            <td>{returnAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Submit Button */}
            <button className="btn btn-success mt-3" onClick={handleSubmitReturn}>Submit Return</button>
        </div>
    );
};

export default SaleReturn;
