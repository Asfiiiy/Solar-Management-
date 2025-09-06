import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageGroups = () => {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ group_title: '', contact_no: '' });

  useEffect(() => {
    // Fetch all groups when the page loads
    axios.get('http://localhost:5000/api/groups')
      .then(response => setGroups(response.data))
      .catch(error => console.log(error));
  }, []);

  const handleAddGroup = () => {
    const { group_title, contact_no } = newGroup;
    if (!group_title || !contact_no) {
      alert('Group title and contact number are required');
      return;
    }

    // Submit new group
    axios.post('http://localhost:5000/api/groups', newGroup)
      .then(response => {
        setGroups([...groups, response.data]);
        setNewGroup({ group_title: '', contact_no: '' });
      })
      .catch(error => console.log(error));
  };

  const handleDeleteGroup = (id) => {
    axios.delete(`http://localhost:5000/api/groups/${id}`)
      .then(() => {
        setGroups(groups.filter(group => group.id !== id));
      })
      .catch(error => console.log(error));
  };

  const handleEditGroup = (id, updatedGroup) => {
    axios.put(`http://localhost:5000/api/groups/${id}`, updatedGroup)
      .then(response => {
        const updatedGroups = groups.map(group => 
          group.id === id ? response.data : group
        );
        setGroups(updatedGroups);
      })
      .catch(error => console.log(error));
  };

  return (
    <div className="container mt-4">
      <h2>Groups Management</h2>

      {/* Create/Update Group Form */}
      <div>
        <h4>Create/Update Group</h4>
        <div className="form-group">
          <label>Group Title</label>
          <input
            type="text"
            className="form-control"
            value={newGroup.group_title}
            onChange={(e) => setNewGroup({ ...newGroup, group_title: e.target.value })}
            placeholder="Enter group title"
          />
        </div>
        <div className="form-group">
          <label>Contact No</label>
          <input
            type="text"
            className="form-control"
            value={newGroup.contact_no}
            onChange={(e) => setNewGroup({ ...newGroup, contact_no: e.target.value })}
            placeholder="Enter contact number"
          />
        </div>
        <button className="btn btn-primary" onClick={handleAddGroup}>Submit</button>
      </div>

      {/* Groups List */}
      <h3 className="mt-4">Groups List</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Group Title</th>
            <th>Group Contact</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id}>
              <td>{group.group_title}</td>
              <td>{group.contact_no}</td>
              <td>
                <button className="btn btn-warning btn-sm" onClick={() => handleEditGroup(group.id, { ...group, group_title: 'New Title' })}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteGroup(group.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageGroups;
