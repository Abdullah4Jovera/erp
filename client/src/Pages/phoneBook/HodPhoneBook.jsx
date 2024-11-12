import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineEye } from "react-icons/ai";
import { Table, Modal, Button, Form, Dropdown, Container, Row, Col, Card, ListGroup, Image } from 'react-bootstrap';
import Select from 'react-select';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from "react-icons/fi";
import defaultimage from '../../Assets/default_image.jpg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from '../../Components/navbar/Navbar';
import { useSelector } from 'react-redux';
import Sidebar from '../../Components/sidebar/Sidebar';
import { IoOpenOutline } from "react-icons/io5";
import './phoneBookstyle.css'
import CreatePhoneBook from './CreatePhoneBook';

const HodPhoneBook = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const role = useSelector(state => state.loginSlice.user?.role)
    const userID = useSelector(state => state.loginSlice.user?._id)
    const piprlineID = useSelector(state => state.loginSlice.user?.pipeline)

    const [hodData, setHodData] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [userRoleOptions, setUserRoleOptions] = useState([]);
    const [error, setError] = useState(null);
    const [showViewCommentModal, setShowViewCommentModal] = useState(false);
    const [commentsToView, setCommentsToView] = useState([]);
    const [hasAccess, setHasAccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCalStatus, setSelectedCalStatus] = useState(null);
    const [filteredPhonebookData, setFilteredPhonebookData] = useState([]);
    const [showAddCommentModal, setShowAddCommentModal] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [dropdownEntry, setDropdownEntry] = useState(null);
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [phoneBookModal, setPhoneBookModal] = useState(false)
    const [phoneBookNumber, setPhoneBookNumber] = useState('')
    const [phoneID, setPhoneID] = useState('')
    const [insertSkipNumber, setInsertSkipNumber] = useState(false)
    const [insertedNumbers, setInsertedNumbers] = useState([]);
    const [skippedNumbers, setSkippedNumbers] = useState([]);
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const entriesPerPage = 12;
    const totalPages = Math.ceil(filteredPhonebookData.length / entriesPerPage);
    const navigate = useNavigate();

    const allowedRoles = [
        'HOD',
        'Team Leader',
        'Manager',
        'Coordinator'
    ];

    const calStatusOptions = [
        { value: 'Interested', label: 'Interested' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'No Answer', label: 'No Answer' }, // Ensure this matches your data
        { value: 'Not Interested', label: 'Not Interested' }, // Ensure this matches your data
    ];

    const getHodPhoneBookData = async () => {
        try {
            const response = await axios.get(
                `/api/phonebook/get-all-phonebook`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const filteredData = response.data.filter(entry => entry.calstatus !== 'Convert to Lead');
            const sortedData = filteredData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setHodData(sortedData);
            setFilteredPhonebookData(sortedData);
            getAllUsers(token);

        } catch (error) {
            console.log('Error fetching HOD Phone Book data:', error);
            setError('No Phone Book Data Available.');
        }
    };

    const getAllUsers = async () => {
        try {
            const response = await axios.get(
                `/api/users/get-users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const users = response.data;

            // Filter and map for users with role 'Ts Agent' or 'Sales'
            const userOptions = users
                .filter(user => user.role === 'TS Agent' || user.role === 'Sales')
                .map(user => ({
                    value: user._id,
                    label: user.name,
                }));

            // Filter and map for users with roles 'Ts Team Leader', 'Team Leader', or 'Coordinator'
            const userRoleOptions = users
                .filter(
                    user =>
                        user.role === 'TS Team Leader' ||
                        user.role === 'Team Leader' ||
                        user.role === 'Coordinator'
                )
                .map(user => ({
                    value: user._id,
                    label: user.name,
                }));

            // Update state with filtered user options
            setAllUsers(userOptions);
            setUserRoleOptions(userRoleOptions); // New state for team leaders/coordinators

        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    };


    useEffect(() => {

        if (!token) {
            setError('No token found in user data.');
            return;
        }

        if (allowedRoles.includes(role)) {
            setHasAccess(true);
            getHodPhoneBookData(token);
        } else {
            setError('You do not have access to this dashboard.');
        }
    }, []);

    useEffect(() => {
        const results = hodData.filter(entry =>
            entry.number.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!selectedUser || entry.user._id === selectedUser.value) &&
            (!selectedCalStatus || entry.calstatus === selectedCalStatus.value) &&
            (!startDate || new Date(entry.updatedAt) >= startDate) &&
            (!endDate || new Date(entry.updatedAt) <= endDate)
        );
        setFilteredPhonebookData(results);
    }, [searchQuery, hodData, selectedUser, selectedCalStatus, startDate, endDate]);

    const handleViewComments = (comments) => {
        setCommentsToView(comments);
        setShowViewCommentModal(true);
    };

    const handleViewCommentsClick = (entry) => {
        handleViewComments(entry.comments);
    };

    const clearSelectedUser = () => {
        setSelectedUser(null);
    };

    // Add Comment API
    // const handleSaveComment = async () => {
    //     if (selectedEntry && currentComment.trim()) {
    //         try {
    //             if (token) {
    //                 await axios.post(
    //                     `/api/phonebook/add-comment`,
    //                     {
    //                         phonebookId: selectedEntry._id,
    //                         comment: currentComment
    //                     },
    //                     {
    //                         headers: {
    //                             'Authorization': `Bearer ${token}`,
    //                             'Content-Type': 'application/json'
    //                         }
    //                     }
    //                 );

    //                 // Update local state
    //                 const updatedData = hodData.map(entry =>
    //                     entry._id === selectedEntry._id
    //                         ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment, createdAt: new Date() }] }
    //                         : entry
    //                 );

    //                 const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    //                 setHodData(sortedUpdatedData);
    //                 setFilteredPhonebookData(sortedUpdatedData);
    //             } else {
    //                 navigate('/');
    //             }
    //         } catch (error) {
    //             console.error('Error saving comment:', error);
    //         }
    //     }
    //     setCurrentComment('');
    //     setSelectedEntry(null);
    //     setShowAddCommentModal(false);
    // };

    const handleAddCommentClick = (entry) => {
        setSelectedEntry(entry);
        setCurrentComment('');
        setShowAddCommentModal(true);
    };

    const updateCallStatus = async (status) => {
        if (dropdownEntry) {
            try {
                if (token) {
                    await axios.put(
                        `/api/phonebook/update-calstatus/${dropdownEntry._id}`,
                        {
                            calstatus: status
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    const updatedData = hodData.map((entry) =>
                        entry._id === dropdownEntry._id ? { ...entry, calstatus: status } : entry
                    );
                    // Re-sort updated data by updatedAt
                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setHodData(sortedUpdatedData);
                    setFilteredPhonebookData(sortedUpdatedData);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error updating call status:', error);
            }
        }

        setDropdownEntry(null); // Hide dropdown after selecting status
        setShowConvertModal(false); // Hide confirmation modal after updating
    };

    const handleCallStatusChange = (status) => {
        if (status === 'Convert to Lead') {
            setPendingStatusChange(status);
            setShowConvertModal(true);
        } else {
            updateCallStatus(status);
        }
    };

    const handleConfirmConversion = () => {
        updateCallStatus(pendingStatusChange);
    };
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'csv') {
                setError('Only CSV files are Allowed.');
                setCsvFile(null); // Clear the file input
            } else {
                setError('');
                setCsvFile(selectedFile);
            }
        }
    };

    const handleUserChange = (selectedOption) => {
        setSelectedUsers(selectedOption); // Update selected users
    };

    const handleAgentChange = (selectedOption) => {
        setSelectedAgent(selectedOption); // Update selected agent
    };

    const handleImportSubmit = async () => {
        // if (selectedUsers.length > 0 && csvFile && selectedAgent) {
        if (token) {
            const formData = new FormData();
            // Append each selected user ID to `visibilityUserIds`
            selectedUsers.forEach(user => { // Use selectedUsers state variable
                formData.append('visibilityUserId', user.value);
            });

            // Use the selected agent for userId
            formData.append('userId', selectedAgent.value); // Assuming single agent selection

            // Append additional fields
            formData.append('pipelineId', piprlineID); // Ensure pipelineID is defined
            formData.append('file', csvFile); // Attach the CSV file

            try {
                const response = await axios.post(`/api/phonebook/upload-csv`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setMessage(response.data.message || ''); // Set the message from the response
                setInsertedNumbers(response.data.insertedNumbers || []);
                setSkippedNumbers(response.data.skippedNumbers || []);
                // Reset the state if needed or handle success
                getHodPhoneBookData()
                setInsertSkipNumber(true)
                setSelectedUsers([]); // Reset to an empty array
                setSelectedAgent(null);
                setCsvFile(null);
                setShowImportModal(false);
            } catch (error) {
                console.error('Error uploading CSV:', error);
            }
        } else {
            navigate('/'); // Adjust navigation as needed
        }
        // }
    };

    const HandleCreatePhoneBook = async (num, id) => {
        setPhoneBookModal(true)
        setPhoneBookNumber(num)
        setPhoneID(id)
    }

    // Determine the entries to show on the current page
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredPhonebookData.slice(indexOfFirstEntry, indexOfLastEntry);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleCommentsClick = (entry) => {
        setSelectedEntry(entry);
        setCommentsToView(entry.comments || []); // Load existing comments
        setCurrentComment(''); // Reset the new comment field
        setShowCommentsModal(true); // Open the modal
    };

    // Save comment API call and update state
    const handleSaveComment = async () => {
        if (selectedEntry && currentComment.trim()) {
            try {
                if (token) {
                    await axios.post(
                        `/api/phonebook/add-comment`,
                        {
                            phonebookId: selectedEntry._id,
                            comment: currentComment
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    // Update local state with the new comment
                    const updatedData = hodData.map(entry =>
                        entry._id === selectedEntry._id
                            ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment, createdAt: new Date() }] }
                            : entry
                    );

                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    getHodPhoneBookData();
                    setHodData(sortedUpdatedData);
                    setFilteredPhonebookData(sortedUpdatedData);
                    setShowCommentsModal(false)
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error saving comment:', error);
            }
        }
        setCurrentComment(''); // Clear the comment field
    };

    return (
        <>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards'>
                            <div className="phonebook-container">

                                <div style={{ display: 'flex', justifyContent: 'end', gap: '15px', alignItems: 'end', marginBottom: '20px' }}>
                                    <Button className='button_one' onClick={() => setShowImportModal(true)}>Import CSV</Button>
                                    {/* <Button className='button_two' onClick={() => navigate('/generatereport')} >Call History</Button> */}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', alignItems: 'center' }}>
                                    <Form.Group controlId="searchBarNumber" className='w-100'>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by Number"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className='searchfield'
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="selectUser" className='w-100'>
                                        <Select
                                            options={allUsers}
                                            value={selectedUser}
                                            onChange={setSelectedUser}
                                            placeholder="Select User"
                                            isClearable
                                            className='searchfield'
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="selectCalStatus" className='w-100'>
                                        <Select
                                            options={calStatusOptions}
                                            value={selectedCalStatus}
                                            onChange={setSelectedCalStatus}
                                            placeholder="Select Call Status"
                                            isClearable
                                            className='searchfield'
                                        />
                                    </Form.Group>

                                    <div className='w-100' style={{ display: 'flex', gap: '15px' }} >
                                        <DatePicker
                                            selected={startDate}
                                            onChange={date => setStartDate(date)}
                                            placeholderText="Start Date"
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control searchfield"
                                        />
                                        <DatePicker
                                            selected={endDate}
                                            onChange={date => setEndDate(date)}
                                            placeholderText="End Date"
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control searchfield"
                                        />
                                    </div>
                                </div>


                                <div>
                                    {error ? (
                                        <p style={{ color: 'red' }}>{error}</p>
                                    ) : hasAccess ? (
                                        filteredPhonebookData.length > 0 ? (

                                            <Table hover bordered responsive className='mt-3 table_main_container' size='md'>
                                                <thead style={{ backgroundColor: '#f8f9fd' }}>
                                                    <tr
                                                        className="teble_tr_class"
                                                        style={{
                                                            backgroundColor: '#e9ecef',
                                                            color: '#343a40',
                                                            borderBottom: '2px solid #dee2e6',
                                                            transition: 'background-color 0.3s ease',
                                                        }}
                                                    >
                                                        <th className="equal-width" style={{ backgroundColor: '#f8f9fd' }}>Uploaded by</th>
                                                        <th className="equal-width" style={{ backgroundColor: '#f8f9fd' }}>User</th>
                                                        <th className="equal-width" style={{ backgroundColor: '#f8f9fd' }}>Pipeline</th>
                                                        <th className="equal-width" style={{ backgroundColor: '#f8f9fd' }}>Phone</th>
                                                        <th className="equal-width" style={{ backgroundColor: '#f8f9fd' }}>Call Status</th>
                                                        <th className="equal-width" style={{ backgroundColor: '#f8f9fd' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentEntries.map((entry, index) => (
                                                        <tr key={index}>
                                                            <td className='table_td_class'>{entry.uploaded_by?.name ? entry.uploaded_by?.name : 'N/A'}</td>
                                                            <td className='table_td_class'>{entry.user.name}</td>
                                                            <td className='table_td_class'>{entry.pipeline.name}</td>
                                                            <td className='table_td_class'>{entry.number}</td>
                                                            <td className='table_td_class'>{entry.calstatus}</td>
                                                            <td style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                                                                {dropdownEntry && dropdownEntry._id === entry._id ? (
                                                                    <Dropdown>
                                                                        <Dropdown.Toggle className="dropdown_menu" id="dropdown-basic">
                                                                            {entry.calstatus || 'Select Status'}
                                                                        </Dropdown.Toggle>
                                                                        <Dropdown.Menu>
                                                                            <Dropdown.Item onClick={() => handleCallStatusChange('Req to call')}>Req to call</Dropdown.Item>
                                                                            <Dropdown.Item onClick={() => handleCallStatusChange('Interested')}>Interested</Dropdown.Item>
                                                                            <Dropdown.Item onClick={() => handleCallStatusChange('Rejected')}>Rejected</Dropdown.Item>
                                                                        </Dropdown.Menu>
                                                                    </Dropdown>
                                                                ) : (
                                                                    <div className='editAction'>
                                                                        <FiEdit2
                                                                            onClick={() => setDropdownEntry(entry)}
                                                                            style={{ fontSize: '12px', cursor: 'pointer', color: 'white' }}
                                                                        />
                                                                        <div className="tooltip">Edit Status</div>
                                                                    </div>
                                                                )}
                                                                {/* <div className='addAction'>
                                                                    <MdAdd
                                                                        onClick={() => handleAddCommentClick(entry)}
                                                                        style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                    />
                                                                    <div className="tooltip">Add Comments</div>
                                                                </div> */}
                                                                <div className='addAction'>
                                                                    <MdAdd
                                                                        style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                        onClick={() => handleCommentsClick(entry)}
                                                                    />
                                                                    <div className="tooltip">View/Add Comments</div>
                                                                </div>
                                                                {/* <div className='viewAction'>
                                                                    <AiOutlineEye
                                                                        onClick={() => handleViewCommentsClick(entry)}
                                                                        style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                    />
                                                                    <div className="tooltip">View Comments</div>
                                                                </div> */}
                                                                <div className='viewAction'>
                                                                    <IoOpenOutline
                                                                        onClick={() => HandleCreatePhoneBook(entry.number, entry._id)}
                                                                        style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                    />
                                                                    <div className="tooltip">Create Lead</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                        ) : (
                                            <p className='text-center mt-5'>No Data Available</p>
                                        )
                                    ) : (
                                        <p>You do not have access to this page.</p>
                                    )}


                                    {/* Pagination controls */}
                                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                        <Button variant="secondary" onClick={handlePreviousPage} disabled={currentPage === 1}>
                                            Previous
                                        </Button>
                                        <span style={{ padding: '0 15px', lineHeight: '38px' }}>
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button variant="secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>
                                            Next
                                        </Button>
                                    </div>
                                </div>

                                {/* View Comments Modal */}
                                <Modal show={showViewCommentModal} onHide={() => setShowViewCommentModal(false)} size='lg' >
                                    <Modal.Header closeButton>
                                        <Modal.Title>View Comments</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ height: 'auto', maxHeight: '700px', overflowY: 'scroll' }} >
                                        <ul>
                                            {commentsToView.length > 0 ? (
                                                commentsToView.map((comment, index) => (
                                                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', padding: '10px 0', }} >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                                            <img
                                                                src={comment.user?.image || defaultimage}
                                                                alt="User image"
                                                                className='image_url_default'
                                                                onError={(e) => {
                                                                    e.target.onerror = null; // Prevents infinite loop in case defaultimage also fails
                                                                    e.target.src = defaultimage; // Fallback to default image
                                                                }}
                                                            />

                                                            <div>
                                                                <p className='mb-0'>{comment?.remarks && comment?.remarks ? comment?.remarks : 'No Comments Available'}</p>
                                                                <small> {comment.user?.name && comment.user?.name} </small>
                                                            </div>
                                                        </div>

                                                        <small>
                                                            {`${new Date(comment.createdAt).toDateString()} - ${new Date(comment.createdAt).toLocaleTimeString()}`}
                                                        </small>

                                                    </li>
                                                ))
                                            ) : (
                                                <p>No Comments Available.</p>
                                            )}
                                        </ul>
                                    </Modal.Body>
                                    {/* <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowViewCommentModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer> */}
                                </Modal>

                                {/* Add Comment Modal */}
                                <Modal show={showCommentsModal} onHide={() => setShowCommentsModal(false)} centered size="md">
                                    <Modal.Header closeButton>
                                        <Modal.Title>Comments</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className="comments-section" style={{
                                            height: '100%',
                                            maxHeight: '300px',
                                            overflowY: 'scroll',
                                            padding: '20px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '15px',
                                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                            marginTop: '20px',
                                            position: 'relative'
                                        }}>
                                            {commentsToView.length > 0 ? (
                                                commentsToView.map((comment, index) => (
                                                    <div key={index} className="comment-item" style={{
                                                        display: 'flex',
                                                        flexDirection: comment.user.name === 'CurrentUser' ? 'row-reverse' : 'row', // Align comments differently
                                                        alignItems: 'flex-start',
                                                        marginBottom: '20px',
                                                        animation: 'fadeIn 0.5s ease-in-out'
                                                    }}>
                                                        {/* User Image */}
                                                        <div className="user-image" style={{
                                                            width: '45px',
                                                            height: '45px',
                                                            borderRadius: '50%',
                                                            overflow: 'hidden',
                                                            marginRight: '15px',
                                                            marginLeft: comment.user.name === 'CurrentUser' ? '0' : '15px',
                                                            marginRight: comment.user.name === 'CurrentUser' ? '15px' : '0',
                                                            border: '2px solid #fff',  // Add a border around the image
                                                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' // Slight shadow to create depth
                                                        }}>
                                                            <Image
                                                                src={comment.user?.image ? `/images/${comment.user?.image}` : defaultimage}
                                                                alt="User_image"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </div>

                                                        {/* Comment Text */}
                                                        <div className="comment-text" style={{
                                                            backgroundColor: comment.user.name === 'CurrentUser' ? '#4CAF50' : '#fff', // Different colors for current user
                                                            color: comment.user.name === 'CurrentUser' ? '#fff' : '#333', // Dark text for others, light for current user
                                                            borderRadius: '15px',
                                                            padding: '12px 18px',
                                                            maxWidth: '75%',
                                                            wordWrap: 'break-word',
                                                            boxShadow: comment.user.name === 'CurrentUser' ? '0 2px 10px rgba(0, 128, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                                                            position: 'relative',
                                                            marginBottom: '8px',
                                                            fontSize: '14px',
                                                            lineHeight: '1.5',
                                                        }}>
                                                            <p style={{ margin: '0 0 8px', color: 'inherit' }}>{comment.remarks}</p>

                                                            {/* Comment Author & Time */}
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: comment.user.name === 'CurrentUser' ? '#e0e0e0' : '#888',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                flexDirection: 'column'
                                                            }}>
                                                                <div>
                                                                    <strong>{comment.user.name}</strong>
                                                                </div>

                                                                <div>
                                                                    <p className='mb-0' style={{ fontSize: '12px' }}>
                                                                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            hour12: true
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ fontSize: '14px', color: '#888' }}>No comments yet. Be the first to add one!</p>
                                            )}
                                        </div>


                                        {/* Text area for adding a new comment */}
                                        <Form.Group controlId="commentTextarea" className="mt-3">
                                            <Form.Control
                                                as="textarea"
                                                rows={1}
                                                value={currentComment}
                                                onChange={(e) => setCurrentComment(e.target.value)}
                                                placeholder="Enter your comment here"
                                            />
                                        </Form.Group>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button className='all_single_leads_button' onClick={handleSaveComment}>
                                            Save Comment
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Convert to Lead Confirmation Modal */}
                                <Modal show={showConvertModal} onHide={() => setShowConvertModal(false)} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Confirm Conversion</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure you want to convert this status to Lead?</Modal.Body>
                                    <Modal.Footer>
                                        {/* <Button variant="secondary" onClick={() => setShowConvertModal(false)}>
                            Cancel
                        </Button> */}
                                        <Button className='button_one' onClick={handleConfirmConversion}>
                                            Confirm
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                <Modal
                                    size="lg"
                                    aria-labelledby="contained-modal-title-vcenter"
                                    centered
                                    show={showImportModal} onHide={() => setShowImportModal(false)} style={{ borderRadius: '20px' }}
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>Import CSV</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>

                                            <Form.Group controlId="selectAgent" className="w-100">
                                                <Form.Label>Select Agent</Form.Label>
                                                <Select
                                                    options={allUsers} // Ensure allUsers is defined
                                                    placeholder="Select an agent"
                                                    className="w-100"
                                                    isClearable
                                                    onChange={handleAgentChange}
                                                />
                                            </Form.Group>

                                            {!(role === "Team Leader" || role === "Coordinator") && (
                                                <Form.Group controlId="selectUser" className="w-100">
                                                    <Form.Label>Select Team Leader / Coordinator</Form.Label>
                                                    <Select
                                                        options={userRoleOptions}
                                                        placeholder="Select a team leader or coordinator"
                                                        className="w-100"
                                                        isClearable
                                                        isMulti
                                                        onChange={handleUserChange}
                                                    />
                                                </Form.Group>
                                            )}

                                            <Form.Group controlId="csvFile">
                                                <Form.Label>Upload CSV</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleFileChange}
                                                />
                                                {error && <Form.Text className="text-danger">{error}</Form.Text>}
                                            </Form.Group>

                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>

                                        <Button className='button_one' onClick={handleImportSubmit}>
                                            Upload
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Skip and Inserted Numbers */}
                                <Modal
                                    size="lg"
                                    aria-labelledby="contained-modal-title-vcenter"
                                    centered
                                    show={insertSkipNumber}
                                    onHide={() => setInsertSkipNumber(false)}
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title id="contained-modal-title-vcenter">
                                            Phonebook entries
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <h5 className="text-success">{message}</h5> {/* Display the message */}

                                        <div className="d-flex mt-4">
                                            <div className="w-50 pe-3">
                                                <h5>Inserted Numbers</h5>
                                                {insertedNumbers.length > 0 ? (
                                                    <ListGroup>
                                                        {insertedNumbers.map((number, index) => (
                                                            <ListGroup.Item key={index}>{number}</ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                ) : (
                                                    <p>No numbers were inserted.</p>
                                                )}
                                            </div>
                                            <div className="w-50 ps-3">
                                                <h5>Skipped Numbers</h5>
                                                {skippedNumbers.length > 0 ? (
                                                    <ListGroup>
                                                        {skippedNumbers.map((number, index) => (
                                                            <ListGroup.Item key={index}>{number}</ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                ) : (
                                                    <p>No numbers were skipped.</p>
                                                )}
                                            </div>
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button className='all_close_btn_container' onClick={() => setInsertSkipNumber(false)}>Close</Button>
                                    </Modal.Footer>
                                </Modal>

                            </div>
                        </Card>
                    </Col>
                </Row>

                <CreatePhoneBook phoneID={phoneID} getHodPhoneBookData={getHodPhoneBookData} phoneBookModal={phoneBookModal} setPhoneBookModal={setPhoneBookModal} phoneBookNumber={phoneBookNumber} setPhoneBookNumber={setPhoneBookNumber} />

            </Container>
        </>
    );
};

export default HodPhoneBook;
