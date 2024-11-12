import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Table, Modal, Button, Container, Form, Spinner, Dropdown, Row, Col, Card, Image } from 'react-bootstrap';
import { GrView } from 'react-icons/gr';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from "react-icons/fi";
import defaultimage from '../../Assets/default_image.jpg'
import DatePicker from 'react-datepicker'; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from 'react-redux';
import Navbar from '../../Components/navbar/Navbar';
import Sidebar from '../../Components/sidebar/Sidebar';
import './phoneBookstyle.css'
import CreatePhoneBook from './CreatePhoneBook';
import { IoOpenOutline } from "react-icons/io5";

const CEOphoneBook = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [ceoPhoneBookData, setCeoPhoneBookData] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCalStatus, setSelectedCalStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showViewCommentModal, setShowViewCommentModal] = useState(false);
    const [commentsToView, setCommentsToView] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [currentComment, setCurrentComment] = useState('');
    const [filteredPhonebookData, setFilteredPhonebookData] = useState([]);
    const [showAddCommentModal, setShowAddCommentModal] = useState(false);
    const [dropdownEntry, setDropdownEntry] = useState(null);
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [startDate, setStartDate] = useState(null); // New state for start date
    const [endDate, setEndDate] = useState(null); // New state for end date
    const navigate = useNavigate();
    const [phoneBookModal, setPhoneBookModal] = useState(false)
    const [phoneBookNumber, setPhoneBookNumber] = useState('')
    const [phoneID, setPhoneID] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [comments, setComments] = useState([]);
    const entriesPerPage = 13;

    const leadsPerPage = 9;
    const pagesToShow = 5;

    const calStatusOptions = [
        { value: 'Interested', label: 'Interested' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'No Answer', label: 'No Answer' }, // Ensure this matches your data
        { value: 'Not Interested', label: 'Not Interested' }, // Ensure this matches your data
    ];


    const fetchData = async () => {
        try {
            if (!token) {
                throw new Error('Token not found');
            }

            const [pipelinesResponse, usersResponse, phoneBookResponse] = await Promise.all([
                axios.get(`/api/pipelines/get-pipelines`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get(`/api/users/get-users`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get(`/api/phonebook/get-all-phonebook`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            setPipelines((pipelinesResponse.data || []).map(pipeline => ({
                value: pipeline._id,
                label: pipeline.name,
            })));

            setUsers((usersResponse.data || []).map(user => ({
                ...user,
                pipelines: (user.pipeline || []).map(p => p._id), // Flatten pipelines to IDs
            })));

            const sortedData = (phoneBookResponse.data || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setCeoPhoneBookData(sortedData);
            setFilteredData(sortedData);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // This useEffect will filter users based on selectedPipeline
    useEffect(() => {
        if (selectedPipeline) {
            const pipelineUsers = users.filter(user => user.pipelines.includes(selectedPipeline.value));
            setFilteredUsers(pipelineUsers);
        } else {
            setFilteredUsers(users);
        }
    }, [selectedPipeline, users]);

    // This useEffect will handle all filtering logic
    useEffect(() => {
        let filtered = ceoPhoneBookData;

        // Apply filters based on selected options
        if (selectedPipeline) {
            filtered = filtered.filter(entry => entry.pipeline._id === selectedPipeline.value);
        }

        if (selectedUser) {
            filtered = filtered.filter(entry => entry.user?._id === selectedUser.value); // Assuming entry.user is an object
        }

        if (selectedCalStatus) {
            filtered = filtered.filter(entry => entry.calstatus === selectedCalStatus.value);
        }

        if (searchQuery) {
            filtered = filtered.filter(entry => entry.number.toString().toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (startDate && endDate) {
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.updatedAt);
                return entryDate >= startDate && entryDate <= endDate;
            });
        }

        // Set the filtered data based on all active filters
        setFilteredData(filtered);
    }, [selectedPipeline, selectedUser, selectedCalStatus, searchQuery, ceoPhoneBookData, startDate, endDate]);


    if (loading) return (
        <div className="no-results mt-5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spinner animation="grow" style={{ color: 'white' }} role="status"></Spinner>
        </div>
    );

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

                    const updatedData = ceoPhoneBookData.map((entry) =>
                        entry._id === dropdownEntry._id ? { ...entry, calstatus: status } : entry
                    );
                    // Re-sort updated data by updatedAt
                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setCeoPhoneBookData(sortedUpdatedData);
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

    const HandleCreatePhoneBook = async (num, id) => {
        setPhoneBookModal(true)
        setPhoneBookNumber(num)
        setPhoneID(id)
    }

    // Logic to handle pagination
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredData.length / entriesPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
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
                    const updatedData = ceoPhoneBookData.map(entry =>
                        entry._id === selectedEntry._id
                            ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment, createdAt: new Date() }] }
                            : entry
                    );

                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    fetchData();
                    setCeoPhoneBookData(sortedUpdatedData);
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
            {/* <Navbar /> */}
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>

                        <Card className='leads_main_cards'>

                            <div className='mt-4' style={{ display: 'flex', justifyContent: 'end', alignItems: 'end' }} >
                                {/* <Button className='button_two' onClick={() => navigate('/generatereport')} >Call History</Button> */}
                            </div>
                            {/* Filter by pipeline */}
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '10px' }} className='mt-4'>
                                <div className="filter-container w-100">
                                    <label htmlFor="pipeline-filter">Filter by Pipeline</label>
                                    <Select
                                        id="pipeline-filter"
                                        value={selectedPipeline}
                                        onChange={setSelectedPipeline}
                                        options={[{ value: '', label: 'All Pipelines' }, ...pipelines]}
                                        isClearable
                                    />
                                </div>

                                {/* Filter by user */}
                                <div className="filter-container w-100">
                                    <label htmlFor="user-filter">Filter by User</label>
                                    <Select
                                        id="user-filter"
                                        value={selectedUser}
                                        onChange={setSelectedUser}
                                        options={[{ value: '', label: 'Select User' }, ...filteredUsers.map(user => ({ value: user._id, label: user.name }))]}
                                        isClearable
                                    />
                                </div>

                                {/* Filter by call status */}
                                <div className="filter-container w-100">
                                    <label htmlFor="user-filter">Filter by Call Status</label>
                                    <Form.Group controlId="selectCalStatus" className='w-100'>
                                        <Select
                                            options={calStatusOptions}
                                            value={selectedCalStatus}
                                            onChange={setSelectedCalStatus}
                                            placeholder="Select Call Status"
                                            isClearable
                                        />
                                    </Form.Group>
                                </div>
                                {/* Search by Number */}
                                <Form.Group controlId="searchBarNumber" className='w-100'>
                                    <label htmlFor="search-query">Search by Number:</label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by Number"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="filter-container w-100">
                                    <label htmlFor="date-filter">Filter by  Date</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            selectsStart
                                            startDate={startDate}
                                            endDate={endDate}
                                            placeholderText="Start Date"
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control"
                                        />
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            selectsEnd
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={startDate}
                                            placeholderText="End Date"
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                            </div>

                            <Table hover bordered responsive className='mt-3 table_main_container' size='md'>
                                <thead style={{ backgroundColor: '#f8f9fd' }}>
                                    <tr className="teble_tr_class" style={{
                                        backgroundColor: '#e9ecef',
                                        color: '#343a40',
                                        borderBottom: '2px solid #dee2e6',
                                        transition: 'background-color 0.3s ease',
                                    }}>
                                        <th className="equal-width" style={{ backgroundColor: '#f8f9fd' }}>Uploaded by</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">User</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Pipeline</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Number</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Status</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Call Status</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEntries.length > 0 ? (
                                        currentEntries.map((entry, index) => {
                                            console.log(entry, 'entry')
                                            return (
                                                <>
                                                    <tr key={index}>
                                                        <td className='table_td_class'>{entry.uploaded_by.name}</td>
                                                        <td style={{ textAlign: 'center' }} className='table_td_class'>
                                                            {entry.user?.name || 'N/A'}
                                                        </td>
                                                        <td className='table_td_class' style={{ textAlign: 'center' }}>{entry.pipeline?.name || 'N/A'}</td>
                                                        <td className='table_td_class' style={{ textAlign: 'center' }}>{entry.number}</td>
                                                        <td className='table_td_class' style={{ textAlign: 'center' }}>{entry.status}</td>
                                                        <td style={{
                                                            textAlign: 'center',
                                                            backgroundColor: entry.calstatus === 'No Answer' ? 'green' : entry.calstatus === 'Not Interested' ? 'red' : 'transparent',
                                                            color: entry.calstatus === 'No Answer' || entry.calstatus === 'Not Interested' ? 'white' : 'inherit',
                                                        }} className='table_td_class'>
                                                            {entry.calstatus}
                                                        </td>
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

                                                            <div className='addAction'>
                                                                <MdAdd
                                                                    style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                    onClick={() => handleCommentsClick(entry)}
                                                                />
                                                                <div className="tooltip">View/Add Comments</div>
                                                            </div>

                                                            <div className='viewAction'>
                                                                <IoOpenOutline onClick={() => HandleCreatePhoneBook(entry.number, entry._id)} style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }} />
                                                                <div className="tooltip">Create Lead</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center' }}>No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Pagination Controls */}
                            <div style={{ display: 'flex', justifyContent: 'center' }} >
                                <Button className='all_single_leads_button' onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
                                <span>{` Page ${currentPage} of ${totalPages} `}</span>
                                <Button className='all_single_leads_button' onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
                            </div>
                        </Card>

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
                                                flexDirection: comment?.user?.name === 'CurrentUser' ? 'row-reverse' : 'row', // Align comments differently
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
                                                    marginLeft: comment?.user?.name === 'CurrentUser' ? '0' : '15px',
                                                    marginRight: comment?.user?.name === 'CurrentUser' ? '15px' : '0',
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
                                                    backgroundColor: comment.user?.name === 'CurrentUser' ? '#4CAF50' : '#fff', // Different colors for current user
                                                    color: comment.user?.name === 'CurrentUser' ? '#fff' : '#333', // Dark text for others, light for current user
                                                    borderRadius: '15px',
                                                    padding: '12px 18px',
                                                    maxWidth: '75%',
                                                    wordWrap: 'break-word',
                                                    boxShadow: comment.user?.name === 'CurrentUser' ? '0 2px 10px rgba(0, 128, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                                                    position: 'relative',
                                                    marginBottom: '8px',
                                                    fontSize: '14px',
                                                    lineHeight: '1.5',
                                                }}>
                                                    <p style={{ margin: '0 0 8px', color: 'inherit' }}>{comment.remarks}</p>

                                                    {/* Comment Author & Time */}
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: comment.user?.name === 'CurrentUser' ? '#e0e0e0' : '#888',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <div>
                                                            <strong>{comment.user?.name}</strong>
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
                        <Modal show={showConvertModal} onHide={() => setShowConvertModal(false)} centered >
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
                    </Col>
                </Row>
                <CreatePhoneBook fetchData={fetchData} phoneBookModal={phoneBookModal} setPhoneBookModal={setPhoneBookModal} phoneBookNumber={phoneBookNumber} setPhoneBookNumber={setPhoneBookNumber} phoneID={phoneID} />
            </Container>
        </>
    );
};

export default CEOphoneBook;
