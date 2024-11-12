import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Spinner, Button, Modal, Form, Table } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { AiFillDelete } from "react-icons/ai";
import { BiMessageSquareEdit } from "react-icons/bi";
import { BiSolidMessageAltAdd } from "react-icons/bi";
import { TiDeleteOutline } from "react-icons/ti";

const LabelManagement = () => {
    const UserPipeline = useSelector(state => state.loginSlice.user?.pipeline || []);
    const pipelines = useSelector(state => state.loginSlice.pipelines || []);
    const token = useSelector(state => state.loginSlice.user?.token);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false); // For create label modal
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('');
    const [newLabelPipeline, setNewLabelPipeline] = useState('');
    const [delLabelModal, setDelLabelModal] = useState(false);
    const [deleteLabelId, setDeleteLabelId] = useState(null)

    const fetchLabels = async () => {
        setLoading(true);
        setError(null);

        try {
            const requests = selectedPipeline
                ? [axios.get(`/api/labels/pipeline/${selectedPipeline}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })]
                : UserPipeline.length
                    ? UserPipeline.map(pipeline =>
                        axios.get(`/api/labels/pipeline/${pipeline}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    )
                    : [axios.get(`/api/labels/all`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })];

            const responses = await Promise.all(requests);
            const fetchedLabels = responses.flatMap(response => response.data);
            setLabels(fetchedLabels);
        } catch (err) {
            setError('Failed to fetch labels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchLabels();
        }
    }, [UserPipeline, token, selectedPipeline]);

    const handlePipelineClick = (pipelineId) => {
        setSelectedPipeline(pipelineId);
        setNewLabelPipeline(pipelineId); // Set the selected pipeline in the create label modal automatically
    };

    const handleClearFilter = () => {
        setSelectedPipeline('');
        setNewLabelPipeline(''); // Clear the selected pipeline when clearing the filter
    };

    const handleEdit = (label) => {
        setSelectedLabel(label);
        setNewLabelName(label.name);
        setNewLabelColor(label.color);
        setShowEditModal(true);
    };

    const handleDelete = async (labelId) => {
        try {
            await axios.delete(`/api/labels/${labelId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabels(labels.filter(label => label._id !== labelId));
            setDelLabelModal(false)
        } catch (err) {
            setError('Failed to delete label');
        }
    };

    const handleUpdateLabel = async () => {
        try {
            const updatedLabel = {
                name: newLabelName,
                color: newLabelColor,
            };
            const response = await axios.put(`/api/labels/${selectedLabel._id}`, updatedLabel, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchLabels();
            setLabels(labels.map(label => (label._id === selectedLabel._id ? response.data : label)));
            setShowEditModal(false);
            setNewLabelColor('')
            setNewLabelName('')
            setNewLabelPipeline('')
        } catch (err) {
            setError('Failed to update label');
        }
    };

    const handleCreateLabel = async () => {
        try {
            const newLabel = {
                name: newLabelName,
                color: newLabelColor,
                pipeline_id: newLabelPipeline || UserPipeline, // Only send pipeline if selected
            };
            const response = await axios.post(`/api/labels/create`, newLabel, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchLabels();
            setLabels([...labels, response.data]);
            setShowCreateModal(false); // Close modal after creation
            setNewLabelName('');
            setNewLabelColor('');
            setNewLabelPipeline('');
        } catch (err) {
            setError('Failed to create label');
        }
    };

    // Mapping color to custom background color
    const getBackgroundColor = (color) => {
        let backgroundColor = '';
        switch (color) {
            case 'success':
                backgroundColor = '#6fd943';
                break;
            case 'danger':
                backgroundColor = '#ff3a6e';
                break;
            case 'primary':
                backgroundColor = '#5c91dc';
                break;
            case 'warning':
                backgroundColor = '#ffa21d';
                break;
            case 'info':
                backgroundColor = '#6ac4f4';
                break;
            case 'secondary':
                backgroundColor = '#6c757d';
                break;
            default:
                backgroundColor = '#ccc';
        }
        return backgroundColor;
    };

    const colorOptions = [
        { name: 'Primary', color: 'primary' },
        { name: 'Secondary', color: 'secondary' },
        { name: 'Info', color: 'info' },
        { name: 'Warning', color: 'warning' },
        { name: 'Danger', color: 'danger' },
        { name: 'Dark', color: 'dark' },
        { name: 'Success', color: 'success' },
    ];

    const handleOpenDeleteModal = (id) => {
        setDelLabelModal(true)
        setDeleteLabelId(id)
    }

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className="leads_main_cards">
                            <h1 className="text-center">Label Management</h1>

                            {/* Pipeline Buttons for filtering */}
                            {Array.isArray(UserPipeline) && UserPipeline.length === 0 && (
                                <div className="text-center">
                                    <Button variant="secondary" onClick={handleClearFilter} className="mx-2 mt-3">
                                        All Pipelines
                                    </Button>
                                    {pipelines.map((pipeline) => (
                                        <Button
                                            key={pipeline._id}
                                            variant="outline-primary"
                                            onClick={() => handlePipelineClick(pipeline._id)}
                                            className="mx-2 mt-3"
                                            style={{
                                                backgroundColor: selectedPipeline === pipeline._id ? '#ffa000' : 'black',
                                                color: selectedPipeline === pipeline._id ? 'white' : 'white',
                                                border: "none"
                                            }}
                                        >
                                            {pipeline.name}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Create Label Button */}
                            <div className="text-end">
                                <BiSolidMessageAltAdd onClick={() => setShowCreateModal(true)} style={{ fontSize: '40px', color: 'green', cursor: 'pointer' }} />
                            </div>

                            {loading ? (
                                <div className="text-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : error ? (
                                <div className="text-center text-danger">
                                    {error}
                                </div>
                            ) : (
                                <Table hover striped>
                                    <thead>
                                        <tr>
                                            <th>Color</th>
                                            <th>Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labels.map((label) => (
                                            <tr key={label._id}>
                                                <td>
                                                    <div
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            backgroundColor: getBackgroundColor(label.color),
                                                            borderRadius: '4px'
                                                        }}
                                                    ></div>
                                                </td>
                                                <td>{label.name}</td>
                                                <td >
                                                    <BiMessageSquareEdit
                                                        onClick={() => handleEdit(label)}
                                                        style={{ fontSize: '20px', color: '#ffa21d', cursor: 'pointer', marginRight: '30px' }}
                                                    />
                                                    <AiFillDelete
                                                        // onClick={() => handleDelete(label._id)}
                                                        onClick={() => handleOpenDeleteModal(label._id)}
                                                        style={{ fontSize: '20px', color: 'red', cursor: 'pointer' }}
                                                    />

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Edit Label Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Label</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="labelName">
                            <Form.Label>Label Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="labelColor">
                            <Form.Label>Label Color</Form.Label>
                            <div className="d-flex flex-wrap">
                                {colorOptions.map(option => (
                                    <Button
                                        key={option.color}
                                        variant={option.color}
                                        style={{
                                            width: '30px', height: '30px', margin: '5px', borderRadius: '4px',
                                            backgroundColor: newLabelColor === option.color ? option.color : '',
                                            border: newLabelColor === option.color ? '2px solid #fff' : ''
                                        }}
                                        onClick={() => setNewLabelColor(option.color)}
                                    >
                                        {newLabelColor === option.color && <span style={{ color: '#fff' }}>✔</span>}
                                    </Button>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group controlId="labelPipeline">
                            <Form.Label>Pipeline</Form.Label>
                            <Form.Control
                                as="select"
                                value={newLabelPipeline}
                                onChange={(e) => setNewLabelPipeline(e.target.value)}
                            >
                                <option value="">Select Pipeline</option>
                                {pipelines.map((pipeline) => (
                                    <option key={pipeline._id} value={pipeline._id}>
                                        {pipeline.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className='all_close_btn_container'
                        onClick={() => {
                            // Reset state values
                            setNewLabelName('');
                            setNewLabelColor('');
                            setNewLabelPipeline('');

                            // Close the modal
                            setShowEditModal(false);
                        }}
                    >
                        Close
                    </Button>
                    <Button className='all_single_leads_button' onClick={handleUpdateLabel}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Label Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Label</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="newLabelName">
                            <Form.Label>Label Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="newLabelColor">
                            <Form.Label>Label Color</Form.Label>
                            <div className="d-flex flex-wrap">
                                {colorOptions.map(option => (
                                    <Button
                                        key={option.color}
                                        variant={option.color}
                                        style={{
                                            width: '30px', height: '30px', margin: '5px', borderRadius: '4px',
                                            backgroundColor: newLabelColor === option.color ? option.color : '',
                                            border: newLabelColor === option.color ? '2px solid #fff' : ''
                                        }}
                                        onClick={() => setNewLabelColor(option.color)}
                                    >
                                        {newLabelColor === option.color && <span style={{ color: '#fff' }}>✔</span>}
                                    </Button>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group controlId="newLabelPipeline">
                            <Form.Label>Pipeline</Form.Label>
                            <Form.Control
                                as="select"
                                value={newLabelPipeline}
                                onChange={(e) => setNewLabelPipeline(e.target.value)}
                            >
                                <option value="">Select Pipeline</option>
                                {pipelines.map((pipeline) => (
                                    <option key={pipeline._id} value={pipeline._id}>
                                        {pipeline.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => {
                        setShowCreateModal(false);
                        setNewLabelName('');
                        setNewLabelColor('');
                        setNewLabelPipeline('');
                    }}>
                        Close
                    </Button>
                    <Button className='all_single_leads_button' onClick={handleCreateLabel}>
                        Create Label
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal Confirm */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={delLabelModal}
                onHide={() => setDelLabelModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Delete Label
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '6rem' }} />
                    <p>Are you sure you want to Delete this Label ?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setDelLabelModal(false)}>No</Button>
                    <Button className='all_single_leads_button' onClick={() => handleDelete(deleteLabelId)}>Yes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LabelManagement;
