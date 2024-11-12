import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { logout } from '../../Redux/loginSlice';
import { Button, Modal } from 'react-bootstrap';

const Navbar = () => {
    const userID = useSelector(state => state.loginSlice.user?._id);
    const dispatch = useDispatch();
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (userID) {
            const newSocket = io('http://192.168.2.137:4000', {
                query: { userId: userID },
                transports: ['websocket'],
            });
            setSocket(newSocket);

            // Handle incoming notifications
            newSocket.on('notification', (data) => {
                setNotifications(prevNotifications => [
                    ...prevNotifications,
                    {
                        message: data.message,
                        leadId: data.referenceId,
                        notificationType: data.notificationType,
                        notificationId: data.notificationId,
                        createdAt: data.createdAt,
                        read: false
                    }
                ]);
            });

            // Disconnect socket on component unmount
            return () => {
                newSocket.disconnect();
            };
        }
    }, [userID]);

    const handleShowNotifications = () => {
        setShowNotificationsModal(true);
    };

    const closeNotificationsModal = () => {
        setShowNotificationsModal(false);
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`http://192.168.2.137:4000/api/notifications/mark-as-read/${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.notificationId === notificationId
                            ? { ...notification, read: true }
                            : notification
                    )
                );
            } else {
                console.error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // const logoutHandler = () => {
    //     localStorage.removeItem('token');
    //     dispatch(logout());
    //     navigate('/');
    // };

    const unreadNotifications = notifications.filter(notification => !notification.read);

    return (
        <>
            <nav className='sticky-top navbar_container' style={{ backgroundColor: '#f8f9fa' }} >
                <h1>CRM</h1>
                <div>
                    <Button onClick={handleShowNotifications} variant="primary">
                        Notifications ({unreadNotifications.length})
                    </Button>
                    {/* <Button onClick={logoutHandler} variant="danger" style={{ marginLeft: '10px' }}>
                        Logout
                    </Button> */}
                </div>
            </nav>

            <Modal show={showNotificationsModal} onHide={closeNotificationsModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Notifications</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {notifications.length === 0 ? (
                        <p>No Notifications Available.</p>
                    ) : (
                        notifications.map(notification => (
                            <div key={notification.notificationId} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                                <p>{notification.message}</p>
                                {notification.notificationType === "Lead" && notification.leadId && (
                                    <Link to={`/single-leads/${notification.leadId}`}>
                                        <p>Lead ID: {notification.leadId}</p>
                                    </Link>
                                )}
                                {!notification.read && (
                                    <Button
                                        onClick={() => markAsRead(notification.notificationId)}
                                        variant="success"
                                        style={{ marginTop: '10px' }}
                                    >
                                        Mark as Read
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeNotificationsModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background-color: #f8f9fa;
                }
            `}</style>
        </>
    );
};

export default Navbar;