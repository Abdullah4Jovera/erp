import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Dropdown, Menu } from 'antd';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Button, Card, Form, Modal, Image, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Dashboard.css';
import { AiFillDelete } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidLabel } from "react-icons/bi";
import DashboardLabels from '../Components/DashboardLabels';
import { TiDeleteOutline } from "react-icons/ti";
import { RiContractLine } from "react-icons/ri";
import ConvertLead from '../Components/convertLead/ConvertLead';
import { TbTransfer, TbFileDescription } from "react-icons/tb";
import TransferLeads from '../Components/transferLeads/TransferLeads';
import { LuMoveUpLeft } from "react-icons/lu";
import MoveLeads from '../Components/moveLead/MoveLeads';
import { FiEdit2 } from "react-icons/fi";
import EditLead from '../Components/editlead/EditLead';
import default_image from '../Assets/default_image.jpg';
import { IoMdAdd, IoLogoWhatsapp } from "react-icons/io";
import { SiImessage } from "react-icons/si";
import Select from 'react-select';
import WhatsappNotification from '../Components/whatsappNotification/WhatsappNotification';
import CreateLead from '../Components/createLead/CreateLead';
import { RxCross1 } from "react-icons/rx";
import { MdClear } from "react-icons/md";
import rejected_image from '../Assets/rejected_image.png'

