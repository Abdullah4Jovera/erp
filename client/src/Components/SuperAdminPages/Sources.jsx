import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Col, Container, Row } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';

const Sources = () => {
    const [sources, setSources] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newSource, setNewSource] = useState({ name: '', lead_type_id: {}, delstatus: false });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State to control create modal visibility
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // State to control update modal visibility
    const [selectedSource, setSelectedSource] = useState(null); // State for the source being updated

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = await axios.get(`/api/sources/get/get-sources`);
                setSources(response.data);
            } catch (err) {
                setError('Error fetching sources');
                console.error(err);
            }
        };

        const fetchLeadTypes = async () => {
            try {
                const response = await axios.get(`/api/leadtypes/get-all-leadtypes`);
                setLeadTypes(response.data);
            } catch (err) {
                setError('Error fetching lead types');
                console.error(err);
            }
        };

        fetchSources();
        fetchLeadTypes();
        setLoading(false); // Set loading to false after both fetches
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSource((prev) => ({ ...prev, [name]: value }));
    };

    const handleLeadTypeChange = (e) => {
        const selectedLeadType = leadTypes.find(leadType => leadType._id === e.target.value);
        setNewSource((prev) => ({ ...prev, lead_type_id: selectedLeadType }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/sources/create-source`, {
                ...newSource,
                lead_type_id: newSource.lead_type_id._id
            });
            setSources((prev) => [...prev, response.data]);
            setNewSource({ name: '', lead_type_id: {}, delstatus: false });
            setIsCreateModalOpen(false);
        } catch (err) {
            setError('Error creating source');
            console.error(err);
        }
    };

    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedSource((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateLeadTypeChange = (e) => {
        const selectedLeadType = leadTypes.find(leadType => leadType._id === e.target.value);
        setSelectedSource((prev) => ({ ...prev, lead_type_id: selectedLeadType }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/sources/update-source/${selectedSource._id}`, {
                ...selectedSource,
                lead_type_id: selectedSource.lead_type_id._id // Send only the _id of the updated lead type
            });
            setSources((prev) =>
                prev.map((source) => (source._id === response.data._id ? response.data : source))
            ); // Update sources with the updated source
            setSelectedSource(null); // Reset selected source
            setIsUpdateModalOpen(false); // Close modal after submission
        } catch (err) {
            setError('Error updating source');
            console.error(err);
        }
    };

    const handleSoftDelete = async (sourceId) => {
        try {
            const response = await axios.put(`/api/sources/soft-delete-source/${sourceId}`);
            setSources((prev) =>
                prev.map((source) => (source._id === response.data.updatedSource._id ? { ...source, delstatus: true } : source))
            ); // Update source status to deleted
            alert(response.data.message); // Show success message
        } catch (err) {
            setError('Error soft deleting source');
            console.error(err);
        }
    };

    // Render loading state or error message
    if (loading) return <div>Loading sources...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>

                        <h1 style={{ color: 'white' }}>Sources</h1>
                        <button onClick={() => setIsCreateModalOpen(true)}>Create New Source</button>

                        {/* Modal for creating a new source */}
                        {isCreateModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h2 >Create New Source</h2>
                                    <form onSubmit={handleCreateSubmit}>
                                        <div>
                                            <label htmlFor="name" >Source Name:</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={newSource.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lead_type_id" >Lead Type:</label>
                                            <select
                                                id="lead_type_id"
                                                name="lead_type_id"
                                                value={newSource.lead_type_id._id || ''} // Ensure correct value selection
                                                onChange={handleLeadTypeChange}
                                                required
                                            >
                                                <option value="">Select a lead type</option>
                                                {leadTypes.map((leadType) => (
                                                    <option key={leadType._id} value={leadType._id}>
                                                        <p>{leadType.name}</p>
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="delstatus">Deleted:</label>
                                            <input
                                                type="checkbox"
                                                id="delstatus"
                                                name="delstatus"
                                                checked={newSource.delstatus}
                                                onChange={(e) => setNewSource((prev) => ({ ...prev, delstatus: e.target.checked }))}
                                            />
                                        </div>
                                        <button type="submit">Create Source</button>
                                        <button type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Modal for updating an existing source */}
                        {isUpdateModalOpen && selectedSource && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h2>Update Source</h2>
                                    <form onSubmit={handleUpdateSubmit}>
                                        <div>
                                            <label htmlFor="name">Source Name:</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={selectedSource.name}
                                                onChange={handleUpdateInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lead_type_id">Lead Type:</label>
                                            <select
                                                id="lead_type_id"
                                                name="lead_type_id"
                                                value={selectedSource.lead_type_id._id || ''} // Ensure correct value selection
                                                onChange={handleUpdateLeadTypeChange}
                                                required
                                            >
                                                <option value="">Select a lead type</option>
                                                {leadTypes.map((leadType) => (
                                                    <option key={leadType._id} value={leadType._id}>
                                                        {leadType.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="delstatus">Deleted:</label>
                                            <input
                                                type="checkbox"
                                                id="delstatus"
                                                name="delstatus"
                                                checked={selectedSource.delstatus}
                                                onChange={(e) => setSelectedSource((prev) => ({ ...prev, delstatus: e.target.checked }))}
                                            />
                                        </div>
                                        <button type="submit">Update Source</button>
                                        <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {sources.length === 0 ? (
                            <p>No sources found.</p>
                        ) : (
                            <ul>
                                {sources.map((source) => (
                                    <li key={source._id} style={{ color: 'white' }}>
                                        <h2 style={{ color: 'white' }} >{source.name}</h2>
                                        <p style={{ color: 'white' }}>Lead Type: {source.lead_type_id?.name}</p>
                                        <p style={{ color: 'white' }}>Created By: {source.created_by}</p>
                                        <p style={{ color: 'white' }}>Deleted: {source.delstatus ? 'Yes' : 'No'}</p>
                                        <button onClick={() => handleSoftDelete(source._id)}>Soft Delete</button>
                                        <button
                                            onClick={() => {
                                                setSelectedSource(source);
                                                setIsUpdateModalOpen(true);
                                            }}
                                        >
                                            Update
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Sources;