import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoucherForm = ({ paymentType }) => {
    const [formData, setFormData] = useState({
        date: '',
        chart: '',
        subaccount: '',
        reference: '',
        narration: '',
        remarks: '',
        amount: ''
    });

    const [rows, setRows] = useState([
        { code: '', account: '', remarks: '', amount: '', subaccountId: '' }
    ]);
    const [subaccounts, setSubaccounts] = useState([]);
    const [charts, setCharts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [subaccounts2, setSubaccounts2] = useState([]);

    // Fetch charts for the dropdown
    useEffect(() => {
        axios.get('http://localhost:5000/api/charts')
            .then(response => setCharts(response.data))
            .catch(error => console.error("Error fetching charts:", error));
    }, []);

    // Fetch subaccounts based on selected chart
    useEffect(() => {
        if (formData.chart) {
            axios.get(`http://localhost:5000/api/subaccounts/chart/${formData.chart}`)
                .then(response => setSubaccounts(response.data))
                .catch(error => console.error("Error fetching subaccounts:", error));
        }
    }, [formData.chart]);

    // Fetch independent subaccounts for the rows
    useEffect(() => {
        axios.get('http://localhost:5000/api/subaccounts')
            .then(response => setSubaccounts2(response.data))
            .catch(error => console.error("Error fetching independent subaccounts:", error));
    }, []);

    // Handle changes in form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle changes in rows (for the table)
    const handleRowChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
        calculateTotal(updatedRows);
    };

    // Add a new row to the table
    const addRow = () => {
        setRows([...rows, { code: '', account: '', remarks: '', amount: '', subaccountId: '' }]);
    };

    // Calculate the total amount (sum of all amounts in rows)
    const calculateTotal = (updatedRows) => {
        const total = updatedRows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
        setTotalAmount(total);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const formDataToSubmit = {
            paymentType, // This will be 'sale' or 'purchase' depending on active tab
            formData,
            rows,
            totalAmount
        };

        console.log("Form Data to Submit:", formDataToSubmit);

        axios.post('http://localhost:5000/vouchers/payment', formDataToSubmit)
            .then(response => {
                console.log("Voucher submitted successfully!");
                setRows([{ code: '', account: '', remarks: '', amount: '', subaccountId: '' }]);
                setTotalAmount(0);
                setFormData({
                    date: '',
                    chart: '',
                    subaccount: '',
                    reference: '',
                    narration: '',
                    remarks: '',
                    amount: ''
                });
            })
            .catch(error => {
                console.error("Error submitting voucher:", error.response ? error.response.data : error);
            });
    };

    return (
        <div>
            <h4>{paymentType} Voucher</h4>
            <form onSubmit={handleSubmit}>
                {/* Main Form Section */}
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Chart</label>
                    <select
                        className="form-control"
                        name="chart"
                        value={formData.chart}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Chart</option>
                        {charts.map((chart) => (
                            <option key={chart.id} value={chart.id}>
                                {chart.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Subaccount</label>
                    <select
                        className="form-control"
                        name="subaccount"
                        value={formData.subaccount}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Subaccount</option>
                        {subaccounts.map((subaccount) => (
                            <option key={subaccount.id} value={subaccount.id}>
                                {subaccount.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Reference</label>
                    <input
                        type="text"
                        className="form-control"
                        name="reference"
                        value={formData.reference}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Narration</label>
                    <input
                        type="text"
                        className="form-control"
                        name="narration"
                        value={formData.narration}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Remarks</label>
                    <input
                        type="text"
                        className="form-control"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                    />
                </div>

                {/* Table Section */}
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Account</th>
                            <th>Remarks</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td><input type="text" className="form-control" value={row.code} readOnly /></td>
                                <td>
                                    {/* Subaccount for row */}
                                    <select
                                        className="form-control"
                                        name="subaccountId"
                                        value={row.subaccountId}
                                        onChange={(e) => handleRowChange(index, 'subaccountId', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Subaccount</option>
                                        {subaccounts2.map((subaccount) => (
                                            <option key={subaccount.id} value={subaccount.id}>
                                                {subaccount.title}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={row.remarks}
                                        onChange={(e) => handleRowChange(index, 'remarks', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={row.amount}
                                        onChange={(e) => handleRowChange(index, 'amount', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button type="button" className="btn btn-secondary" onClick={addRow}>Add Row</button>

                <div className="mt-3">
                    <strong>Total Amount: </strong>{totalAmount.toFixed(2)}
                </div>

                <button type="submit" className="btn btn-success mt-3">Submit Voucher</button>
            </form>
        </div>
    );
};

export default VoucherForm;
