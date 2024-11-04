import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap'; // Importing Modal, Button, and Form from 'react-bootstrap'
import Sidebar from '../sidebar/Sidebar';

const Pipelines = () => {
    const [pipelines, setPipelines] = useState([]); // State to store pipelines
    const [loading, setLoading] = useState(true); // State to track loading status
    const [error, setError] = useState(null); // State to track errors
    const [newPipelineName, setNewPipelineName] = useState(''); // State for new pipeline name
    const [updatePipelineId, setUpdatePipelineId] = useState(''); // State for selected pipeline to update
    const [updatePipelineName, setUpdatePipelineName] = useState(''); // State for update pipeline name
    const [modalType, setModalType] = useState(''); // State for modal type (create/update)
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    // Fetch pipelines from the API when the component mounts
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get(`/api/pipelines/get-pipelines`);
                setPipelines(response.data); // Update state with fetched pipelines
            } catch (err) {
                setError('Error fetching pipelines'); // Update error state
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchPipelines();
    }, []);

    // Create a new pipeline
    const handleCreatePipeline = async () => {
        try {
            const response = await axios.post(`/api/pipelines/create-pipeline`, {
                name: newPipelineName,
                created_by: 'User ID or Name' // Replace with the actual user ID or name
            });
            setPipelines([...pipelines, response.data]); // Add new pipeline to the state
            closeModal(); // Close the modal
        } catch (err) {
            setError('Error creating pipeline');
        }
    };

    // Update a pipeline
    const handleUpdatePipeline = async () => {
        try {
            const response = await axios.put(`/api/pipelines/update-pipeline/${updatePipelineId}`, {
                name: updatePipelineName,
            });
            setPipelines(pipelines.map(pipeline =>
                pipeline._id === updatePipelineId ? response.data : pipeline
            )); // Update the pipeline in the state
            closeModal(); // Close the modal
        } catch (err) {
            setError('Error updating pipeline');
        }
    };

    // Soft delete a pipeline
    const handleDeletePipeline = async (id) => {
        try {
            await axios.put(`/api/pipelines/delete-pipeline/${id}`);
            setPipelines(pipelines.filter(pipeline => pipeline._id !== id)); // Remove the deleted pipeline from the state
        } catch (err) {
            setError('Error deleting pipeline');
        }
    };

    // Open modal for creating a new pipeline
    const openCreateModal = () => {
        setModalType('create');
        setNewPipelineName('');
        setIsModalOpen(true);
    };

    // Open modal for updating a pipeline
    const openUpdateModal = (pipeline) => {
        setModalType('update');
        setUpdatePipelineId(pipeline._id);
        setUpdatePipelineName(pipeline.name);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setUpdatePipelineId('');
        setUpdatePipelineName('');
    };

    // Show loading message
    if (loading) {
        return <div>Loading pipelines...</div>;
    }

    // Show error message if any
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>

                        <h1 style={{ color: 'white' }}>Pipelines</h1>

                        {/* Button to open create pipeline modal */}
                        <Button variant="primary" onClick={openCreateModal}>Create New Pipeline</Button>

                        {/* Modal for creating and updating pipelines */}
                        <Modal show={isModalOpen} onHide={closeModal} backdrop="static" keyboard={false} centered >
                            <Modal.Header closeButton>
                                <Modal.Title>{modalType === 'create' ? "Create New Pipeline" : "Update Pipeline"}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {modalType === 'create' ? (
                                    <Form>
                                        <Form.Group controlId="formNewPipelineName">
                                            <Form.Label>Pipeline Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newPipelineName}
                                                onChange={(e) => setNewPipelineName(e.target.value)}
                                                placeholder="Enter pipeline name"
                                                isInvalid={!!error}
                                            />
                                            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback> {/* Show validation error message */}
                                        </Form.Group>
                                    </Form>
                                ) : (
                                    <Form>
                                        <Form.Group controlId="formUpdatePipeline">
                                            <Form.Label>Select Pipeline</Form.Label>
                                            <Form.Control as="select" onChange={(e) => setUpdatePipelineId(e.target.value)} value={updatePipelineId}>
                                                <option value="">Select Pipeline</option>
                                                {pipelines.map(pipeline => (
                                                    <option key={pipeline._id} value={pipeline._id}>{pipeline.name}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                        <Form.Group controlId="formUpdatePipelineName">
                                            <Form.Label>New Pipeline Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={updatePipelineName}
                                                onChange={(e) => setUpdatePipelineName(e.target.value)}
                                                placeholder="Enter new pipeline name"
                                            />
                                        </Form.Group>
                                    </Form>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={closeModal}>Close</Button>
                                {modalType === 'create' ? (
                                    <Button variant="primary" onClick={handleCreatePipeline}>Create Pipeline</Button>
                                ) : (
                                    <Button variant="primary" onClick={handleUpdatePipeline}>Update Pipeline</Button>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <ul>
                            {pipelines.map((pipeline) => (
                                <li key={pipeline._id} style={{ color: 'white' }}>
                                    <h2>{pipeline.name}</h2>
                                    <p>Created By: {pipeline.created_by}</p>
                                    <p>Created At:   {new Date(pipeline.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}</p>

                                    <p>Updated At: {new Date(pipeline.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}</p>

                                    <p>Deleted: {pipeline.delstatus ? 'Yes' : 'No'}</p>
                                    <Button variant="warning" onClick={() => openUpdateModal(pipeline)}>Edit</Button>
                                    <Button variant="danger" onClick={() => handleDeletePipeline(pipeline._id)}>Delete</Button>
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Pipelines;
