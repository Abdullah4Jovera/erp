import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importing the CSS for Toastify
import { TiDeleteOutline } from "react-icons/ti";
import { FiEdit2 } from "react-icons/fi";
import { AiFillDelete } from "react-icons/ai";
import '../../Pages/style.css'
import Sidebar from '../sidebar/Sidebar';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');
    const [editingBranchName, setEditingBranchName] = useState('');
    const [creatingBranch, setCreatingBranch] = useState(false);
    const [updatingBranch, setUpdatingBranch] = useState(false);
    const [deletingBranch, setDeletingBranch] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);

    // Fetch branches from API
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await axios.get(`/api/branch/get-branches`)
                const activeBranches = response.data.filter(branch => !branch.delstatus);
                setBranches(activeBranches);
                setLoading(false);
            } catch (err) {
                setError('Error fetching branches');
                setLoading(false);
                toast.error('Error fetching branches'); // Using toast for error notification
            }
        };

        fetchBranches();
    }, []);

    // Function to handle branch creation
    const handleCreateBranch = async () => {
        if (!newBranchName.trim()) {
            toast.warn('Branch name is required'); // Using toast for warning notification
            return;
        }

        try {
            setCreatingBranch(true);
            const response = await axios.post(`/api/branch/create-branch`, {
                name: newBranchName
            });
            setBranches([...branches, response.data]);
            setNewBranchName('');
            setShowCreateModal(false);
            toast.success('Branch created successfully!'); // Using toast for success notification
            setCreatingBranch(false);
        } catch (error) {
            console.error('Error creating branch:', error);
            setError('Error creating branch');
            toast.error('Error creating branch'); // Using toast for error notification
            setCreatingBranch(false);
        }
    };

    // Function to handle branch update
    const handleUpdateBranch = async () => {
        if (!editingBranchName.trim()) {
            toast.warn('Branch name is required'); // Using toast for warning notification
            return;
        }

        try {
            setUpdatingBranch(true);
            const response = await axios.put(`/api/branch/update-branch/${selectedBranchId}`, {
                name: editingBranchName
            });
            setBranches(branches.map(branch =>
                branch._id === selectedBranchId ? response.data : branch
            ));
            setEditingBranchName('');
            setShowEditModal(false);
            toast.success('Branch updated successfully!'); // Using toast for success notification
            setUpdatingBranch(false);
        } catch (error) {
            console.error('Error updating branch:', error);
            setError('Error updating branch');
            toast.error('Error updating branch'); // Using toast for error notification
            setUpdatingBranch(false);
        }
    };

    // Function to handle branch soft delete
    const handleDeleteBranch = async (id) => {
        // if (!window.confirm('Are you sure you want to delete this branch?')) return;
        try {
            setDeletingBranch(true);
            await axios.delete(`/api/branch/delete-branch/${id}`);
            setBranches(branches.filter(branch => branch._id !== id));
            toast.success('Branch deleted successfully!'); // Using toast for success notification
            setDeletingBranch(false);
            setDeleteModal(false)
        } catch (error) {
            console.error('Error deleting branch:', error);
            setError('Error deleting branch');
            toast.error('Error deleting branch'); // Using toast for error notification
            setDeletingBranch(false);
        }
    };

    if (loading) {
        return <div>Loading branches...</div>;
    }


    return (
        <div>

            <ToastContainer /> {/* ToastContainer to display notifications */}
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>

                        <div style={{ display: 'flex', gap: '20px' }} >
                            <h2 style={{ color: 'white' }}>Branches</h2>
                            {/* Button to show Create Modal */}
                            <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create Branch</Button>
                        </div>

                        {/* Modal for creating a new branch */}
                        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create New Branch</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group controlId="formBranchName">
                                    <Form.Label>Branch Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter branch name"
                                        value={newBranchName}
                                        onChange={(e) => setNewBranchName(e.target.value)}
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleCreateBranch} disabled={creatingBranch}>
                                    {creatingBranch ? 'Creating...' : 'Create'}
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {/* Modal for editing an existing branch */}
                        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Branch</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group controlId="formEditBranchName">
                                    <Form.Label>Branch Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter branch name"
                                        value={editingBranchName}
                                        onChange={(e) => setEditingBranchName(e.target.value)}
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleUpdateBranch} disabled={updatingBranch}>
                                    {updatingBranch ? 'Updating...' : 'Update'}
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <ul>
                            {branches.map(branch => (
                                <>
                                    <li key={branch._id} style={{ color: 'white' }}>
                                        <strong>Name:</strong> {branch.name} <br />
                                        <strong>Date:</strong>
                                        {new Date(branch.timestamp).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}

                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} >
                                            <FiEdit2 onClick={() => {
                                                setSelectedBranchId(branch._id);
                                                setEditingBranchName(branch.name);
                                                setShowEditModal(true);
                                            }} style={{ fontSize: '22px', cursor: 'pointer', color: '#f1a324' }} />

                                            <AiFillDelete style={{ fontSize: '24px', cursor: 'pointer', color: 'red' }} onClick={() => setDeleteModal(true)} />
                                        </div>
                                    </li>

                                    <Modal
                                        size="sm"
                                        aria-labelledby="contained-modal-title-vcenter"
                                        centered
                                        show={deleteModal}
                                        onHide={() => setDeleteModal(false)}
                                    >
                                        <Modal.Header closeButton>
                                            <Modal.Title id="contained-modal-title-vcenter">
                                                Delete Branch
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body className="text-center">
                                            <TiDeleteOutline className="text-danger" style={{ fontSize: '6rem' }} />
                                            <p>Are you sure you want to Delete this Branch?</p>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button className='all_close_btn_container' onClick={() => setDeleteModal(false)} >No</Button>
                                            <Button className='all_single_leads_button' onClick={() => handleDeleteBranch(branch._id)} >Yes</Button>
                                        </Modal.Footer>
                                    </Modal>
                                </>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Branches;
