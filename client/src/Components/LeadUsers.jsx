import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button, Form, Container, Row, Col, Image,OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../Pages/style.css';
import { RiDeleteBinLine } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import default_image from '../Assets/default_image.jpg';
import { TiDeleteOutline } from "react-icons/ti";

const LeadUsers = ({ singleLead, fetchSingleLead }) => {
    const { selected_users = [], pipeline_id } = singleLead;
    const { id } = useParams();
    const [userModal, setUserModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // Changed to an array for multiple users
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [error, setError] = useState('');
    const permissions = useSelector(state => state.loginSlice.user?.permissions)
    const canAddUserLead = permissions?.includes('add_user_lead');
    const canRemoveUserLead = permissions?.includes('remove_user_lead');

    const token = useSelector(state => state.loginSlice.user?.token);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    // Fetch all users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/users/get-users`);
                setAllUsers(response.data);
            } catch (error) {
                console.log(error, 'err');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (allUsers.length > 0 && pipeline_id) {
            const usersForPipeline = allUsers?.filter(user =>
                user?.pipeline && user.pipeline.length > 0 && user.pipeline[0]?._id === pipeline_id?._id
            );
            const filtered = usersForPipeline.filter(user =>
                !selected_users.some(selectedUser => selectedUser._id === user._id)
            );
            setFilteredUsers(filtered);
        }
    }, [allUsers, pipeline_id, selected_users]);

    // Add User
    const AddUser = async () => {
        setError('');
        if (selectedUsers.length === 0) {
            setError('Please select at least one user before submitting.');
            return;
        }

        try {
            // Loop through selected users and add them
            for (const user of selectedUsers) {
                await axios.put(`/api/leads/add-user-to-lead/${id}`, {
                    userId: user.value
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            setSelectedUsers([]); // Clear selection after adding users
            fetchSingleLead();
            setUserModal(false);
        } catch (error) {
            console.log(error, 'error');
        }
    };

    // Delete User
    const DeleteUser = async () => {
        try {
            await axios.put(`/api/leads/remove-user-from-lead/${id}`, {
                userId: userIdToDelete
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDeleteModal(false);
            fetchSingleLead();
        } catch (error) {
            console.log(error, 'err');
        }
    };

    // Prepare options for the select dropdown
    const userOptions = filteredUsers.map(user => ({
        value: user._id,
        label: user.name
    }));

    // Function to split description into chunks of 15 words
    const splitDescriptionIntoChunks = (description) => {
        if (!description) return [];
        const words = description.split(' ');
        const chunks = [];
        for (let i = 0; i < words.length; i += 15) {
            chunks.push(words.slice(i, i + 15).join(' '));
        }
        return chunks;
    };

    const descriptionChunks = splitDescriptionIntoChunks(singleLead.description);

    return (
        <>
            <Container>
                <Row>
                    <Col xs={12} md={7}>
                        <Card className='mt-4 lead_discussion_main_card_description' style={{ padding: '20px' }}>
                            <h4 className='mb-0' style={{ color: '#B9406B', textAlign: 'center' }}>
                                {singleLead?.company_Name || 'No Company Name'}
                            </h4>
                            <p className='text-muted text-sm mb-0 text-center'>Company Name</p>
                            <div>
                                <h5>Lead Details</h5>
                            </div>
                            {singleLead?.description
                                ? singleLead.description.split('\n').map((line, index) => (
                                    <p
                                        className='mb-0'
                                        key={index}
                                        style={{ fontWeight: index % 2 === 0 ? 'bold' : 'normal' }}
                                    >
                                        {line}
                                    </p>
                                ))
                                : <p>No description available</p>
                            }
                        </Card>
                    </Col>

                    <Col xs={12} md={5}>
                        <Card className='mt-4 lead_discussion_main_card_user' style={{ padding: '20px' }}>
                            <div className='discussion_files'>
                                <h5>Users</h5>
                                {
                                    singleLead.is_reject && canAddUserLead
                                        ? null
                                        : (
                                            canAddUserLead && (
                                                <div className='lead_users_delete_btn mb-3'>
                                                    <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => setUserModal(true)} />
                                                </div>
                                            )
                                        )
                                }
                            </div>
                            <Table bordered responsive striped hover className="lead_user_class">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70%' }}>Name</th>
                                        {
                                            singleLead.is_reject && canRemoveUserLead
                                                ? null
                                                : (
                                                    canRemoveUserLead && (
                                                        <th className="text-center" style={{ width: '30%' }}>Action</th>
                                                    )
                                                )
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected_users.length > 0 ? (
                                        selected_users
                                            .filter(
                                                user =>
                                                    user?.role?.trim().toLowerCase() !== "ceo" &&
                                                    user?.role?.trim().toLowerCase() !== "md" &&
                                                    user?.role?.trim().toLowerCase() !== "super admin" &&
                                                    user?.role?.trim().toLowerCase() !== "company" &&
                                                    user?.role?.trim().toLowerCase() !== "hod"
                                            )
                                            .map((user) => {
                                                const imageSrc = user?.image
                                                    ? `/images/${user?.image}`
                                                    : default_image;

                                                // Tooltip to display the user's name
                                                const renderTooltip = (props) => (
                                                    <Tooltip id="user-tooltip" {...props}>
                                                        {user.name}
                                                    </Tooltip>
                                                );

                                                return (
                                                    <tr key={user._id} style={{ height: '50px' }}>
                                                        <td style={{ verticalAlign: 'middle' }}>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <OverlayTrigger
                                                                    placement="top"
                                                                    delay={{ show: 250, hide: 400 }}
                                                                    overlay={renderTooltip}
                                                                >
                                                                    <Image
                                                                        src={imageSrc}
                                                                        alt="User"
                                                                        className="image_control_discussion"
                                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                    />
                                                                </OverlayTrigger>
                                                                <span style={{ fontWeight: '600' }}>{user.name}</span>
                                                            </div>
                                                        </td>
                                                        {
                                                            singleLead.is_reject && canRemoveUserLead
                                                                ? null
                                                                : (
                                                                    canRemoveUserLead && (
                                                                        <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                                            <div className="lead_users_delete_btn">
                                                                                <RiDeleteBinLine
                                                                                    style={{ color: 'white', fontSize: '18px', cursor: 'pointer' }}
                                                                                    onClick={() => {
                                                                                        setUserIdToDelete(user._id);
                                                                                        setDeleteModal(true);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    )
                                                                )
                                                        }
                                                    </tr>
                                                );
                                            })
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="text-center">
                                                No users available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Add user Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={userModal}
                onHide={() => setUserModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Users</Form.Label>
                            <Select
                                options={userOptions}
                                value={selectedUsers}
                                onChange={(options) => {
                                    setSelectedUsers(options);
                                    setError('');
                                }}
                                isMulti // Enable multi-select
                                placeholder="Select users..."
                            />
                            {error && <div className="text-danger">{error}</div>}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setUserModal(false)} className='all_close_btn_container'>Close</Button>
                    <Button className='all_single_leads_button' onClick={AddUser}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={deleteModal}
                onHide={() => setDeleteModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Delete User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p>Are you sure you want to delete this user?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setDeleteModal(false)} className='all_close_btn_container'>Close</Button>
                    <Button className='all_single_leads_button' onClick={DeleteUser}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LeadUsers;
