import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Form, Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
// import { AuthContext } from '../AuthContext';

const UpdateRolePermissions = () => {
    //   const { state } = useContext(AuthContext);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRolePermissions, setNewRolePermissions] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        // if (state.userinfo.token) 
        {
            // Fetch available permissions
            axios.get(`/api/permissions`, {
                headers: {
                    //   Authorization: `Bearer ${state.userinfo.token}`
                }
            })
                .then(response => {
                    setAvailablePermissions(response.data);
                })
                .catch(error => {
                    console.error('Error fetching permissions:', error);
                });

            // Fetch existing roles
            axios.get(`/api/roles`, {
                headers: {
                    //   Authorization: `Bearer ${state.userinfo.token}`
                }
            })
                .then(response => {
                    setRoles(response.data);
                })
                .catch(error => {
                    console.error('Error fetching roles:', error);
                });
        }
    }, []);

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setPermissions(role.permissions);
        setShowEditModal(true);
    };

    const handlePermissionChange = (permission) => {
        setPermissions(prevPermissions =>
            prevPermissions.includes(permission)
                ? prevPermissions.filter(p => p !== permission)
                : [...prevPermissions, permission]
        );
    };

    const handleNewRolePermissionChange = (permission) => {
        setNewRolePermissions(prevPermissions =>
            prevPermissions.includes(permission)
                ? prevPermissions.filter(p => p !== permission)
                : [...prevPermissions, permission]
        );
    };

    const handleSubmit = () => {
        axios.post(`/api/update-role-permissions`, {
            role: selectedRole.role,
            newPermissions: permissions
        }, {
            headers: {
                // Authorization: `Bearer ${state.userinfo.token}`
            }
        })
            .then(response => {
                alert('Permissions updated successfully');
                setShowEditModal(false);
                // Optionally, refresh roles to reflect changes
            })
            .catch(error => {
                console.error('Error updating permissions:', error);
                alert('Failed to update permissions');
            });
    };

    const handleCreateRole = () => {
        if (!newRoleName) {
            alert('Role name is required');
            return;
        }

        axios.post(`/api/permissions/create-role`, {
            roleName: newRoleName,
            permissionsArray: newRolePermissions
        }, {
            headers: {
                // Authorization: `Bearer ${state.userinfo.token}`
            }
        })
            .then(response => {
                alert('Role created successfully');
                setRoles([...roles, { role: newRoleName, permissions: newRolePermissions }]);
                setNewRoleName('');
                setNewRolePermissions([]);
                setShowCreateModal(false);
            })
            .catch(error => {
                console.error('Error creating role:', error);
                alert('Failed to create role');
            });
    };

    const handleDeleteRole = (roleName) => {
        if (!window.confirm(`Are you sure you want to delete the role: ${roleName}?`)) {
            return;
        }

        axios.delete(`/api/permissions/delete-role`, {
            data: { roleName }, // Passing role name in the body
            headers: {
                // Authorization: `Bearer ${state.userinfo.token}`
            }
        })
            .then(response => {
                alert('Role deleted successfully');
                setRoles(roles.filter(role => role.role !== roleName));
            })
            .catch(error => {
                console.error('Error deleting role:', error);
                alert('Failed to delete role');
            });
    };

    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={1} >
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={11}>

                        <h2 style={{ color: 'white' }}>Update Role Permissions</h2>
                        <Button onClick={() => setShowCreateModal(true)}>Create New Role</Button>

                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Permissions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role, index) => (
                                    <tr key={index}>
                                        <td>{role.role}</td>
                                        <td>
                                            {role.permissions.join(', ')}
                                        </td>
                                        <td>
                                            <Button variant="primary" onClick={() => handleRoleChange(role)}>Edit</Button>
                                            <Button variant="danger" onClick={() => handleDeleteRole(role.role)} style={{ marginLeft: '10px' }}>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Edit Role Modal */}
                        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Role Permissions</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group>
                                        <Form.Label>Permissions</Form.Label>
                                        {availablePermissions.map(permission => (
                                            <Form.Check
                                                key={permission}
                                                type="checkbox"
                                                label={permission}
                                                checked={permissions.includes(permission)}
                                                onChange={() => handlePermissionChange(permission)}
                                            />
                                        ))}
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
                                <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
                            </Modal.Footer>
                        </Modal>

                        {/* Create Role Modal */}
                        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create New Role</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group>
                                        <Form.Label>Role Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newRoleName}
                                            onChange={(e) => setNewRoleName(e.target.value)}
                                            placeholder="Enter role name"
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Permissions</Form.Label>
                                        {availablePermissions.map(permission => (
                                            <Form.Check
                                                key={permission}
                                                type="checkbox"
                                                label={permission}
                                                checked={newRolePermissions.includes(permission)}
                                                onChange={() => handleNewRolePermissionChange(permission)}
                                            />
                                        ))}
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Close</Button>
                                <Button variant="primary" onClick={handleCreateRole}>Create Role</Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UpdateRolePermissions;