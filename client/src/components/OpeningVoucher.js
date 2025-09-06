import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OpeningVoucher = () => {
    const [charts, setCharts] = useState([]);
    const [heads, setHeads] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [newVoucher, setNewVoucher] = useState({
        date: '',
        chart_id: '',
        head_id: '',
        payable: '',
        receivable: ''
    });

    // 📌 Fetch charts on load
    useEffect(() => {
        axios.get('http://localhost:5000/charts')
            .then(response => setCharts(response.data))
            .catch(error => console.error("Error fetching charts:", error));
    }, []);

    // 📌 Fetch heads when a chart is selected
    useEffect(() => {
        if (newVoucher.chart_id) {
            axios.get(`http://localhost:5000/heads/${newVoucher.chart_id}`)
                .then(response => setHeads(response.data))
                .catch(error => console.error("Error fetching heads:", error));
        }
    }, [newVoucher.chart_id]);

    // 📌 Fetch all opening vouchers
    useEffect(() => {
        axios.get('http://localhost:5000/opening_voucher')
            .then(response => setVouchers(response.data))
            .catch(error => console.error("Error fetching vouchers:", error));
    }, []);

    // 📌 Add new voucher
    const handleAddVoucher = () => {
        axios.post('http://localhost:5000/opening_voucher', newVoucher)
            .then(response => {
                setVouchers([...vouchers, response.data]);
                setNewVoucher({ date: '', chart_id: '', head_id: '', payable: '', receivable: '' });
            })
            .catch(error => console.error("Error adding voucher:", error));
    };

    // 📌 Delete voucher
    const handleDeleteVoucher = (id) => {
        axios.delete(`http://localhost:5000/opening_voucher/${id}`)
            .then(() => setVouchers(vouchers.filter(voucher => voucher.id !== id)))
            .catch(error => console.error("Error deleting voucher:", error));
    };

    // 📌 Calculate totals
    const totalPayables = vouchers.reduce((sum, v) => sum + Number(v.payable), 0);
    const totalReceivables = vouchers.reduce((sum, v) => sum + Number(v.receivable), 0);
    const difference = totalReceivables - totalPayables;

    return (
        <div className="container mt-4">
            <h2>Opening Voucher</h2>

            {/* Input Fields */}
            <div className="form-row">
                <div className="form-group col-md-3">
                    <label>Date</label>
                    <input type="date" className="form-control" value={newVoucher.date}
                        onChange={(e) => setNewVoucher({ ...newVoucher, date: e.target.value })} />
                </div>

                <div className="form-group col-md-3">
                    <label>Select Chart</label>
                    <select className="form-control" value={newVoucher.chart_id}
                        onChange={(e) => setNewVoucher({ ...newVoucher, chart_id: e.target.value })}>
                        <option value="">Select Chart</option>
                        {charts.map(chart => <option key={chart.id} value={chart.id}>{chart.name}</option>)}
                    </select>
                </div>

                <div className="form-group col-md-3">
                    <label>Select Account</label>
                    <select className="form-control" value={newVoucher.head_id}
                        onChange={(e) => setNewVoucher({ ...newVoucher, head_id: e.target.value })}>
                        <option value="">Select Account</option>
                        {heads.map(head => <option key={head.id} value={head.id}>{head.name}</option>)}
                    </select>
                </div>

                <div className="form-group col-md-3">
                    <label>Payable</label>
                    <input type="number" className="form-control" value={newVoucher.payable}
                        onChange={(e) => setNewVoucher({ ...newVoucher, payable: e.target.value })} />
                </div>

                <div className="form-group col-md-3">
                    <label>Receivable</label>
                    <input type="number" className="form-control" value={newVoucher.receivable}
                        onChange={(e) => setNewVoucher({ ...newVoucher, receivable: e.target.value })} />
                </div>
            </div>

            <button className="btn btn-primary mt-3" onClick={handleAddVoucher}>Submit</button>

            {/* Display Vouchers */}
            <h3 className="mt-4">Voucher List</h3>
            <table className="table">
                <thead>
                    <tr><th>Chart</th><th>Head</th><th>Payable</th><th>Receivable</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {vouchers.map(v => (
                        <tr key={v.id}>
                            <td>{v.chart_name}</td><td>{v.head_name}</td>
                            <td>{v.payable}</td><td>{v.receivable}</td>
                            <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteVoucher(v.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <h4>Total Payables: {totalPayables}</h4>
            <h4>Total Receivables: {totalReceivables}</h4>
            <h4>Difference: {difference}</h4>
        </div>
    );
};

export default OpeningVoucher;
