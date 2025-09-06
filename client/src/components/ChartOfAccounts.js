import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChartOfAccounts.css'; 





const ChartOfAccounts = () => {
   

    const [chartData, setChartData] = useState([]);
    const [groups, setGroups] = useState([]);
    const [heads, setHeads] = useState([]);
    const [subAccounts, setSubAccounts] = useState([]);
    const [newGroup, setNewGroup] = useState("");
    const [newHead, setNewHead] = useState("");
    const [newSubAccount, setNewSubAccount] = useState("");
    const [selectedChart, setSelectedChart] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedHead, setSelectedHead] = useState("");

    // Fetch charts on load
    useEffect(() => {
        axios.get("http://localhost:5000/charts")
            .then(response => {
                setChartData(response.data);
                if (response.data.length > 0) {
                    setSelectedChart(response.data[0]?.id);  // Select the first chart by default
                }
            })
            .catch(error => console.log(error));
    }, []);

    // Fetch groups when chart is selected
    useEffect(() => {
        if (selectedChart) {
            axios.get(`http://localhost:5000/groups/${selectedChart}`)
                .then(response => {
                    setGroups(response.data);
                    setHeads([]); // Reset heads when the chart changes
                    setSubAccounts([]); // Reset sub-accounts when the chart changes
                    if (response.data.length > 0) {
                        setSelectedGroup(response.data[0]?.id);  // Select the first group by default
                    }
                })
                .catch(error => console.log(error));
        }
    }, [selectedChart]);

    // Fetch heads when group is selected
    useEffect(() => {
        if (selectedGroup) {
            console.log("Fetching heads for group:", selectedGroup); // Debugging
            axios.get(`http://localhost:5000/heads/group/${selectedGroup}`) // ✅ Correct API call
                .then(response => {
                    console.log("Fetched heads:", response.data); // Debugging
                    setHeads(response.data);
                    setSubAccounts([]); // Reset sub-accounts when group changes
                    if (response.data.length > 0) {
                        setSelectedHead(response.data[0]?.id);
                    }
                })
                .catch(error => console.log("Error fetching heads:", error));
        }
    }, [selectedGroup]);
    

    // Fetch sub-accounts when head is selected
    useEffect(() => {
        if (selectedHead) {
            axios.get(`http://localhost:5000/subaccounts/${selectedHead}`)
                .then(response => {
                    setSubAccounts(response.data);
                })
                .catch(error => console.log(error));
        }
    }, [selectedHead]);

    // Handle adding a new group
    const handleAddGroup = () => {
        axios.post("http://localhost:5000/groups", { chart_id: selectedChart, name: newGroup })
            .then(response => {
                setGroups([...groups, response.data]);
                setNewGroup(""); // Clear input field
            })
            .catch(error => console.log(error));
    };

    // Handle adding a new head
    const handleAddHead = () => {
        if (!selectedGroup || !newHead) {
            alert("Both group ID and head name are required!");
            return;
        }

        axios.post("http://localhost:5000/heads", { group_id: selectedGroup, name: newHead })
            .then(response => {
                setHeads([...heads, response.data]); // Update heads state with new data
                setNewHead("");  // Reset the input field
            })
            .catch(error => console.log(error));
    };

    // Handle adding a new sub-account
    const handleAddSubAccount = () => {
        if (!selectedHead || !newSubAccount) {
            alert("Head ID and Sub-Account code are required!");
            return;
        }
    
        const subAccountData = {
            head_id: selectedHead,
            code: newSubAccount, // Assuming the sub-account code is provided
            title: newSubAccount // You can modify this if you want the title to be different
        };
    
        console.log('Adding sub-account:', subAccountData); // Log the data to debug
    
        axios.post("http://localhost:5000/subaccounts", subAccountData)
            .then(response => {
                setSubAccounts([...subAccounts, response.data]);
                setNewSubAccount(""); // Clear input field
            })
            .catch(error => {
                console.log("Error adding sub-account:", error.response ? error.response.data : error);
            });
    };

   
    
    
    
    // Handle editing a group
    const handleEditGroup = (groupId, newName) => {
        axios.put(`http://localhost:5000/groups/${groupId}`, { name: newName })
            .then(response => {
                setGroups(groups.map(group => group.id === groupId ? { ...group, name: newName } : group));
            })
            .catch(error => console.log(error));
    };

    // Handle deleting a group
    const handleDeleteGroup = (groupId) => {
        axios.delete(`http://localhost:5000/groups/${groupId}`)
            .then(response => {
                setGroups(groups.filter(group => group.id !== groupId));
            })
            .catch(error => console.log(error));
    };

    // Handle editing a head
    const handleEditHead = (headId, newName) => {
        axios.put(`http://localhost:5000/heads/${headId}`, { name: newName })
            .then(response => {
                setHeads(heads.map(head => head.id === headId ? { ...head, name: newName } : head));
            })
            .catch(error => console.log(error));
    };

    // Handle deleting a head
    const handleDeleteHead = (headId) => {
        axios.delete(`http://localhost:5000/heads/${headId}`)
            .then(response => {
                setHeads(heads.filter(head => head.id !== headId));
            })
            .catch(error => console.log(error));
    };

    // Handle editing a sub-account
    const handleEditSubAccount = (subAccountId, newCode, newTitle) => {
        axios.put(`http://localhost:5000/subaccounts/${subAccountId}`, { code: newCode, title: newTitle })
            .then(response => {
                setSubAccounts(subAccounts.map(account => account.id === subAccountId ? { ...account, code: newCode, title: newTitle } : account));
            })
            .catch(error => console.log(error));
    };

    // Handle deleting a sub-account
    const handleDeleteSubAccount = (subAccountId) => {
        axios.delete(`http://localhost:5000/subaccounts/${subAccountId}`)
            .then(response => {
                setSubAccounts(subAccounts.filter(account => account.id !== subAccountId));
            })
            .catch(error => console.log(error));
    };

     
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Chart of Accounts</h2>

            {/* Chart Selector */}
