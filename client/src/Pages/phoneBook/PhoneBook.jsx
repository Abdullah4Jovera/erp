import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Modal, Button, Form, Dropdown, Row, Col, Container, Card, Image, } from 'react-bootstrap';
import { MdAdd } from 'react-icons/md';
import axios from 'axios';
import { AiOutlineEye } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import defaultimage from '../../Assets/default_image.jpg'
import Navbar from '../../Components/navbar/Navbar';
import { useSelector } from 'react-redux';
import Sidebar from '../../Components/sidebar/Sidebar';
import './phoneBookstyle.css'
import Select from 'react-select'
import CreatePhoneBook from './CreatePhoneBook';
import { IoOpenOutline } from "react-icons/io5";

const PhoneBook = () => {
    const navigate = useNavigate();
    const token = useSelector(state => state.loginSlice.user?.token);
    const role = useSelector(state => state.loginSlice.user?.role)

    const [phonebookData, setPhonebookData] = useState([]);
    const [filteredPhonebookData, setFilteredPhonebookData] = useState([]);
    const [showAddCommentModal, setShowAddCommentModal] = useState(false);
    const [showViewCommentModal, setShowViewCommentModal] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [commentsToView, setCommentsToView] = useState([]);
    const [dropdownEntry, setDropdownEntry] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCalStatus, setSearchCalStatus] = useState(''); // State for selected calstatus filter
    const [phoneBookModal, setPhoneBookModal] = useState(false)
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [phoneBookNumber, setPhoneBookNumber] = useState('')
    const [phoneID, setPhoneID] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // State for handling the conversion confirmation modal
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState(null);

    // useEffect(() => {
    //     const userData = localStorage.getItem('phoneUserData');
    //     if (!userData) {
    //         navigate('/');
    //     }
    // }, [navigate]);

    const getPhoneNumber = async () => {
        if (token) {
            try {
                const response = await fetch(`/api/phonebook/get-all-phonebook`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });


                if (response.ok) {
                    const data = await response.json();
                    // Sort data by updatedAt in descending order
                    const sortedData = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    console.log(sortedData, 'response')

                    setPhonebookData(sortedData);
                    setFilteredPhonebookData(sortedData); // Initialize filtered data
                } else {
                    console.error('Failed to fetch phonebook data:', response.status);
                }
            } catch (error) {
                console.error('Error fetching phonebook data:', error);
            }
        } else {
            navigate('/');
        }
    };

    useEffect(() => {
        getPhoneNumber();
    }, [token]);

    // Update filtered data based on search queries
    useEffect(() => {
        const filteredData = phonebookData.filter(entry => {
            const isNumberMatch = entry.number.includes(searchQuery);
            const isStatusMatch = searchCalStatus === '' || entry.calstatus === searchCalStatus;
            return isNumberMatch && isStatusMatch;
        });

        setFilteredPhonebookData(filteredData);
        setCurrentPage(1); // Reset to first page after filtering
    }, [searchQuery, searchCalStatus, phonebookData]);

    const handleAddCommentClick = (entry) => {
        setSelectedEntry(entry);
        setCurrentComment(entry.comment || '');
        setShowAddCommentModal(true);
    };

    const handleViewCommentsClick = (entry) => {
        setSelectedEntry(entry);
        setCommentsToView(entry.comments || []);
        setShowViewCommentModal(true);
    };

    // Add Comment API
    // const handleSaveComment = async () => {
    //     if (selectedEntry) {
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

    //                 const updatedData = phonebookData.map((entry) =>
    //                     entry._id === selectedEntry._id ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment }] } : entry
    //                 );
    //                 // Re-sort updated data by updatedAt
    //                 const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    //                 setPhonebookData(sortedUpdatedData);
    //                 setFilteredPhonebookData(sortedUpdatedData);
    //             } else {
    //                 navigate('/');
    //             }
    //         } catch (error) {
    //             console.error('Error saving comment:', error);
    //         }
    //     }
    //     setShowAddCommentModal(false);
    // };

    const handleCallStatusChange = (status) => {
        if (status === 'Convert to Lead') {
            setPendingStatusChange(status);
            setShowConvertModal(true);
        } else {
            updateCallStatus(status);
        }
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

                    const updatedData = phonebookData.map((entry) =>
                        entry._id === dropdownEntry._id ? { ...entry, calstatus: status } : entry
                    );
                    // Re-sort updated data by updatedAt
                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setPhonebookData(sortedUpdatedData);
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

    const handleConfirmConversion = () => {
        updateCallStatus(pendingStatusChange);
        getPhoneNumber();
    };

    // Define options for the dropdown
    const options = [
        { value: 'Interested', label: 'Interested' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'No Answer', label: 'No Answer' }, // Ensure this matches your data
        { value: 'Not Interested', label: 'Not Interested' }, // Ensure this matches your data
    ];

    const HandleCreatePhoneBook = async (num, id) => {
        setPhoneBookModal(true)
        setPhoneBookNumber(num)
        setPhoneID(id)
    }

    // Calculating indices for current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPhonebookData.slice(indexOfFirstItem, indexOfLastItem);

    // Handling page change
    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredPhonebookData.length / itemsPerPage)) {
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
                    const updatedData = phonebookData.map(entry =>
                        entry._id === selectedEntry._id
                            ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment, createdAt: new Date() }] }
                            : entry
                    );

                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    getPhoneNumber();
                    setPhonebookData(sortedUpdatedData);
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
        <div>
            {/* <Navbar /> */}
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards'>
                            <div className="phonebook-container mt-3">
                                <div className="search-bar-container mb-4" style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}  >
                                    <Form.Group controlId="searchBar" className="w-100">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by Number"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Select
                                        options={options}
                                        value={options.find(option => option.value === searchCalStatus)}
                                        onChange={(selectedOption) => setSearchCalStatus(selectedOption?.value || '')}
                                        placeholder="Search by Call Status"
                                        isClearable
                                        className="w-100"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                textAlign: 'center',
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                textAlign: 'center',
                                            }),
                                        }}
                                    />
                                </div>

                                {filteredPhonebookData.length > 0 ? (
                                    <Table hover bordered responsive className='mt-3 table_main_container' size='md'>
                                        <thead style={{ backgroundColor: '#f8f9fd' }}>
                                            <tr className="teble_tr_class" style={{ backgroundColor: '#e9ecef', color: '#343a40', borderBottom: '2px solid #dee2e6', transition: 'background-color 0.3s ease' }}>
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Number</th>
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Status</th>
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Call Status</th>
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((entry, index) => (
                                                <tr key={index}>
                                                    <td className='table_td_class'>{entry.number}</td>
                                                    <td className='table_td_class'>{entry.status}</td>
                                                    <td
                                                        className='table_td_class'
                                                        style={{
                                                            textAlign: 'center',
                                                            backgroundColor: entry.calstatus === 'No Answer' ? 'green' : entry.calstatus === 'Not Interested' ? 'red' : 'transparent',
                                                            color: entry.calstatus === 'No Answer' || entry.calstatus === 'Not Interested' ? 'white' : 'inherit'
                                                        }}
                                                    >
                                                        {entry.calstatus}
                                                    </td>
                                                    <td style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                                                        <div className='editAction'>
                                                            <FiEdit2
                                                                onClick={() => setDropdownEntry(entry)}
                                                                style={{ fontSize: '12px', cursor: 'pointer', color: 'white' }}
                                                            />
                                                            <div className="tooltip">Edit Status</div>
                                                        </div>
                                                        <div className='addAction'>
                                                            <MdAdd
                                                                style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                onClick={() => handleCommentsClick(entry)}
                                                            />
                                                            <div className="tooltip">View/Add Comments</div>
                                                        </div>
                                                        {/* <div className='viewAction'>
                                                            <AiOutlineEye onClick={() => handleViewCommentsClick(entry)} style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }} />
                                                            <div className="tooltip">View Comments</div>
                                                        </div> */}
                                                        <div className='viewAction'>
                                                            <IoOpenOutline onClick={() => HandleCreatePhoneBook(entry.number, entry._id)} style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }} />
                                                            <div className="tooltip">Create Lead</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                ) : (
                                    <p style={{ textAlign: 'center' }} className='mt-5' >No Data Available</p>
                                )}
                            </div>

                            {/* Pagination Controls */}
                            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn btn-secondary">
                                    Previous
                                </button>
                                <span style={{ margin: '0 10px' }}>Page {currentPage} of {Math.ceil(filteredPhonebookData.length / itemsPerPage)}</span>
                                <button onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredPhonebookData.length / itemsPerPage)} className="btn btn-secondary">
                                    Next
                                </button>
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

                        {/* View Comments Modal */}
                        <Modal show={showViewCommentModal} onHide={() => setShowViewCommentModal(false)} size='lg' >
                            <Modal.Header closeButton>
                                <Modal.Title>View Comments</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ height: 'auto', maxHeight: '700px', overflowY: 'scroll' }}>
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
                                                        <small> {comment.user?.name && comment.user?.name ? comment.user.name : 'Unknown User'} </small>
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
                        </Modal>

                        {/* Convert to Lead Confirmation Modal */}
                        <Modal show={showConvertModal} onHide={() => setShowConvertModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirm Conversion</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>Are you sure you want to convert this status to Lead?</Modal.Body>
                            <Modal.Footer>
                                <Button className='all_close_btn_container' onClick={() => setShowConvertModal(false)}>
                                    Cancel
                                </Button>
                                <Button className='all_single_leads_button' onClick={handleConfirmConversion}>
                                    Confirm
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>

                <CreatePhoneBook phoneID={phoneID} getPhoneNumber={getPhoneNumber} phoneBookModal={phoneBookModal} setPhoneBookModal={setPhoneBookModal} phoneBookNumber={phoneBookNumber} setPhoneBookNumber={setPhoneBookNumber} />
            </Container>
        </div>
    );
};

export default PhoneBook;
