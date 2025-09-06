import React from 'react';

// Reusable InputField Component
const InputField = ({ label, value, onChange, type = 'text' }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                type={type}
                className="form-control"
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

// Reusable SelectField Component
const SelectField = ({ label, options, value, onChange }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <select className="form-control" value={value} onChange={onChange}>
                <option value="">Select {label}</option>
                {options && options.map(option => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

// Reusable ProductTable Component
const ProductTable = ({ products, onProductChange, onQuantityChange, onRateChange }) => {
    return (
        <table className="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {products && products.length > 0 ? (
                    products.map((product, index) => (
                        <tr key={index}>
                            <td>
                                <select
                                    className="form-control"
                                    value={product.product}
                                    onChange={(e) => onProductChange(index, e.target.value)}
                                >
                                    <option value="">Select Product</option>
                                    {product.items && Array.isArray(product.items) && product.items.length > 0 ? (
                                        product.items.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.item_title}
                                            </option>
                                        ))
                                    ) : (
                                        <option>No Products Available</option>
                                    )}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={product.quantity}
                                    onChange={(e) => onQuantityChange(index, e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={product.rate}
                                    onChange={(e) => onRateChange(index, e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={product.amount}
                                    disabled
                                />
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">No products available</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

// Reusable TaxDiscountTable Component
const TaxDiscountTable = ({ taxAccount, discountAccount, onTaxChange, onDiscountChange }) => {
    return (
        <table className="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>Tax Account</th>
                    <th>%</th>
                    <th>Amount</th>
                    <th>Discount Account</th>
                    <th>%</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <input
                            type="text"
                            className="form-control"
                            value={taxAccount.account}
                            onChange={(e) => onTaxChange('account', e.target.value)}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            className="form-control"
                            value={taxAccount.percent}
                            onChange={(e) => onTaxChange('percent', e.target.value)}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            className="form-control"
                            value={taxAccount.amount}
                            disabled
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            className="form-control"
                            value={discountAccount.account}
                            onChange={(e) => onDiscountChange('account', e.target.value)}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            className="form-control"
                            value={discountAccount.percent}
                            onChange={(e) => onDiscountChange('percent', e.target.value)}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            className="form-control"
                            value={discountAccount.amount}
                            disabled
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

// Reusable TotalAmount Component
const TotalAmount = ({ totalAmount }) => {
    return (
        <div>
            <h5>Total Amount: {totalAmount}</h5>
        </div>
    );
};

// Export all components from one file
export { InputField, SelectField, ProductTable, TaxDiscountTable, TotalAmount };
