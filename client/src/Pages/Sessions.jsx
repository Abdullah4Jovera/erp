import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Col, Container, Row, Table, Button } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Session = () => {
    const [activeSessions, setActiveSessions] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useSelector((state) => state.loginSlice.user?.token);

    // Fetch active sessions
    useEffect(() => {
        const fetchActiveSessions = async () => {
            try {
                const response = await axios.get(`/api/users/active-sessions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setActiveSessions(response.data);
            } catch (err) {
                console.error('Error fetching active sessions:', err);
                setError('Failed to fetch active sessions.');
            }
        };

        fetchActiveSessions();
    }, [token]);

    // Fetch all users
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await axios.get(`/api/users/get-users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAllUsers(response.data);
            } catch (err) {
                console.error('Error fetching all users:', err);
                setError('Failed to fetch users.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, [token]);

    // Function to block/unblock user
    const toggleBlockUser = async (userId, isBlocked) => {
        try {
            const response = await axios.patch(
                `/api/users/block-user/${userId}`,
                { block: !isBlocked },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAllUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, isBlocked: !isBlocked } : user
                )
            );

            toast.success(response.data.message);
        } catch (err) {
            console.error('Error blocking user:', err);
            toast.error('Failed to update user status.');
        }
    };

    // Function to logout a user
    const logoutUser = async (userId) => {
        try {
            const response = await axios.post(
                `/api/users/logout-user/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setActiveSessions((prevSessions) =>
                prevSessions.filter((session) => session.user._id !== userId)
            );

            toast.success(response.data.message);
        } catch (err) {
            console.error('Error logging out user:', err);
            toast.error('Failed to logout user.');
        }
    };

    if (loading) {
        return <div>Loading active sessions and users...</div>;
    }

    return (
        <Container fluid>
            <ToastContainer />
            <Row>
                <Col xs={12} md={12} lg={2}>
                    <Sidebar />
                </Col>

                <Col xs={12} md={12} lg={10}>
                    <h2 className="text-center mt-4">Active Sessions</h2>
                    {activeSessions.length === 0 ? (
                        <p>No active sessions found.</p>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Login Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSessions.map((session) => (
                                    <tr key={session._id}>
                                        <td>{session.user.name}</td>
                                        <td>{session.user.email}</td>
                                        <td>{session.user.role}</td>
                                        <td>
                                            {new Date(session.loginTime).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    <h2 className="text-center mt-4">All Users</h2>
                    {allUsers.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Block Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{user.isBlocked ? 'Blocked' : 'Active'}</td>
                                        <td>
                                            <Button
                                                variant={user.isBlocked ? 'success' : 'danger'}
                                                onClick={() => toggleBlockUser(user._id, user.isBlocked)}
                                            >
                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                            </Button>{' '}
                                            <Button
                                                variant="warning"
                                                onClick={() => logoutUser(user._id)}
                                            >
                                                Logout
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Session;