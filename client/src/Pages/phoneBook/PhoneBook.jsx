import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Modal, Button, Form, Dropdown, Row, Col, Container, Card, } from 'react-bootstrap';
import { MdAdd } from 'react-icons/md';
import axios from 'axios';
import { AiOutlineEye } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
// import './style.css';
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
    const [phoneBookNumber, setPhoneBookNumber] = useState('')
    const [phoneID, setPhoneID] = useState('')

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

    useEffect(() => {
        // Filter phonebook data based on search queries
        const filteredData = phonebookData.filter(entry => {
            const isNumberMatch = entry.number.includes(searchQuery);
            const isStatusMatch = searchCalStatus === '' || entry.calstatus === searchCalStatus;
            return isNumberMatch && isStatusMatch;
        });

        setFilteredPhonebookData(filteredData);
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
    const handleSaveComment = async () => {
        if (selectedEntry) {
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

                    const updatedData = phonebookData.map((entry) =>
                        entry._id === selectedEntry._id ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment }] } : entry
                    );
                    // Re-sort updated data by updatedAt
                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setPhonebookData(sortedUpdatedData);
                    setFilteredPhonebookData(sortedUpdatedData);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error saving comment:', error);
            }
        }
        setShowAddCommentModal(false);
    };

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
                                            <tr
                                                className="teble_tr_class"
                                                style={{
                                                    backgroundColor: '#e9ecef', // Light background color for the row
                                                    color: '#343a40', // Dark text color
                                                    borderBottom: '2px solid #dee2e6', // Bottom border for rows
                                                    transition: 'background-color 0.3s ease', // Smooth transition for hover effect
                                                }}
                                            >
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Number</th>
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Status</th>
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Call Status</th>
                                                <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Actions</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPhonebookData.map((entry, index) => (
                                                <tr key={index}>
                                                    <td className='table_td_class' >{entry.number}</td>
                                                    <td className='table_td_class' >{entry.status}</td>
                                                    <td
                                                        style={{
                                                            textAlign: 'center',
                                                            backgroundColor: entry.calstatus === 'No Answer' ? 'green' : entry.calstatus === 'Not Interested' ? 'red' : 'transparent',
                                                            color: entry.calstatus === 'No Answer' || entry.calstatus === 'Not Interested' ? 'white' : 'inherit'
                                                        }}
                                                        className='table_td_class'
                                                    >
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
                                                                    <Dropdown.Item onClick={() => handleCallStatusChange('Convert to Lead')}>Convert to Lead</Dropdown.Item>
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
                                                            <MdAdd onClick={() => handleAddCommentClick(entry)} style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }} />
                                                            <div className="tooltip">Add Comments</div>
                                                        </div>
                                                        <div className='viewAction'>
                                                            <AiOutlineEye onClick={() => handleViewCommentsClick(entry)} style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }} />
                                                            <div className="tooltip">View Comments</div>
                                                        </div>

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
                        </Card>

                        {/* Add Comment Modal */}
                        <Modal show={showAddCommentModal} onHide={() => setShowAddCommentModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Add Comment</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group controlId="commentTextarea">
                                    <Form.Label>Comment</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={currentComment}
                                        onChange={(e) => setCurrentComment(e.target.value)}
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowAddCommentModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSaveComment}>
                                    Save
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
                                <Button variant="secondary" onClick={() => setShowConvertModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleConfirmConversion}>
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