const CeoDashboard = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branch = useSelector((state) => state.loginSlice.user?.branch);
    const product = useSelector((state) => state.loginSlice.user?.products);
    const permissions = useSelector(state => state.loginSlice.user?.permissions)
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leads, setLeads] = useState([]);
    const [leadsByStage, setLeadsByStage] = useState({});
    const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || branch || null);
    const [selectedProductId, setSelectedProductId] = useState(localStorage.getItem('selectedProductId') || product || null);
    const [hasFetchedLeads, setHasFetchedLeads] = useState(false);
    const [leadId, setLeadId] = useState(null);
    const defaultBranchName = 'Abu Dhabi';
    const defaultProductName = 'Business Banking';
    const [searchQuery, setSearchQuery] = useState(''); // Search state
    const [rejectedLeadModal, setRejectedLeadModal] = useState(false)
    const [labelsDashboardModal, setLabelsDashBoardModal] = useState(false)
    const [contractModal, setContractModal] = useState(false)
    const [leadtocontract, setLeadToContract] = useState(false)
    const [transferModal, setTransferModal] = useState(false);
    const [moveLeadModal, setMoveLeadModal] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [userModal, setUserModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // Changed to an array for multiple users
    const [openLeadDescriptionModal, setOpenLeadDescriptionModal] = useState(false)
    const [pipelineUsers, setPipelineUsers] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedLeadUsers, setSelectedLeadUsers] = useState([]);
    const [selectedLeadDiscussion, setSelectedDiscussion] = useState([])
    const [leadDiscussionModal, setLeadDiscussionModal] = useState(false)
    const textareaRef = useRef(null);
    const [discussionText, setDiscussionText] = useState('');
    const [clientId, setClientId] = useState('')
    const [whtsappModal, setWhatsAppModal] = useState(false)
    const [userError, setUserError] = useState('')
    const [leadTransferMessageModal, setLeadTransferMessageModal] = useState(false)
    const [selectedTransferForm, setSelectedTransferForm] = useState('')
    const [modal2Open, setModal2Open] = useState(false);
    const [isFetchingLeads, setIsFetchingLeads] = useState(false);
    const [productStageError, setProductStageError] = useState('')
    const [productStageModal, setProductStageModal] = useState(false)
    const [rejectLead, setRejectLead] = useState('')
    const [rejectReasonErrorMessage, setRejectReasonErrorMessage] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [phoneNumberSuccess, setPhoneumberSuccess] = useState(false)
    const [apiData, setApiData] = useState(null);

    // New Data
    const [selectedLeadType, setSelectedLeadType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [createdAtStart, setCreatedAtStart] = useState('');
    const [createdAtEnd, setCreatedAtEnd] = useState('');
    const [pipelines, setPipelines] = useState([]); // State for pipelines
    const [sources, setSources] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [users, setUsers] = useState([]);
    // const [selectedUsers, setSelectedUsers] = useState('');
    const [leadTypes, setLeadTypes] = useState([]);
    // New Data
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = selectedLeadType
                    ? await axios.get(`/api/sources/${selectedLeadType.value}`)
                    : await axios.get(`/api/sources/get/get-sources`);

                setSources(response.data);
            } catch (error) {
                console.error('Error fetching sources:', error);
            }
        };

        fetchSources();
    }, [selectedLeadType]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (selectedProductId) {
                try {
                    const response = await axios.get(`/api/users/get-users-by-product/${selectedProductId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            } else {
                setUsers([]);
            }
        };

        fetchUsers();
    }, [selectedProductId]);

    useEffect(() => {
        const fetchPipelines = async () => {
            if (selectedBranchId === '6719fdded3de53c9fb53fb79') {
                setPipelines([
                    {
                        _id: '6719fda75035bf8bd708d024',
                        name: 'Ajman Branch'
                    }
                ]);
            } else if (selectedProductId) {
                try {
                    const response = await axios.get(`/api/products/${selectedProductId}`);
                    const pipelinesData = response.data.pipeline_id || [];
                    setPipelines(pipelinesData);
                } catch (error) {
                    console.error('Error fetching pipelines:', error);
                }
            } else {
                setPipelines([]);
            }
        };

        fetchPipelines();
    }, [selectedProductId, selectedBranchId]);

    const handleClearFilters = () => {
        setSelectedPipeline(null);
        setSelectedUsers([]);
        setSelectedLeadType(null);
        setSelectedSource(null);
        setCreatedAtStart('');
        setCreatedAtEnd('');
        fetchLeads(selectedProductId, selectedBranchId);
    };

    const handleSearch = async () => {
        try {
            // alert('working')
            const response = await axios.get(`/api/leads/search-leads`, {
                params: {
                    pipeline: selectedPipeline?.value,
                    userId: selectedUsers.value,
                    created_at_start: createdAtStart,
                    created_at_end: createdAtEnd,
                    products: selectedProductId,
                    lead_type: selectedLeadType?.value,
                    source: selectedSource?.value,

                    branch: selectedBranchId,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLeads(response.data.leads);
            organizeLeadsByStage(response.data.leads);
        } catch (error) {
            console.error('Error searching leads:', error);
        }

    };
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const debouncedSearch = debounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [selectedBranchId, selectedProductId, selectedPipeline, selectedUsers, selectedLeadType, selectedSource, createdAtStart, createdAtEnd]);

    // END data

    const canEditLead = permissions?.includes('edit_lead');
    const canMoveLead = permissions?.includes('move_lead');
    const canTransferLead = permissions?.includes('transfer_lead');
    const canRejectLead = permissions?.includes('reject_lead');
    const canAddUserLead = permissions?.includes('add_user_lead');
    const canContractLead = permissions?.includes('convert_lead');
    const canLabelLead = permissions?.includes('lead_labels');

    const getProductID = localStorage.getItem('selectedProductId')
    const getBranchID = localStorage.getItem('selectedBranchId')

    useEffect(() => {
        const fetchBranchesAndProducts = async () => {
            try {
                const branchResponse = await axios.get(`/api/branch/get-branches`
                    , {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                const productResponse = await axios.get(`/api/products/get-all-products`
                    , {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                const leadtypeResponse = await axios.get(`/api/leadtypes/get-all-leadtypes`)

                setBranches(branchResponse.data);
                setProducts(productResponse.data);
                setLeadTypes(leadtypeResponse.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBranchesAndProducts();
    }, [token]);

    useEffect(() => {
        const branchId = selectedBranchId || branches.find(b => b.name === defaultBranchName)?._id;
        const productId = selectedProductId || products.find(p => p.name === defaultProductName)?._id;

        if (branchId && productId && !hasFetchedLeads && token) {
            fetchLeads(productId, branchId);
            fetchProductStages(productId);
            setSelectedBranchId(branchId);
            setSelectedProductId(productId);
            setHasFetchedLeads(true);
        }
    }, [selectedBranchId, selectedProductId, token, branch, product, branches, products, hasFetchedLeads]);

    const fetchLeads = async (productId, branchId) => {
        setIsFetchingLeads(true);
        try {
            const response = await axios.get(`/api/leads/get-leads/${productId}/branch/${branchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setLeads(response.data);
            organizeLeadsByStage(response.data);
        } catch (err) {
            setError(err.message);
        }
        finally {
            setIsFetchingLeads(false); // Stop loading
        }
    };


    const fetchProductStages = async (productId) => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            const response = await axios.get(`/api/productstages/${productId}`, { headers });
            setStages(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const organizeLeadsByStage = (leads) => {
        const organizedLeads = {};

        leads.forEach(lead => {
            const stageId = lead.product_stage._id;
            if (!organizedLeads[stageId]) {
                organizedLeads[stageId] = {
                    stageName: lead.product_stage.name,
                    leads: []
                };
            }
            organizedLeads[stageId].leads.push(lead);
        });

        setLeadsByStage(organizedLeads);
    };

    const handleBranchSelect = (branchId) => {
        setSelectedBranchId(branchId);
        localStorage.setItem('selectedBranchId', branchId);
        if (selectedProductId) {
            fetchLeads(selectedProductId, branchId);
        }
    };

    const handleProductSelect = (productId) => {
        setSelectedProductId(productId);
        localStorage.setItem('selectedProductId', productId);
        setSelectedPipeline('');
        setSelectedUsers('');
        fetchProductStages(productId);
        if (selectedBranchId) {
            fetchLeads(productId, selectedBranchId);
        }
    };

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

    const draggableCardHandler = async (leadId, newStageId) => {
        try {
            await axios.put(
                `/api/leads/update-product-stage/${leadId}`,
                { newProductStageId: newStageId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchLeads(selectedProductId, selectedBranchId); // Refresh leads
        } catch (error) {
            setProductStageModal(true)
            setProductStageError(`${error?.response?.data?.message} to Move Lead`)

            setTimeout(() => {
                setProductStageModal(false)
            }, 3000)
        }
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Check if dropped outside any droppable area
        if (!destination) return;

        const sourceStageId = source.droppableId;
        const destinationStageId = destination.droppableId;

        // If dropped in the same stage, do nothing
        if (sourceStageId === destinationStageId) return;

        // Call handler to update lead's stage in backend
        draggableCardHandler(draggableId, destinationStageId);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spinner animation="grow" />
        </div>;
    }

    const openRejectedLead = (id) => {
        setLeadId(id)
        setRejectedLeadModal(true)
    }

    const openLabelsLead = (id) => {
        setLeadId(id)
        setLabelsDashBoardModal(true)
    }

    const openLeadConvertModal = (id) => {
        setLeadId(id);
        setContractModal(true)
    }

    const openTransferLeadModal = (id) => {
        setLeadId(id);
        setTransferModal(true);
    };

    const openMoveLeadModal = (id) => {
        setLeadId(id);
        setMoveLeadModal(true);
    };

    const openModal = (id) => {
        setLeadId(id);
        setModalShow(true);
    };

    const TransferMessageModal = (lead) => {
        setSelectedTransferForm(lead)
        setLeadTransferMessageModal(true)
    }

    // Show modal with lead Discussion
    const showLeadDiscussion = (lead) => {
        setSelectedDiscussion(lead)
        setLeadDiscussionModal(true)
    }

    const openWhtsappModal = (id, clientId) => {
        setLeadId(id);
        setClientId(clientId)
        setWhatsAppModal(true);
    }

    // Show modal with lead details
    const showLeadDetails = (lead) => {
        setSelectedLead(lead); // Set the selected lead
        setOpenLeadDescriptionModal(true)
    };

    // Add User
    const AddUser = async () => {
        setUserError('');

        // Ensure there are selected users
        if (!selectedLeadUsers || selectedLeadUsers.length === 0) {
            setUserError('Please select at least one user before submitting.');
            return;
        }

        try {
            // Extract the lead ID
            const leadId = selectedLead ? selectedLead._id : null;
            if (!leadId) {
                setUserError('No lead selected.');
                return;
            }

            // Loop through selected users and add them to the lead
            for (const user of selectedLeadUsers) {
                await axios.put(
                    `/api/leads/add-user-to-lead/${leadId}`, // Use the lead ID
                    {
                        userId: user.value, // Send user ID
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Ensure token is passed in headers
                        },
                    }
                );
            }

            // Clear the selection and close the modal
            setSelectedLeadUsers([]);
            setUserModal(false);
        } catch (error) {
            setUserError(error.response.data.message && error.response.data.message);
        }
    };

    // Function to handle the modal opening for a specific lead
    const handleAddUserClick = (leadId) => {
        // Find the lead based on the leadId
        const lead = leads.find((lead) => lead._id === leadId);

        // Set the selected lead and its users
        setSelectedLead(lead);
        setSelectedLeadUsers(selectedUsers[leadId] || []); // Using the selectedUsers map

        const filteredUsers = allUsers.filter(user =>
            user.pipeline?.[0]?._id === lead.pipeline_id?._id
        );
        setPipelineUsers(filteredUsers); // Store the filtered users in state

        // Open the modal
        setUserModal(true);
    };


    // Add Discussion
    const sendDiscussionMessage = async () => {
        if (!discussionText.trim()) {
            setError('Please Enter a Comment.');
            return;
        }

        try {
            await axios.post(`/api/leads/add-discussion/${selectedLeadDiscussion._id}`, {
                comment: discussionText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDiscussionText('');
            fetchLeads(getProductID, getBranchID);
        } catch (error) {
            console.log(error, 'err');
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value;
        setDiscussionText(value);

        if (value.trim()) {
            setError('');
        }
    };

    const RejectedLead = async (id) => {
        try {
            await axios.put(`/api/leads/reject-lead/${leadId}`, {
                reject_reason: rejectLead
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setRejectedLeadModal(false)
            setRejectReasonErrorMessage('')
            fetchLeads(getProductID, getBranchID)
        } catch (error) {
            setRejectReasonErrorMessage(error.response.data.message)
            setTimeout(() => {
                setRejectReasonErrorMessage(false);
            }, 3000)
        }
    }

    const renderMenu = (lead) => (
        <Menu style={{ padding: '10px 20px', inset: '0px 0px auto auto', display: 'flex', gap: '5px', flexDirection: 'column' }} >
            {
                canEditLead && canEditLead ? <>
                    <Menu.Item key="edit" onClick={() => openModal(lead._id)}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                            <FiEdit2 style={{ color: '#95630d', fontSize: '16px' }} /> <span>Edit</span>
                        </div>
                    </Menu.Item>
                </>
                    :
                    null
            }

            {
                canMoveLead && canMoveLead ? <>
                    <Menu.Item key="move" onClick={() => openMoveLeadModal(lead._id)}>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                            <LuMoveUpLeft style={{ color: '#95630d', fontSize: '16px' }} /> <span>Move</span>
                        </div>
                    </Menu.Item>
                </>
                    :
                    null
            }

            {
                canTransferLead && canTransferLead ? <>
                    <Menu.Item key="transfer" onClick={() => openTransferLeadModal(lead._id)}>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                            <TbTransfer style={{ color: '#6c757d', fontSize: '16px' }} /> <span>Transfer</span>
                        </div>
                    </Menu.Item>
                </>
                    :
                    null
            }

            {
                canRejectLead && canRejectLead ? <>
                    <Menu.Item key="reject" onClick={() => openRejectedLead(lead._id)}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                            <AiFillDelete style={{ color: 'red', fontSize: '16px' }} />  <span>Reject</span>
                        </div>
                    </Menu.Item>
                </>
                    :
                    null
            }

            {
                canContractLead && canContractLead ? <>
                    <Menu.Item key="convert" onClick={() => openLeadConvertModal(lead._id)}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                            <RiContractLine style={{ color: '#6fd943', fontSize: '16px' }} /> <span>Contract</span>
                        </div>
                    </Menu.Item>
                </>
                    :
                    null
            }

            {
                canLabelLead && canLabelLead ? <>
                    <Menu.Item key="labels" onClick={() => openLabelsLead(lead._id)}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                            <BiSolidLabel style={{ color: '#ff3a6e', fontSize: '16px' }} />
                            <span>
                                Labels
                            </span>
                        </div>
                    </Menu.Item>
                </>
                    :
                    null
            }
        </Menu>
    );

    // Custom styles for the select dropdown
    const customStyles = {
        menu: (provided) => ({
            ...provided,
            maxHeight: 120, // Limit height to show only 2 or 3 options
            overflowY: 'hidden', // Hide scrollbar in the menu container
            padding: 0, // Remove padding
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: 120, // Set the same max height to the menuList
            overflowY: 'auto', // Enable scrolling
            paddingRight: '8px', // Add padding to make room for the scrollbar
            '::-webkit-scrollbar': {
                width: '6px', // Set scrollbar width
            },
            '::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc', // Style the scrollbar thumb
                borderRadius: '4px', // Make the scrollbar thumb rounded
            },
            '::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#aaa', // Change color on hover for better visibility
            },
        }),
        control: (provided) => ({
            ...provided,
            minHeight: 38, // Set the minimum height of the control
        }),
    };

    const handlePhoneInputChange = async (e) => {
        let inputValue = e.target.value;

        // Validation and formatting
        let processedValue = inputValue.replace(/^\+971\s?/, '').replace(/^0+/, '');
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9); // Keep only digits
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'); // Format the number

        setPhoneNumber(formattedValue); // Update state with formatted number

        // If no digits are left after processing, return early
        if (digitsOnly.length === 0) {
            return; // Optionally, add a message to inform the user if needed
        }

        // Concatenate +971 with the processed phone number for the payload
        const payloadPhone = `+971${digitsOnly}`;

        try {
            const response = await axios.post(`/api/leads/check-client-phone`, {
                clientPhone: payloadPhone, // Use the concatenated phone number for API call
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Handle the response as needed
            const responseData = response.data[0];
            setApiData(responseData); // Save the first object in state

            // Check if apiData exists and if the phone number matches
            if (responseData && responseData.client && responseData.client.phone === payloadPhone) {
                setPhoneumberSuccess(true)
            }
        } catch (error) {
            console.error('Error checking client phone:', error);
            // Handle error accordingly (e.g., show an error message)
        }
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

                            {/* <div className='mb-3 lead_search_container '  > */}
                            <div className="lead-search mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }} >
                                <div>
                                    <Select
                                        id="pipeline"
                                        value={selectedPipeline}
                                        onChange={setSelectedPipeline}
                                        options={pipelines.map((pipeline) => ({ value: pipeline._id, label: pipeline.name }))}
                                        placeholder="Select Pipeline"
                                    />
                                </div>

                                <div>
                                    <Select
                                        id="users"
                                        value={selectedUsers}
                                        onChange={setSelectedUsers}
                                        options={users.map((user) => ({ value: user._id, label: user.name }))}
                                        // isMulti
                                        placeholder="Select Users"
                                        styles={customStyles}

                                    />
                                </div>
                                <div>
                                    <Select
                                        id="lead_type"
                                        value={selectedLeadType}
                                        onChange={setSelectedLeadType}
                                        options={leadTypes.map((leadType) => ({ value: leadType._id, label: leadType.name }))}
                                        placeholder="Select Lead Type"
                                    />
                                </div>
                                <div>
                                    <Select
                                        id="source"
                                        value={selectedSource}
                                        onChange={setSelectedSource}
                                        options={sources.map((source) => ({ value: source._id, label: source.name }))}
                                        placeholder="Select Source"
                                        styles={customStyles}

                                    />
                                </div>

                                <div>
                                    <Form.Control type="text" placeholder="Search By Number" value={phoneNumber} name='phoneNumber' onChange={handlePhoneInputChange} />
                                </div>

                                <div>
                                    <Form.Control
                                        type="date"
                                        id="created_at_start"
                                        value={createdAtStart}
                                        onChange={(e) => setCreatedAtStart(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Form.Control
                                        type="date"
                                        id="created_at_end"
                                        value={createdAtEnd}
                                        onChange={(e) => setCreatedAtEnd(e.target.value)}
                                        placeholder='End Date'
                                        className='date_picker'
                                    />
                                </div>

                                <div style={{ cursor: 'pointer' }} className='clear_filter_btn' onClick={handleClearFilters}>
                                    <MdClear style={{ color: 'white', fontSize: '25px' }} />
                                </div>
                            </div>


                            <Row>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', justifyContent: 'flex-end' }}>
                                    <Form>
                                        <Form.Group controlId="searchLeads">
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by Client Name"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Form>
                                    <div className="create_lead_icon">
                                        <IoMdAdd
                                            style={{ fontSize: '24px', cursor: 'pointer' }}
                                            onClick={() => setModal2Open(true)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='mt-3' >
                                    {!branch && (
                                        <div className="">
                                            {branches.length > 0 ? (
                                                branches.map((branch) => (
                                                    <Button
                                                        key={branch._id}
                                                        className={`button ${selectedBranchId === branch._id ? 'selected' : ''}`}
                                                        style={{
                                                            backgroundColor: selectedBranchId === branch._id ? '#ffa000' : '#000',
                                                            color: selectedBranchId === branch._id ? 'white' : 'white',
                                                            border: 'none'
                                                        }}
                                                        onClick={() => handleBranchSelect(branch._id)}
                                                    >
                                                        {branch.name}
                                                    </Button>
                                                ))
                                            ) : (
                                                <p>No branches available</p>
                                            )}
                                        </div>
                                    )}

                                    {!product && (
                                        <>
                                            <div>
                                                {products.length > 0 ? (
                                                    products.map((product) => (
                                                        <Button
                                                            key={product._id}
                                                            className={`button ${selectedProductId === product._id ? 'selected' : ''}`}
                                                            onClick={() => handleProductSelect(product._id)}
                                                            style={{
                                                                backgroundColor: selectedProductId === product._id ? '#ffa000' : '#000',
                                                                color: selectedProductId === product._id ? 'white' : 'white',
                                                                border: 'none',
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Button>
                                                    ))
                                                ) : (
                                                    <p>No products available</p>
                                                )}
                                            </div>

                                        </>
                                    )}

                                </div>

                            </Row>

                            {isFetchingLeads ? ( // Show spinner while fetching leads
                                <div className="text-center my-5">
                                    <Spinner animation="grow" role="status"></Spinner>
                                </div>
                            ) : (

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <div className="stages-wrapper d-flex overflow-auto mt-3" style={{ maxHeight: '70vh', overflowX: 'auto' }}>
                                        {Array.isArray(stages) && stages.length > 0 ? (
                                            // Sort stages by the 'order' field before rendering
                                            stages
                                                .sort((a, b) => a.order - b.order)
                                                .map((stage) => (
                                                    <Droppable key={stage._id} droppableId={stage._id}>
                                                        {(provided) => (
                                                            <Card
                                                                className="stage-card"
                                                                style={{ minWidth: '300px', margin: '0 7px', height: 'auto', borderRadius: '20px', }}
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                            >
                                                                <h5 className='sticky-top stageNames' style={{ backgroundColor: 'black', color: 'white', textAlign: 'center', fontSize: '16px', padding: '15px 0px' }} >
                                                                    {stage.name}
                                                                    {leadsByStage[stage._id]?.leads.length > 0 && (
                                                                        <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px', color: 'white', textAlign: 'center' }}>
                                                                            ({leadsByStage[stage._id].leads.length})
                                                                        </span>
                                                                    )}
                                                                </h5>

                                                                {leadsByStage[stage._id] ? (
                                                                    leadsByStage[stage._id].leads
                                                                        ?.filter((lead) =>
                                                                            lead.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                                                                        )
                                                                        .map((lead, index) => (
                                                                            <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                                                                {(provided) => (
                                                                                    <Card
                                                                                        className="lead-card mt-3"
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                    >
                                                                                        {/* Labels Section */}
                                                                                        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '-27px' }}>
                                                                                            {lead.labels.map((labelname, index) => {
                                                                                                console.log(labelname, 'labelname')
                                                                                                let backgroundColor = labelname.color || '#ccc';
                                                                                                switch (labelname.color) {
                                                                                                    case 'success':
                                                                                                        backgroundColor = '#6fd943';
                                                                                                        break;
                                                                                                    case 'danger':
                                                                                                        backgroundColor = '#ff3a6e';
                                                                                                        break;
                                                                                                    case 'primary':
                                                                                                        backgroundColor = '#5c91dc';
                                                                                                        break;
                                                                                                    case 'warning':
                                                                                                        backgroundColor = '#ffa21d';
                                                                                                        break;
                                                                                                    case 'info':
                                                                                                        backgroundColor = '#6ac4f4';
                                                                                                        break;
                                                                                                    case 'secondary':
                                                                                                        backgroundColor = '#6c757d';
                                                                                                        break;
                                                                                                    default:
                                                                                                        backgroundColor = '#ccc'; // Default color if no match
                                                                                                }
                                                                                                return (
                                                                                                    <div key={index} style={{ marginRight: '4px', marginTop: '8px' }}>
                                                                                                        <div
                                                                                                            className='labels_class'
                                                                                                            style={{
                                                                                                                backgroundColor: backgroundColor,
                                                                                                                borderRadius: '4px',
                                                                                                                display: 'flex',
                                                                                                                alignItems: 'center',
                                                                                                                padding: '4px 8px',
                                                                                                                cursor: 'pointer'
                                                                                                            }}
                                                                                                        >
                                                                                                            <p style={{ color: '#000', margin: 0, fontSize: '11px' }}>{labelname.name}</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>

                                                                                        {/* Lead Info */}
                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '28px' }}>
                                                                                            <div style={{ width: '100%', maxWidth: '160px' }}>
                                                                                                <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                                                                                    <p className='mb-1' style={{ color: '#B9406B', fontWeight: '600', fontSize: '14px' }}>
                                                                                                        {lead.company_Name ? lead.company_Name : lead.client?.name && lead.client?.name}
                                                                                                    </p>
                                                                                                </Link>
                                                                                            </div>
                                                                                            <Dropdown overlay={renderMenu(lead)} trigger={['click']}>
                                                                                                <BsThreeDotsVertical style={{ cursor: 'pointer', fontSize: '20px' }} />
                                                                                            </Dropdown>
                                                                                        </div>

                                                                                        {/* User Images */}
                                                                                        <div className="image_container">
                                                                                            {lead.selected_users
                                                                                                .filter((leadImage) => {
                                                                                                    const excludedRoles = ['Developer', 'Marketing', 'CEO', 'MD', 'Super Admin', 'HOD', 'Admin'];
                                                                                                    return !excludedRoles.includes(leadImage?.role);
                                                                                                })
                                                                                                .map((leadImage, index) => {
                                                                                                    const imageSrc = leadImage?.image
                                                                                                        ? `/images/${leadImage?.image}`
                                                                                                        : default_image;
                                                                                                    return (
                                                                                                        <OverlayTrigger
                                                                                                            key={index}
                                                                                                            placement="top" // Change this to 'bottom', 'left', or 'right' as needed
                                                                                                            overlay={
                                                                                                                <Tooltip id={`tooltip-${index}`}>
                                                                                                                    {leadImage.name}
                                                                                                                </Tooltip>
                                                                                                            }
                                                                                                        >
                                                                                                            <div style={{ display: 'inline-block', cursor: 'pointer' }}>
                                                                                                                <Image
                                                                                                                    src={imageSrc}
                                                                                                                    alt={`Lead ${index}`}
                                                                                                                    className="image_control_discussion_main_lead"
                                                                                                                // style={{ width: '100px', height: '100px' }} 
                                                                                                                />
                                                                                                            </div>
                                                                                                        </OverlayTrigger>
                                                                                                    );
                                                                                                })}
                                                                                        </div>

                                                                                        {/* Lead Metadata */}
                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='mb-2'>
                                                                                            <div className='marketing_source_lead'>
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                    {lead.lead_type?.name && lead.lead_type?.name}
                                                                                                </p>
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                    {lead.source?.name && lead.source?.name}
                                                                                                </p>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '5px' }}>
                                                                                                {
                                                                                                    canAddUserLead && canAddUserLead ?

                                                                                                        <div className="main_lead_users_delete_btn">
                                                                                                            <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => handleAddUserClick(lead._id)} />
                                                                                                        </div>
                                                                                                        :
                                                                                                        null

                                                                                                }
                                                                                                <SiImessage className='mt-2' style={{ fontSize: '20px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDiscussion(lead)} />
                                                                                                <TbFileDescription className='mt-2' style={{ fontSize: '20px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDetails(lead)} />
                                                                                                <IoLogoWhatsapp style={{ color: 'green', fontSize: '20px', cursor: 'pointer' }} onClick={() => openWhtsappModal(lead._id, lead.client._id)} />
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Product Stage Lead */}
                                                                                        <div
                                                                                            className='product_stage_lead'
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    lead.pipeline_id?.name === 'Personal Loan'
                                                                                                        ? '#ffa000'
                                                                                                        : lead.pipeline_id?.name === 'EIB Bank'
                                                                                                            ? '#08448c'
                                                                                                            : 'defaultBackgroundColor', // Set a default background color if needed
                                                                                            }}
                                                                                        >
                                                                                            <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                {lead.pipeline_id?.name && lead.pipeline_id?.name}
                                                                                            </p>
                                                                                        </div>

                                                                                        {/* Transfer Stage Lead */}
                                                                                        {lead.is_transfer && (
                                                                                            <div className='Transfer_stage_lead' onClick={() => TransferMessageModal(lead._id)}>
                                                                                                <p className="mb-0 text-center" style={{ fontSize: '11px', cursor: 'pointer' }}>Transfer Form</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </Card>
                                                                                )}
                                                                            </Draggable>
                                                                        ))
                                                                ) : (
                                                                    <p className='text-center' >No leads available</p>
                                                                )}
                                                                {provided.placeholder}
                                                            </Card>
                                                        )}
                                                    </Droppable>
                                                ))
                                        ) : (
                                            <p>No stages available</p>
                                        )}
                                    </div>
                                </DragDropContext>
                            )}
                        </Card>
                    </Col>
                </Row>

                {/* Lead Transfer Message Modal */}
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={leadTransferMessageModal}
                    onHide={() => setLeadTransferMessageModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Lead Transfer Form
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {selectedTransferForm ?
                                `The lead  has been successfully transferred.` :
                                'No lead selected.'}
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => setLeadTransferMessageModal(false)} >Close</Button>
                    </Modal.Footer>
                </Modal>

                {/* Lead Discussion */}
                <Modal
                    show={leadDiscussionModal}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    onHide={() => setLeadDiscussionModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Lead Discussion
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card className="mt-4 lead_discussion_main_card_main" style={{ padding: '15px' }}>
                            <Container>
                                <Row>
                                    <Col xs={12}>
                                        <div className="chat-history mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {selectedLeadDiscussion?.discussions?.length > 0 ? (
                                                selectedLeadDiscussion.discussions.reverse().map((leadDiscussion, index) => {
                                                    const imageSrc = leadDiscussion.created_by?.image
                                                        ? `/images/${leadDiscussion.created_by?.image}`
                                                        : 'default_image_url_here';

                                                    return (
                                                        <div key={index} style={{ marginBottom: '15px' }}>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <Image
                                                                    src={imageSrc}
                                                                    alt={leadDiscussion.created_by?.name}
                                                                    className="image_control_discussion"
                                                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                />
                                                                <p className="mb-0" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                                    {leadDiscussion.created_by?.name}
                                                                </p>
                                                            </div>
                                                            <p className="mb-0" style={{ fontSize: '0.75rem', color: '#888' }}>
                                                                {new Date(leadDiscussion?.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: true,
                                                                })}
                                                            </p>
                                                            <p style={{ fontSize: '14px' }} className="mb-4 mt-2">
                                                                {leadDiscussion?.comment}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p>No discussions available.</p>
                                            )}
                                        </div>

                                        <Form>
                                            <Form.Control
                                                as="textarea"
                                                placeholder="Leave a comment here"
                                                rows={1}
                                                value={discussionText}
                                                onChange={handleInputChange}
                                                required
                                                ref={textareaRef}
                                                maxLength={300}
                                                className="lead_discussion_class"
                                            />
                                            {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
                                        </Form>
                                        <Button onClick={sendDiscussionMessage} className="mt-2 all_single_leads_button">
                                            Create
                                        </Button>
                                    </Col>
                                </Row>
                            </Container>
                        </Card>
                    </Modal.Body>

                </Modal>

                {/* Lead Description Modal */}
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={openLeadDescriptionModal}
                    onHide={() => setOpenLeadDescriptionModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Lead Details
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedLead ? (
                            <div>
                                {selectedLead.description
                                    ? selectedLead.description.split('\n').map((line, index) => (
                                        <p
                                            key={index}
                                            style={{ fontWeight: index % 2 === 0 ? 'bold' : 'normal' }}
                                        >
                                            {line}
                                        </p>
                                    ))
                                    : <p>No description available.</p>
                                }
                            </div>
                        ) : (
                            <p>No lead selected.</p>
                        )}
                    </Modal.Body>
                </Modal>

                {/* Add user Modal */}
                <Modal
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={userModal}
                    onHide={() => setUserModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Add Users for {selectedLead ? selectedLead.client?.name : 'Lead'} {/* Show the lead name */}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Users</Form.Label>
                                <Select
                                    options={pipelineUsers.map(user => ({ value: user._id, label: user.name }))} // Only show users from the same pipeline
                                    value={selectedLeadUsers} // Prepopulate selected users for the lead
                                    onChange={(options) => {
                                        setSelectedLeadUsers(options);
                                        setUserError('');
                                    }}
                                    isMulti // Enable multi-select
                                    placeholder="Select users..."
                                />
                                {userError && <div className="text-danger">{userError}</div>}
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

                {/* Rejected Modal */}
                <Modal
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={rejectedLeadModal}
                    onHide={() => setRejectedLeadModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Reject Lead
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                        <p  >
                            <span style={{ color: 'red', fontWeight: '600' }} > Are You Sure?</span>  <br /> <span style={{ color: '#3ec9d6' }} >You Want to Reject this Lead</span>
                        </p>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Control as="textarea" rows={3} placeholder='Reason For Rejection' name='reject_reason' value={rejectLead} onChange={(e) => setRejectLead(e.target.value)} />
                        </Form.Group>
                        {rejectReasonErrorMessage && rejectReasonErrorMessage && <Alert variant="danger">{rejectReasonErrorMessage}</Alert>}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button className='all_close_btn_container' onClick={() => setRejectedLeadModal(false)}>Close</Button>
                        <Button className='all_single_leads_button' onClick={RejectedLead} >Reject Lead</Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={phoneNumberSuccess}
                    onHide={() => setPhoneumberSuccess(false)}
                >
                    <Modal.Body style={{backgroundColor:'#EFEFEF', borderRadius:'14px'}} >
                        <div >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='mb-2'>
                                <h4>Lead Already Exist</h4>
                                {
                                    apiData && apiData.isRejected ?
                                        <Image src={rejected_image} alt='rejected_image' style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                                        : null
                                }
                            </div>
                            {
                                apiData && (
                                    <>
                                        <Row>
                                            <Col md={6} lg={6}>
                                                <Card className='lead_exist_status'>
                                                    <strong className='text-center mb-2' >Client Details</strong>
                                                    <p>
                                                        {`Name : ${apiData.companyName ? apiData.companyName : apiData.client.name}`}
                                                    </p>

                                                    <p>
                                                        {`Emirates ID : ${apiData.client.e_id ? apiData.client.e_id : 'No Emirates ID'}`}
                                                    </p>

                                                    <p>
                                                        {`Email : ${apiData.client.email ? apiData.client.email : 'No Email'}`}
                                                    </p>
                                                </Card>
                                            </Col>

                                            <Col md={6} lg={6}>
                                                <Card className='lead_exist_status'>
                                                    <strong className='text-center mb-2' >Lead Details</strong>
                                                    <p>
                                                        {`Product :  ${apiData.products.name}`}
                                                    </p>

                                                    <p>
                                                        {`PipeLine :  ${apiData.pipeline.name}`}
                                                    </p>

                                                    <p>
                                                        {`Product Stage :  ${apiData.productStage.name}`}
                                                    </p>

                                                    <p>
                                                        {`Lead Type :  ${apiData.leadType.name}`}
                                                    </p>

                                                    <p>
                                                        {`Source :  ${apiData.source.name}`}
                                                    </p>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <p className='mt-3' >
                                            {`Lead Details :  ${apiData.description}`}
                                        </p>
                                    </>
                                )
                            }

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }} >
                                <Button className='all_close_btn_container' onClick={() => setPhoneumberSuccess(false)}>Close</Button>
                                {
                                    apiData && (
                                        <Link className='view_lead_btn_lead_search' to={`/single-leads/${apiData.id}`}>View Lead</Link>
                                    )
                                }
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* productStage modal */}
                <Modal
                    size="sm"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={productStageModal}
                    onHide={() => setProductStageModal(false)}
                >
                    <Modal.Body className='text-center'>
                        <RxCross1 style={{ color: "red", fontSize: '100px' }} />
                        <p>
                            {productStageError && productStageError}
                        </p>
                    </Modal.Body>
                </Modal>

                <CreateLead
                    setModal2Open={setModal2Open}
                    modal2Open={modal2Open}
                    fetchLeadsData={fetchLeads}
                />

                <EditLead
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    leadId={leadId}
                    fetchLeadsData={fetchLeads}
                />

                <MoveLeads
                    moveLeadModal={moveLeadModal}
                    setMoveLeadModal={setMoveLeadModal}
                    leadId={leadId}
                    fetchLeadsData={fetchLeads}
                />

                <TransferLeads
                    leadId={leadId}
                    fetchLeadsData={fetchLeads}
                    setTransferModal={setTransferModal}
                    transferModal={transferModal}
                />

                <ConvertLead leadId={leadId} setLeadToContract={setLeadToContract} leadtocontract={leadtocontract} contractModal={contractModal} setContractModal={setContractModal} />

                <DashboardLabels leadId={leadId} fetchLeadsData={fetchLeads} labelsDashboardModal={labelsDashboardModal} setLabelsDashBoardModal={setLabelsDashBoardModal} />

                <WhatsappNotification leadId={leadId} whtsappModal={whtsappModal} setWhatsAppModal={setWhatsAppModal} clientId={clientId} />
            </Container>
        </div>
    );
};

export default CeoDashboard;