<div className="row mb-3">
    <div className="col-md-6">
        <label htmlFor="chartSelector">Select Chart</label>
        <select
            id="chartSelector"
            className="form-control"
            onChange={(e) => setSelectedChart(e.target.value)}
            value={selectedChart || ""}
        >
            <option value="">Select Chart</option>
            {chartData.length > 0 ? (
                chartData.map((chart) => (
                    <option key={chart.id} value={chart.id}>
                        {chart.name}
                    </option>
                ))
            ) : (
                <option>No charts available</option>
            )}
        </select>
    </div>
</div>

            
            {/* Add Group */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="newGroup">Add New Group</label>
                    <input
                        id="newGroup"
                        type="text"
                        className="form-control"
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        placeholder="Enter new group"
                    />
                    <button className="btn btn-primary mt-2" onClick={handleAddGroup}>
                        Add Group
                    </button>
                </div>
            </div>

            {/* Select Group */}
            {selectedChart && (
    <div className="row mb-3">
        <div className="col-md-6">
            <label htmlFor="groupSelector">Select Group</label>
            <select
                id="groupSelector"
                className="form-control"
                onChange={(e) => setSelectedGroup(e.target.value)}
                value={selectedGroup || ""}
            >
                <option value="">Select Group</option>
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))
                ) : (
                    <option>No groups available</option>
                )}
            </select>
        </div>
    </div>
)}


            {/* Display Groups with Edit and Delete */}
            {groups.length > 0 && (
                <div>
                    <h5>Groups</h5>
                    {groups.map((group) => (
                        <div key={group.id} className="d-flex justify-content-between">
                            <p>{group.name}</p>
                            <div>
                                <button className="btn btn-warning btn-sm" onClick={() => handleEditGroup(group.id, "New Group Name")}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteGroup(group.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Head */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="newHead">Add New Head</label>
                    <input
                        id="newHead"
                        type="text"
                        className="form-control"
                        value={newHead}
                        onChange={(e) => setNewHead(e.target.value)}
                        placeholder="Enter new head"
                    />
                    <button className="btn btn-primary mt-2" onClick={handleAddHead}>
                        Add Head
                    </button>
                </div>
            </div>

            {/* Select Head */}
            {selectedGroup && (
    <div className="row mb-3">
        <div className="col-md-6">
            <label htmlFor="headSelector">Select Head</label>
            <select
                id="headSelector"
                className="form-control"
                onChange={(e) => setSelectedHead(e.target.value)}
                value={selectedHead || ""}
            >
                <option value="">Select Head</option>
                {heads.length > 0 ? (
                    heads.map((head) => (
                        <option key={head.id} value={head.id}>
                            {head.name}
                        </option>
                    ))
                ) : (
                    <option>No heads available</option>
                )}
            </select>
        </div>
    </div>
)}


            {/* Display Heads with Edit and Delete */}
            {heads.length > 0 && (
                <div>
                    <h5>Heads</h5>
                    {heads.map((head) => (
                        <div key={head.id} className="d-flex justify-content-between">
                            <p>{head.name}</p>
                            <div>
                                <button className="btn btn-warning btn-sm" onClick={() => handleEditHead(head.id, "New Head Name")}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteHead(head.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Sub-Account */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="newSubAccount">Add New Sub-Account</label>
                    <input
                        id="newSubAccount"
                        type="text"
                        className="form-control"
                        value={newSubAccount}
                        onChange={(e) => setNewSubAccount(e.target.value)}
                        placeholder="Enter new sub-account"
                    />
                    <button className="btn btn-primary mt-2" onClick={handleAddSubAccount}>
                        Add Sub-Account
                    </button>
                </div>
            </div>

            {/* Display Sub-Accounts with Edit and Delete */}
            {subAccounts.length > 0 && (
                <div>
                    <h5>Sub-Accounts</h5>
                    {subAccounts.map((account) => (
                        <div key={account.id} className="d-flex justify-content-between">
                            <p> - {account.title}</p>
                            <div>
                                <button className="btn btn-warning btn-sm" onClick={() => handleEditSubAccount(account.id, "NewCode", "NewTitle")}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSubAccount(account.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChartOfAccounts;
