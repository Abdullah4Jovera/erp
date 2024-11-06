import React, { useEffect, useState } from 'react';
import '../navbar/Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { FaUsers, FaFolder, FaFileAlt, FaChartLine, FaCog } from 'react-icons/fa'; // Importing React Icons
import { IoIosArrowDown } from 'react-icons/io'; // Arrow down icon for dropdowns
import './sidebar.css';
import { logoutUser, fetchUpdatedPermission, refreshToken, logout } from '../../Redux/loginSlice';
import { Button, Image, Modal } from 'react-bootstrap';
import io from 'socket.io-client';
import defaultImage from '../../Assets/default_image.jpg'
const Sidebar = () => {
    const [requests, setRequests] = useState([]);
    const token = useSelector(state => state.loginSlice.user?.token);
    const userImage = useSelector(state => state.loginSlice.user?.image)
    const userName = useSelector(state => state.loginSlice.user?.name)
    const userEmail = useSelector(state => state.loginSlice.user?.email)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = useSelector(state => state.loginSlice.user?._id);
    const userRole = useSelector(state => state.loginSlice.user?.role);
    const [pendingCount, setPendingCount] = useState(0);
    const [actionCount, setActionCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [socket, setSocket] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(''); // Track the currently open dropdown
    const userID = useSelector(state => state.loginSlice.user?._id);

    const links = [
        { to: '/product', label: 'Products', icon: <FaFileAlt style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/branches', label: 'Branches', icon: <FaFolder style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/pipelines', label: 'PipeLines', icon: <FaChartLine style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/productstages', label: 'Product Stages', icon: <FaCog style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/leadtype', label: 'Lead Type', icon: <FaUsers style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/sources', label: 'Sources', icon: <FaCog style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/allusers', label: 'Users', icon: <FaUsers style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/usermanagement', label: 'User Management', icon: <FaCog style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/leadapiconfig', label: 'Lead Api Config', icon: <FaCog style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/session', label: 'Session', icon: <FaCog style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
        { to: '/contractstages', label: 'Contract Stages', icon: <FaCog style={{ color: '#ffa000', marginRight: '8px', fontSize: '20px' }} /> },
    ];
    useEffect(() => {
        if (userID) {
            const newSocket = io(``, {
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
            newSocket.on('permission-update', async (data) => {
                await dispatch(fetchUpdatedPermission()); // Fetch updated permissions 
                const refreshResponse = await dispatch(refreshToken()); // Refresh token
                if (refreshResponse.payload) {
                    console.log('Token refreshed:', refreshResponse.payload.token); // Log the new token
                }
            });

            newSocket.on('logout-notification', async (data) => {
                await dispatch(logoutUser());
                dispatch(logout());
                navigate('/');

            });

            // Disconnect socket on component unmount
            return () => {
                newSocket.disconnect();
            };
        }
    }, [userID]);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(
                `/api/request/my-requests`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            if (response.data && response.data.data) {
                const fetchedRequests = response.data.data;
                setRequests(fetchedRequests);
                // Count pending requests where the user is a receiver
                const pending = fetchedRequests.filter(request =>
                    request.receivers.some(receiver => receiver._id === userId) && request.action === 'Pending'
                );
                setPendingCount(pending.length);
                // Count accepted or declined requests where the sender is the logged-in user and read is false
                const actionTaken = fetchedRequests.filter(request =>
                    request.sender._id === userId &&
                    (request.action === 'Accept' || request.action === 'Decline') &&
                    request.read === false // Only count if read is false
                );
                setActionCount(actionTaken.length);
            } else {
                setRequests([]);
                setPendingCount(0);
                setActionCount(0);  // Reset actionCount when no requests
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token, userId]);

    const toggleDropdown = (dropdownName) => {
        setOpenDropdown(prev => prev === dropdownName ? '' : dropdownName);
    };

    const logoutHandler = () => {
        dispatch(logoutUser());
        dispatch(logout());
        navigate('/');

    };

    const handleShowNotifications = () => {
        setShowNotificationsModal(true);
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/mark-as-read/${notificationId}`, {
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

    const closeNotificationsModal = () => {
        setShowNotificationsModal(false);
    };

    const unreadNotifications = notifications.filter(notification => !notification.read);

    return (
        <div className='sidebar_main_container'>
            <div className='sidebar_links'>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
                    <Image src={`/images/${userImage && userImage || defaultImage}`} alt={`${userName && userName} Image`} style={{ width: '120px', height: '120px', borderRadius: '50%', border: '1px solid white' }} />
                    <p className='user_name_class mb-2' style={{ color: 'white' }} > {userName && userName} </p>
                    <p className='user_email_class mb-0' style={{ color: 'white' }}> {userRole && userRole} </p>
                    <p className='user_email_class mb-0' style={{ color: 'white' }}> {userEmail && userEmail} </p>
                </div>

                <div className='sidebar_section'>
                    <div className='dropdown' onClick={() => toggleDropdown('leads')}>
                        <span className='dropdown_title'>Leads Management <IoIosArrowDown /></span>
                        {openDropdown === 'leads' && (
                            <div className='dropdown_content'>
                                <Link to={'/leads'} className='sidebar_link'>Leads</Link>
                                <Link to={'/rejectedlead'} className='sidebar_link'>Rejected Leads</Link>
                                {userRole === 'CEO' && (
                                    <>
                                        <Link to={'/ceounassign'} className='sidebar_link'>UnAssign Lead</Link>
                                        <Link to={'/request'} className='sidebar_link'>
                                            Lead Requests {actionCount > 0 && `(${actionCount})`} {pendingCount > 0 && `(${pendingCount})`}
                                        </Link>
                                        <Link to={'/createlabels'} className='sidebar_link'>Label Management</Link>
                                    </>
                                )}
                                {(userRole === 'HOD' || userRole === 'Manager') && (
                                    <>
                                        <Link to={'/unsigned'} className='sidebar_link'>UnAssign Lead</Link>
                                        <Link to={'/request'} className='sidebar_link'>
                                            Lead Requests {actionCount > 0 && `(${actionCount})`} {pendingCount > 0 && `(${pendingCount})`}
                                        </Link>
                                        <Link to={'/createlabels'} className='sidebar_link'>Label Management</Link>
                                    </>
                                )}

                            </div>
                        )}
                    </div>
                </div>

                {/* Phone Book */}
                <div className='sidebar_section'>
                    <div className='dropdown' onClick={() => toggleDropdown('phonebook')}>
                        <span className='dropdown_title'>PhoneBook<IoIosArrowDown /></span>
                        {openDropdown === 'phonebook' && (
                            <div className='dropdown_content'>
                                {!['Super Admin', 'HOD', 'Manager', 'CEO', 'Team Leader', 'Coordinator'].includes(userRole) && (
                                    <Link to={'/phonebook'} className='sidebar_link'>PhoneBook</Link>
                                )}
                                {userRole === 'CEO' && (
                                    <>
                                        <Link to={'/ceophonebook'} className='sidebar_link'>PhoneBook</Link>
                                        {/* <Link to={'/generatereport'} className='sidebar_link'>Generate Report</Link> */}
                                    </>
                                )}

                                {['HOD', 'Team Leader', 'Manager', 'Coordinator'].includes(userRole) && (
                                    <>
                                        <Link to={'/HodPhoneBook'} className='sidebar_link'>PhoneBook</Link>
                                        {/* <Link to={'/generatereport'} className='sidebar_link'>Generate Report</Link> */}
                                    </>
                                )}

                                {userRole === 'Super Admin' && (
                                    <div className='sidebar_section'>
                                        <Link to={'/superadminphonebook'} className='sidebar_link'>Phonebook</Link>
                                        {/* <Link to={'/generatereport'} className='sidebar_link'>Generate Report</Link> */}
                                    </div>
                                )}

                                <Link to={'/convertedlead'} className='sidebar_link'>Lead Converted Numbers</Link>
                                <Link to={'/blocklist'} className='sidebar_link'>BlockList Numbers</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contract */}
                <div className='sidebar_section'>
                    <div className='dropdown' onClick={() => toggleDropdown('contract')}>
                        <span className='dropdown_title'>Contract<IoIosArrowDown /></span>
                        {openDropdown === 'contract' && (
                            <div className='dropdown_content'>
                                <Link to={'/contract'} className='sidebar_link'>Contract</Link>
                            </div>
                        )}
                    </div>
                </div>

                {(userRole === 'Super Admin' || userRole === 'Developer') && (
                    <div className='sidebar_section'>
                        <div className='dropdown' onClick={() => toggleDropdown('appManagement')}>
                            <span className='dropdown_title'>App Management <IoIosArrowDown /></span>
                            {openDropdown === 'appManagement' && (
                                <div className='dropdown_content'>
                                    {links.map(link => (
                                        <Link key={link.to} to={link.to} className='sidebar_link'>
                                            {link.icon} {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Button onClick={handleShowNotifications} variant="primary">
                    Notifications ({unreadNotifications.length})
                </Button>

                <Button onClick={logoutHandler} variant="danger">
                    Logout
                </Button>

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

            </div>
        </div>
    );
};

export default Sidebar;