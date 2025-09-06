import React, { useState, useEffect } from 'react';
import './man.css';
import axios from 'axios';
import ChartOfAccounts from './ChartOfAccounts';

const ManageAccount = () => {
    const [showChartOfAccounts, setShowChartOfAccounts] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [heads, setHeads] = useState([]);
    const [subAccounts, setSubAccounts] = useState([]);
    const [newAccount, setNewAccount] = useState({
        account_title: '',
        areaRegion: '',
        primaryContact: '',
        secondaryContact: '',
        email: '',
        contactPerson: '',
        address: '',
        dashboardStatus: '',
        groups: ''
    });

    const [selectedChart, setSelectedChart] = useState('');
    const [selectedHead, setSelectedHead] = useState('');

    // Fetch charts on load
    useEffect(() => {
        axios.get('http://localhost:5000/charts')
            .then(response => {
                setChartData(response.data);
                if (response.data.length > 0) {
                    setSelectedChart(response.data[0]?.id);
                }
            })
            .catch(error => console.log(error));
    }, []);

    // Fetch heads when a chart is selected
    useEffect(() => {
        if (selectedChart) {
            axios.get(`http://localhost:5000/heads/${selectedChart}`)
                .then(response => {
                    setHeads(response.data);
                })
                .catch(error => console.log(error));
        }
    }, [selectedChart]);

    // Fetch sub-accounts when a head is selected
    useEffect(() => {
        if (selectedHead) {
            axios.get(`http://localhost:5000/api/subaccounts/${selectedHead}`)
                .then(response => {
                    setSubAccounts(response.data);
                })
                .catch(error => console.log(error));
        }
    }, [selectedHead]);

    // Handle adding a new sub-account with all required fields
    const handleAddSubAccount = () => {
        if (!selectedHead || !newAccount.account_title) {
            alert("Head ID and Account Title are required!");
            return;
        }

        const accountData = {
            head_id: selectedHead,
            code: newAccount.account_title,  // Use the account title as 'code' for simplicity
            title: newAccount.account_title,  // Use the account title for 'title' as well
            area_region: newAccount.areaRegion,
            primary_contact: newAccount.primaryContact,
            secondary_contact: newAccount.secondaryContact,
            email: newAccount.email,
            contact_person: newAccount.contactPerson,
            address: newAccount.address,
            dashboard_status: newAccount.dashboardStatus,
            groups: newAccount.groups
        };

        axios.post("http://localhost:5000/api/subaccounts", accountData)
            .then(response => {
                setSubAccounts([...subAccounts, response.data]);
                setNewAccount({
                    account_title: '',
                    areaRegion: '',
                    primaryContact: '',
                    secondaryContact: '',
                    email: '',
                    contactPerson: '',
                    address: '',
                    dashboardStatus: '',
                    groups: ''
                });
            })
            .catch(error => {
                console.log("Error adding account:", error.response ? error.response.data : error);
            });
    };

    const handleShowChartOfAccounts = () => {
        window.open('/chart-of-accounts', '_blank');  // Opens the page in a new tab/window
    };

    return (
        <div className="manage-account-container-fluid">
            <h2 className="h2">Manage Account</h2>

            {/* Chart Selector */}
            <div className="form-row">
                <div className="form-group">
                    <label>Select Chart</label>
                    <select
                        className="custom-select"
                        value={selectedChart}
                        onChange={(e) => setSelectedChart(e.target.value)}
                    >
                        <option value="">Select Chart</option>
                        {chartData.length > 0 ? (
                            chartData.map(chart => (
                                <option key={chart.id} value={chart.id}>
                                    {chart.name}
                                </option>
                            ))
                        ) : (
                            <option>No charts available</option>
                        )}
                    </select>
                </div>

                {/* Head Selector */}
                <div className="form-group">
                    <label>Select Account</label>
                    <select
                        className="custom-select"
                        value={selectedHead}
                        onChange={(e) => setSelectedHead(e.target.value)}
                    >
                        <option value="">Select Account</option>
                        {heads.length > 0 ? (
                            heads.map(head => (
                                <option key={head.id} value={head.id}>{head.name}</option>
                            ))
                        ) : (
                            <option>No accounts available</option>
                        )}
                    </select>
                </div>
            

            {/* Account Title */}
            <div className="form-group">
                <p>Account Title</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Account Title"
                    value={newAccount.account_title}
                    onChange={(e) => setNewAccount({ ...newAccount, account_title: e.target.value })}
                />
            </div>

            {/* Optional Fields */}
            <div className="form-group">
                <p>Area/Region</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Area/Region"
                    value={newAccount.areaRegion}
                    onChange={(e) => setNewAccount({ ...newAccount, areaRegion: e.target.value })}
                />
            </div>

            <div className="form-group">
                <p>Primary Contact</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Primary Contact"
                    value={newAccount.primaryContact}
                    onChange={(e) => setNewAccount({ ...newAccount, primaryContact: e.target.value })}
                />
            </div>

            <div className="form-group">
                <p>Secondary Contact</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Secondary Contact"
                    value={newAccount.secondaryContact}
                    onChange={(e) => setNewAccount({ ...newAccount, secondaryContact: e.target.value })}
                />
            </div>

            <div className="form-group">
                <p>Email</p>
                <input
                    type="email"
                    className="custom-input"
                    placeholder="Email"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                />
            </div>

            <div className="form-group">
                <p>Contact Person</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Contact Person"
                    value={newAccount.contactPerson}
                    onChange={(e) => setNewAccount({ ...newAccount, contactPerson: e.target.value })}
                />
            </div>

            <div className="form-group">
                <p>Address</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Address"
                    value={newAccount.address}
                    onChange={(e) => setNewAccount({ ...newAccount, address: e.target.value })}
                />
            </div>

            <div className="form-group">
                <p>Dashboard Status</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Dashboard Status"
                    value={newAccount.dashboardStatus}
                    onChange={(e) => setNewAccount({ ...newAccount, dashboardStatus: e.target.value })}
                />
            </div>

            <div className="form-group">
                <p>Groups</p>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Groups"
                    value={newAccount.groups}
                    onChange={(e) => setNewAccount({ ...newAccount, groups: e.target.value })}
                />
            </div>

            {/* Submit Button */}
            <button className="custom-btn" onClick={handleAddSubAccount}>Submit</button>

            {/* Button to Show ChartOfAccounts */}
            <button onClick={handleShowChartOfAccounts} className="-btn ">
                Go to Chart of Accounts
            </button>

            {/* Display Sub-Accounts */}
            
        </div></div>
    );
};

export default ManageAccount;
