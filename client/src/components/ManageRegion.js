import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageRegion = () => {
    const [areas, setAreas] = useState([]);
    const [newArea, setNewArea] = useState({
        area_code: '',
        area_title: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [editArea, setEditArea] = useState(null); // Track the area being edited

    // Fetch areas on load
    useEffect(() => {
        axios.get('http://localhost:5000/api/areas')
            .then(response => setAreas(response.data))
            .catch(error => console.log(error));
    }, []);

    // Handle adding a new area
    const handleAddArea = () => {
        if (!newArea.area_code || !newArea.area_title) {
            alert('Area code and area title are required');
            return;
        }

        axios.post('http://localhost:5000/api/areas', newArea)
            .then(response => {
                setAreas([...areas, response.data]);
                setNewArea({ area_code: '', area_title: '' });
            })
            .catch(error => console.log(error));
    };

    // Handle editing an area
    const handleEditArea = (area) => {
        setEditArea(area); // Set the area to be edited
        setNewArea({ area_code: area.area_code, area_title: area.area_title }); // Set the fields with the area data
    };

    // Handle updating an area
    const handleUpdateArea = () => {
        if (!newArea.area_code || !newArea.area_title) {
            alert('Area code and area title are required');
            return;
        }

        axios.put(`http://localhost:5000/api/areas/${editArea.id}`, newArea)
            .then(response => {
                // Update the areas state with the updated area
                setAreas(areas.map(area => area.id === editArea.id ? response.data : area));
                setNewArea({ area_code: '', area_title: '' }); // Clear the form
                setEditArea(null); // Clear the edit state
            })
            .catch(error => console.log(error));
    };

    // Handle deleting an area
    const handleDeleteArea = (id) => {
        axios.delete(`http://localhost:5000/api/areas/${id}`)
            .then(() => {
                // Remove the deleted area from the state
                setAreas(areas.filter(area => area.id !== id));
            })
            .catch(error => console.log(error));
    };

    // Filter areas based on the search query
    const filteredAreas = areas.filter(area =>
        area.area_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Manage Area/Region</h2>

            <div className="form-row">
                <div className="form-group">
                    <label>Area Code</label>
                    <input
                        type="text"
                        className="form-control"
                        value={newArea.area_code}
                        onChange={(e) => setNewArea({ ...newArea, area_code: e.target.value })}
                        placeholder="Enter area code"
                    />
                </div>

                <div className="form-group">
                    <label>Area Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={newArea.area_title}
                        onChange={(e) => setNewArea({ ...newArea, area_title: e.target.value })}
                        placeholder="Enter area title"
                    />
                </div>
            </div>

            {/* If we are editing an area, show the update button instead of adding */}
            {editArea ? (
                <button className="btn btn-primary" onClick={handleUpdateArea}>Update Area</button>
            ) : (
                <button className="btn btn-primary" onClick={handleAddArea}>Submit</button>
            )}

            <div className="mt-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter keyword to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Display Area List */}
            <h3 className="mt-4">Area List</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th>Area Code</th>
                        <th>Area Title</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAreas.map(area => (
                        <tr key={area.id}>
                            <td>{area.area_code}</td>
                            <td>{area.area_title}</td>
                            <td>
                                <button className="btn btn-warning btn-sm" onClick={() => handleEditArea(area)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteArea(area.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageRegion;
