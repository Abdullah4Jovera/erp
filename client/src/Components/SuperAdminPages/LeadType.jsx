import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';

const LeadType = () => {
    const [leadTypes, setLeadTypes] = useState([]); // State to hold the lead types
    const [loading, setLoading] = useState(true); // State to handle loading state
    const [error, setError] = useState(null); // State to handle error
    const [formData, setFormData] = useState({ name: '', created_by: '' }); // State for form data
    const [editingLeadTypeId, setEditingLeadTypeId] = useState(null); // State for tracking which lead type is being edited
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for create modal visibility
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal visibility

    // Fetch lead types from the API
    useEffect(() => {
        const fetchLeadTypes = async () => {
            try {
                const response = await axios.get(`/api/leadtypes/get-all-leadtypes`);
                setLeadTypes(response.data); // Set the lead types in state
            } catch (err) {
                setError(err.message); // Set error message if the request fails
            } finally {
                setLoading(false); // Set loading to false after the request completes
            }
        };

        fetchLeadTypes(); // Call the fetch function
    }, []); // Empty dependency array to run only once on mount

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle form submission for create or update
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingLeadTypeId) {
            // Update existing lead type
            try {
                const response = await axios.put(`/api/leadtypes/${editingLeadTypeId}`, formData);
                setLeadTypes((prevTypes) => prevTypes.map((type) => (type._id === editingLeadTypeId ? response.data : type)));
                resetForm();
                setIsEditModalOpen(false); // Close the edit modal
            } catch (err) {
                setError(err.message);
            }
        } else {
            // Create new lead type
            try {
                const response = await axios.post(`/api/leadtypes`, formData);
                setLeadTypes((prevTypes) => [...prevTypes, response.data]);
                resetForm();
                setIsCreateModalOpen(false); // Close the create modal
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // Handle editing a lead type
    const handleEdit = (leadType) => {
        setFormData({ name: leadType.name, created_by: leadType.created_by });
        setEditingLeadTypeId(leadType._id);
        setIsEditModalOpen(true); // Open the modal for editing
    };

    // Handle soft delete of a lead type
    const handleDelete = async (id) => {
        try {
            await axios.put(`/api/leadtypes/delete/${id}`);
            setLeadTypes((prevTypes) => prevTypes.filter((type) => type._id !== id)); // Remove deleted lead type from state
        } catch (err) {
            setError(err.message);
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({ name: '', created_by: '' });
        setEditingLeadTypeId(null);
    };

    // Render loading or error state
    if (loading) {
        return <div>Loading...</div>;
    }


    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>

                        <h2 style={{ color: 'white' }}>Lead Types</h2>
                        <Button onClick={() => setIsCreateModalOpen(true)}>Create Lead Type</Button>
                        <ul>
                            {leadTypes.map(leadType => (
                                <li key={leadType._id} style={{ color: 'white' }}>
                                    <strong>Name:</strong> {leadType.name} <br />
                                    <strong>Created By:</strong> {leadType.created_by} <br />
                                    <strong>Created At:</strong>
                                    {new Date(leadType.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                    <br />
                                    <strong>Deleted:</strong> {leadType.delstatus ? 'Yes' : 'No'} <br />
                                    <Button variant="primary" onClick={() => handleEdit(leadType)}>Edit</Button>{' '}
                                    <Button variant="danger" onClick={() => handleDelete(leadType._id)}>Delete</Button>
                                    <hr />
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>

            {/* Modal for creating lead types */}
            <Modal show={isCreateModalOpen} onHide={() => setIsCreateModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Lead Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formLeadTypeName">
                            <Form.Label>Lead Type Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Lead Type Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCreatedBy">
                            <Form.Label>Created By</Form.Label>
                            <Form.Control
                                type="text"
                                name="created_by"
                                placeholder="Created By"
                                value={formData.created_by}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">Create Lead Type</Button>{' '}
                        <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal for editing lead types */}
            <Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Lead Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formLeadTypeNameEdit">
                            <Form.Label>Lead Type Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Lead Type Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCreatedByEdit">
                            <Form.Label>Created By</Form.Label>
                            <Form.Control
                                type="text"
                                name="created_by"
                                placeholder="Created By"
                                value={formData.created_by}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">Update Lead Type</Button>{' '}
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default LeadType;
