import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MonthlySubscription = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const [charts, setCharts] = useState([]);
    const [headsFrom, setHeadsFrom] = useState([]);
    const [headsTo, setHeadsTo] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [newSubscription, setNewSubscription] = useState({
        date: '',
        chart_from: '',
        from_account: '',
        chart_to: '',
        to_account: '',
        reference: '',
        amount: ''
    });

   // Fetch charts on load
   useEffect(() => {
    axios.get('http://localhost:5000/charts')
        .then(response => setCharts(response.data))
        .catch(error => console.log("Error fetching charts:", error));
}, []);

// Fetch heads when 'From Chart' is selected
useEffect(() => {
    if (newSubscription.chart_from) {
        axios.get(`http://localhost:5000/heads/${newSubscription.chart_from}`)
            .then(response => setHeadsFrom(response.data))
            .catch(error => {
                console.log("Error fetching heads:", error);
                setHeadsFrom([]);
            });
    }
}, [newSubscription.chart_from]);

// Fetch heads when 'To Chart' is selected
useEffect(() => {
    if (newSubscription.chart_to) {
        axios.get(`http://localhost:5000/heads/${newSubscription.chart_to}`)
            .then(response => setHeadsTo(response.data))
            .catch(error => {
                console.log("Error fetching heads:", error);
                setHeadsTo([]);
            });
    }
}, [newSubscription.chart_to]);

    // Handle adding a new subscription
    // Handle adding a new subscription
const handleAddSubscription = () => {
    const { date, chart_from, from_account, chart_to, to_account, reference, amount } = newSubscription;

    if (!date || !chart_from || !from_account || !chart_to || !to_account || !reference || !amount) {
        alert('All fields are required');
        return;
    }

    axios.post('http://localhost:5000/monthly_subscriptions', newSubscription)
        .then(response => {
            console.log("Subscription added:", response.data); // Debugging output
            setSubscriptions(prevSubscriptions => [...prevSubscriptions, response.data]);
            setNewSubscription({
                date: '',
                chart_from: '',
                from_account: '',
                chart_to: '',
                to_account: '',
                reference: '',
                amount: ''
            });
        })
        .catch(error => {
            console.error("Error adding subscription:", error);
            alert("Failed to add subscription. Check console for details.");
        });
};

// Handle delete subscription
const handleDeleteSubscription = (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription?")) return;

    axios.delete(`http://localhost:5000/monthly_subscriptions/${id}`)
        .then(() => {
            setSubscriptions(subscriptions.filter(sub => sub.id !== id));
        })
        .catch(error => {
            console.error("Error deleting subscription:", error);
            alert("Failed to delete subscription. Check console for details.");
        });
};

// Handle edit subscription
const handleEditSubscription = (subscription) => {
    setNewSubscription({
        date: subscription.date,
        chart_from: subscription.chart_from,
        from_account: subscription.from_account,
        chart_to: subscription.chart_to,
        to_account: subscription.to_account,
        reference: subscription.reference,
        amount: subscription.amount
    });

    // Remove the old subscription from the list until updated
    setSubscriptions(subscriptions.filter(sub => sub.id !== subscription.id));
};

// Handle updating a subscription



    return (
        <div className="container mt-4">
            <h2>Monthly Subscription</h2>

            {/* Date and Chart Selection */}
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label>Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={newSubscription.date}
                        onChange={(e) => setNewSubscription({ ...newSubscription, date: e.target.value })}
                    />
                </div>

                <div className="form-group col-md-4">
                    <label>From Chart</label>
                    <select
                        className="form-control"
                        value={newSubscription.chart_from}
                        onChange={(e) => setNewSubscription({ ...newSubscription, chart_from: e.target.value })}
                    >
                        <option value="">Select Chart</option>
                        {charts.map(chart => (
                            <option key={chart.id} value={chart.id}>{chart.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-md-4">
                    <label>From Account</label>
                    <select
                        className="form-control"
                        value={newSubscription.from_account}
                        onChange={(e) => setNewSubscription({ ...newSubscription, from_account: e.target.value })}
                    >
                        <option value="">Select Account</option>
                        {headsFrom.map(head => (
                            <option key={head.id} value={head.id}>{head.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* To Account Chart Selection */}
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label>To Chart</label>
                    <select
                        className="form-control"
                        value={newSubscription.chart_to}
                        onChange={(e) => setNewSubscription({ ...newSubscription, chart_to: e.target.value })}
                    >
                        <option value="">Select Chart</option>
                        {charts.map(chart => (
                            <option key={chart.id} value={chart.id}>{chart.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-md-4">
                    <label>To Account</label>
                    <select
                        className="form-control"
                        value={newSubscription.to_account}
                        onChange={(e) => setNewSubscription({ ...newSubscription, to_account: e.target.value })}
                    >
                        <option value="">Select Account</option>
                        {headsTo.map(head => (
                            <option key={head.id} value={head.id}>{head.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reference and Amount */}
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label>Reference</label>
                    <input
                        type="text"
                        className="form-control"
                        value={newSubscription.reference}
                        onChange={(e) => setNewSubscription({ ...newSubscription, reference: e.target.value })}
                    />
                </div>

                <div className="form-group col-md-4">
                    <label>Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        value={newSubscription.amount}
                        onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
                    />
                </div>
            </div>

            <button className="btn btn-primary" onClick={handleAddSubscription}>Submit</button>

            {/* Search */}
            

            {/* Display Subscriptions List */}
            <h3 className="mt-4">Subscription List</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Account From</th>
                        <th>Account To</th>
                        <th>Reference</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.filter(sub => sub.reference.toLowerCase().includes(searchQuery.toLowerCase())).map(sub => (
                        <tr key={sub.id}>
                            <td>{sub.date}</td>
                            <td>{sub.from_account}</td>
                            <td>{sub.to_account}</td>
                            <td>{sub.reference}</td>
                            <td>{sub.amount}</td>
                            <td>
                            <button className="btn btn-warning btn-sm" onClick={() => handleEditSubscription(sub)}> Edit</button>
   
  

                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSubscription(sub.id)}>Delete</button>


                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MonthlySubscription;
