import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Spin, Tooltip, Dropdown, Menu } from 'antd';
import { Container, Row, Col, Image, Modal, Card, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import { TiDeleteOutline } from "react-icons/ti";
import { IoMdAdd, IoLogoWhatsapp } from "react-icons/io";
import { FiEdit2 } from "react-icons/fi";
import { LuMoveUpLeft } from "react-icons/lu";
import { TbTransfer, TbFileDescription } from "react-icons/tb";
import { RiContractLine } from "react-icons/ri";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidLabel } from "react-icons/bi";
import { SiImessage } from "react-icons/si";
import axios from 'axios';
import Select from 'react-select';
import Navbar from '../Components/navbar/Navbar';
import Sidebar from '../Components/sidebar/Sidebar';
import CreateLead from '../Components/createLead/CreateLead';
import EditLead from '../Components/editlead/EditLead';
import MoveLeads from '../Components/moveLead/MoveLeads';
import TransferLeads from '../Components/transferLeads/TransferLeads';
import ConvertLead from '../Components/convertLead/ConvertLead';
import WhatsappNotification from '../Components/whatsappNotification/WhatsappNotification';
import DashboardLabels from '../Components/DashboardLabels';
import LeadSearch from '../Components/LeadSearch';
import default_image from '../Assets/default_image.jpg';
import { MdClear } from "react-icons/md";
import './style.css';

const Leads = () => {
    // Lead Search states
    const [branch, setBranch] = useState([]);
    const [products, setProducts] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [users, setUsers] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [sources, setSources] = useState([]);
    const [clients, setClients] = useState([]);

    // const [selectedBranch, setSelectedBranch] = useState(null);
    // const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedLeadType, setSelectedLeadType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [createdAtStart, setCreatedAtStart] = useState(''); // Start date
    const [createdAtEnd, setCreatedAtEnd] = useState(''); // End date
    // State variables
    const [leadData, setLeadData] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [productStages, setProductStages] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [modal2Open, setModal2Open] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [moveLeadModal, setMoveLeadModal] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    const [leadtocontract, setLeadToContract] = useState(false)
    const [whtsappModal, setWhatsAppModal] = useState(false)
    const [clientId, setClientId] = useState('')
    const [leadId, setLeadId] = useState(null);
    const [messageCounts, setMessageCounts] = useState({});
    const [rejectedLeadModal, setRejectedLeadModal] = useState(false)
    const [contractModal, setContractModal] = useState(false)
    const [labelsDashboardModal, setLabelsDashBoardModal] = useState(false)
    const [openLeadDescriptionModal, setOpenLeadDescriptionModal] = useState(false)
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedTransferForm, setSelectedTransferForm] = useState('')
    const [leadTransferMessageModal, setLeadTransferMessageModal] = useState(false)
    const [selectedLeadDiscussion, setSelectedDiscussion] = useState([])
    const [leadDiscussionModal, setLeadDiscussionModal] = useState(false)
    const [error, setError] = useState('');
    const [discussionText, setDiscussionText] = useState('');
    const textareaRef = useRef(null);
    const [userModal, setUserModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // Changed to an array for multiple users
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedLeadUsers, setSelectedLeadUsers] = useState([]);
    const [pipelineUsers, setPipelineUsers] = useState([]);
    const [filteredUsersByPipeline, setFilteredUsersByPipeline] = useState([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);
    const [filterOptions, setFilterOptions] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [showFilterSelect, setShowFilterSelect] = useState(false);
    const [sleectedProductName, setSelectedProductName] = useState(null)
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [phone, setPhone] = useState('')
    const [apiData, setApiData] = useState(null);

    const token = useSelector(state => state.loginSlice.user?.token);
    const productNames = useSelector(state => state.loginSlice?.productNames || []);
    const branchData = useSelector(state => state.loginSlice.branches || []);
    const loginUserBranch = useSelector(state => state.loginSlice.user?.branch);
    const productID = useSelector(state => state.loginSlice.user?.products);

    // Function to handle selecting a pipeline
    const handlePipelineSelect = (pipelineId) => {
        setSelectedPipelineId(pipelineId); // Set the selected pipeline ID

        // Filter users based on the selected pipeline ID
        const filteredUsers = allUsers.filter(user => user.pipeline?.[0]?._id === pipelineId);
        setFilteredUsersByPipeline(filteredUsers); // Update the filtered users
    };

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
                await axios.put(`/api/leads/add-user-to-lead/${'id'}`, {
                    userId: user.value
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            setSelectedUsers([]); // Clear selection after adding users
            setUserModal(false);
        } catch (error) {
            console.log(error, 'error');
        }
    };

    // Fetch product details based on product ID
    const fetchProductDetails = async (productId) => {
        if (!productId) return;
        try {
            const { data } = await axios.get(`/api/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCurrentProduct(data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    // Show modal with lead details
    const showLeadDetails = (lead) => {
        setSelectedLead(lead); // Set the selected lead
        setOpenLeadDescriptionModal(true)
    };

    // Show modal with lead Discussion
    const showLeadDiscussion = (lead) => {
        setSelectedDiscussion(lead)
        setLeadDiscussionModal(true)
    }

    // Fetch product stages based on selected product
    const fetchProductStages = async (productId) => {
        if (!productId) return;
        try {
            const { data } = await axios.get(`/api/productstages/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProductStages(data);
        } catch (error) {
            console.error('Error fetching product stages:', error);
        }
    };
    // useEffect to set default branch and product on component mount
    useEffect(() => {
        // Set Abu Dhabi as the default branch if available
        const defaultBranch = branchData.find(branch => branch.name === 'Abu Dhabi');
        if (defaultBranch) {
            setSelectedBranch(defaultBranch._id);
        }

        // Set Business Banking as the default product if available
        const defaultProduct = productNames.find(product => product.name === 'Business Banking');
        if (defaultProduct) {
            setSelectedProduct(defaultProduct._id);
        }
    }, [branchData, productNames]);

    // Fetch leads data
    const fetchLeadsData = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const { data } = await axios.get(`/api/leads/get-leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(data.leads, 'getallleads')
            setLeadData(data.leads || []);
            setFilteredLeads(data.leads || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch leads on component mount
    useEffect(() => {
        fetchLeadsData();
    }, [token]);

    // Handle product selection and set filter options
    const handleProductChange = (selectedProduct) => {
        // setSelectedProduct(selectedProduct);
        setSelectedProductName(selectedProduct); // Set the selected product name
        setShowFilterSelect(true);
    };

    // Dynamically update filter options when the selected product changes
    useEffect(() => {
        if (sleectedProductName === 'Personal Loan') {
            setFilterOptions([
                { value: 'Personal Loan', label: 'Personal Loan' },
                { value: 'EIB Bank', label: 'EIB Bank' }
            ]);

        }
        else {
            setFilterOptions([]); // Reset options for other products
        }
    }, [sleectedProductName]);

    // Handle filter change
    const handleFilterChange = (selected) => {
        if (Array.isArray(selected)) {
            setSelectedFilters(selected);
        } else {
            console.error('Selected filters should be an array');
        }
    };

    // Filter leads by selected filters
    useEffect(() => {
        if (selectedFilters.length > 0) {
            const filtered = leadData.filter(lead => selectedFilters.includes(lead.pipeline_id.name));
            setFilteredLeads(filtered);
        } else {
            setFilteredLeads(leadData);
        }
    }, [selectedFilters, leadData]);

    useEffect(() => {
        if (leadData && filterOptions) {
            // Extracting all pipeline names from leads
            const pipelineNames = leadData.map(lead => lead.pipeline_id.name);

            // Filtering filterOptions based on pipelineNames
            const newFilteredOptions = filterOptions.filter(option =>
                pipelineNames.includes(option.label)
            );

            setFilteredOptions(newFilteredOptions);
        }
    }, [leadData, filterOptions]);


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

    // Prepare options for the select dropdown
    const userOptions = filteredUsers.map(user => ({
        value: user._id,
        label: user.name
    }));

    // Function to handle the modal opening for a specific lead
    const handleAddUserClick = (leadId) => {
        // Find the lead based on the leadId
        const lead = leadData.find((lead) => lead._id === leadId);

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

    // Initial data fetch
    useEffect(() => {
        fetchLeadsData();
    }, [token]);

    // Fetch product details and stages when productID changes
    useEffect(() => {
        if (productID) {
            fetchProductDetails(productID);
            fetchProductStages(productID);
            setSelectedProduct(productID); // Set selectedProduct to productID
        }
    }, [productID]);

    // Fetch stages when selectedProduct changes
    useEffect(() => {
        if (selectedProduct) {
            fetchProductStages(selectedProduct);
        }
    }, [selectedProduct]);

    // Filter leads by product and branch
    useEffect(() => {
        let filtered = leadData;

        if (selectedProduct) {
            filtered = filtered.filter(lead => lead.products?._id === selectedProduct);
        }

        if (selectedBranch) {
            filtered = filtered.filter(lead => lead.branch?._id === selectedBranch);
        }

        setFilteredLeads(filtered);
    }, [leadData, selectedProduct, selectedBranch]);

    // Handle branch selection
    const handleBranchClick = (branchId) => {
        if (branchId) {
            setSelectedBranch(branchId);
        } else {
            console.warn('Branch ID is undefined or null');
        }
    };

    // Handle product selection
    const handleProductClick = (productId, productName) => {

        setSelectedProduct(productId);
        setSelectedProductName(productName);
        if (productId) {
            // Show the filter options if the product name is 'Personal Loan'
            if (productName === 'Personal Loan') {
                setShowFilterSelect(true);
            } else {
                setShowFilterSelect(false); // Hide the Select if not 'Personal Loan'
            }

            setSelectedBranch(null); // Optionally reset branch selection when product changes
        } else {
            console.warn('Product ID is undefined or null');
        }
    };

    // Modal handlers
    const openModal = (id) => {
        setLeadId(id);
        setModalShow(true);
    };

    const openMoveLeadModal = (id) => {
        setLeadId(id);
        setMoveLeadModal(true);
    };

    const openTransferLeadModal = (id) => {
        setLeadId(id);
        setTransferModal(true);
    };

    // Handler to update lead's stage via API
    const draggableCardHandler = async (id, newStageId) => {
        try {
            const response = await axios.put(
                `/api/leads/update-product-stage/${id}`,
                { newProductStageId: newStageId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchLeadsData();
        } catch (error) {
            console.error('Error updating lead stage:', error);
        }
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
            fetchLeadsData();
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

    // Handle drag end event
    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // If no destination, do nothing
        if (!destination) return;

        // If dropped in the same place, do nothing
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Find the lead being dragged
        const draggedLead = filteredLeads.find(lead => lead._id === draggableId);
        if (!draggedLead) {
            console.error('Dragged lead not found');
            return;
        }

        const sourceStageId = source.droppableId;
        const destinationStageId = destination.droppableId;

        // Optimistically update the UI
        setFilteredLeads(prevLeads => {
            return prevLeads.map(lead => {
                if (lead._id === draggableId) {
                    return { ...lead, product_stage: { _id: destinationStageId, name: productStages.find(stage => stage._id === destinationStageId)?.name } };
                }
                return lead;
            });
        });

        // Update the backend
        draggableCardHandler(draggableId, destinationStageId);
    };

    // Combine stages with leads for rendering
    const stagesWithLeads = useMemo(() => {
        return productStages.map(stage => {
            const leadsInStage = filteredLeads.filter(lead => lead.product_stage?._id === stage._id);
            return { stage, leads: leadsInStage };
        });
    }, [productStages, filteredLeads]);

    const openLeadConvertModal = (id) => {
        setLeadId(id);
        setContractModal(true)
    }

    const openWhtsappModal = (id, clientId) => {
        setLeadId(id);
        setClientId(clientId)
        setWhatsAppModal(true);
    }

    const RejectedLead = async (id) => {
        try {
            await axios.put(`/api/leads/reject-lead/${leadId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            fetchLeadsData()
            setRejectedLeadModal(false)
        } catch (error) {
            console.log(error, 'err')
        }
    }

    const openRejectedLead = (id) => {
        setLeadId(id)
        setRejectedLeadModal(true)
    }

    const openLabelsLead = (id) => {
        setLeadId(id)
        setLabelsDashBoardModal(true)
    }

    const TransferMessageModal = (lead) => {
        setSelectedTransferForm(lead)
        setLeadTransferMessageModal(true)
    }

    // const handleSearch = async (filters) => {
    //     try {

    //         const response = await axios.get(`/api/leads/search-leads`, {
    //             params: {
    //                 pipeline: filters.pipeline,
    //                 selected_users: filters.selected_users,
    //                 created_at_start: filters.created_at_start,
    //                 created_at_end: filters.created_at_end,
    //                 products: filters.product,
    //                 lead_type: filters.lead_type,
    //                 source: filters.source,
    //                 client: filters.client,
    //                 branch: filters.branch, phone: filters.phone,
    //             },
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });

    //         setFilteredLeads(response.data.leads);
    //     } catch (error) {
    //         console.error('Error searching leads:', error);
    //     }
    // };

    const renderMenu = (lead) => (
        <Menu style={{ padding: '10px 20px', inset: '0px 0px auto auto', display: 'flex', gap: '5px', flexDirection: 'column' }} >
            <Menu.Item key="edit" onClick={() => openModal(lead._id)}>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <FiEdit2 style={{ color: '#95630d', fontSize: '16px' }} /> <span>Edit</span>
                </div>
            </Menu.Item>
            <Menu.Item key="move" onClick={() => openMoveLeadModal(lead._id)}>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <LuMoveUpLeft style={{ color: '#95630d', fontSize: '16px' }} /> <span>Move</span>
                </div>
            </Menu.Item>
            <Menu.Item key="transfer" onClick={() => openTransferLeadModal(lead._id)}>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <TbTransfer style={{ color: '#6c757d', fontSize: '16px' }} /> <span>Transfer</span>
                </div>
            </Menu.Item>
            <Menu.Item key="convert" onClick={() => openLeadConvertModal(lead._id)}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <RiContractLine style={{ color: '#6fd943', fontSize: '16px' }} /> <span>Contract</span>
                </div>
            </Menu.Item>
            <Menu.Item key="reject" onClick={() => openRejectedLead(lead._id)}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <AiFillDelete style={{ color: 'red', fontSize: '16px' }} />  <span>Reject</span>
                </div>
            </Menu.Item>
            <Menu.Item key="labels" onClick={() => openLabelsLead(lead._id)}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <BiSolidLabel style={{ color: '#ff3a6e', fontSize: '16px' }} />
                    <span>
                        Labels
                    </span>
                </div>
            </Menu.Item>
        </Menu>
    );

    // Lead Search Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pipelineResponse, productResponse, branchResponse, userResponse, leadTypeResponse, sourceResponse, clientResponse] = await Promise.all([
                    // axios.get(`/api/pipelines/get-pipelines`),
                    // axios.get(`/api/products/get-all-products`),
                    // axios.get(`/api/branch/get-branches`),
                    axios.get(`/api/users/get-users`),
                    axios.get(`/api/leadtypes/get-all-leadtypes`),
                    axios.get(`/api/sources/get/get-sources`),
                    axios.get(`/api/clients/get-clinets`),
                ]);

                // setBranch(branchResponse.data);
                // setProducts(productResponse.data);
                // setPipelines(pipelineResponse.data);
                setUsers(userResponse.data);
                setLeadTypes(leadTypeResponse.data);
                setSources(sourceResponse.data);
                setClients(clientResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Navbar />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={1}>
                        <Sidebar />
                    </Col>



                    <Col xs={12} md={12} lg={11}>
                        {/* <LeadSearch onSearch={handleSearch} fetchLeadsData={fetchLeadsData} phone={phone} setPhone={setPhone} /> */}

                        <div className='mt-4 create_lead_icon'>
                            <IoMdAdd style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => setModal2Open(true)} />
                        </div>
                        {/* Branch Selection Buttons */}
                        {!loginUserBranch && branchData.length > 0 && (
                            <div>
                                <div className='d-flex flex-wrap gap-2 mt-3'>
                                    {branchData.map((branch) => (
                                        <Button
                                            key={branch?._id}
                                            type={branch?._id === selectedBranch ? 'primary' : 'default'}
                                            onClick={() => handleBranchClick(branch?._id)}
                                        >
                                            {branch?.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Selection Buttons or Current Product Display */}
                        {loginUserBranch && !productID ? ( // Change to check if productID is falsy
                            <div className='mt-3'>
                                <Tooltip title={currentProduct ? currentProduct.description : 'Loading...'}>
                                    <Button type="primary">
                                        {currentProduct ? currentProduct.name : <Spin size="small" />}
                                        {/* Show pipeline name if product matches */}
                                        {currentProduct && currentProduct.pipeline_id.filter(pipeline => pipeline.product === productID).map(matchingPipeline => (
                                            <div key={matchingPipeline._id} style={{ fontSize: '12px', marginTop: '4px' }}>
                                                {matchingPipeline.name}
                                            </div>
                                        ))}
                                    </Button>
                                </Tooltip>
                            </div>
                        ) : (
                            <div className='d-flex flex-wrap gap-2 mt-3'>
                                {/* Only display products if productID is falsy */}
                                {productID ? null : productNames.map((product) => {
                                    // Find the corresponding pipeline names if product matches
                                    // const matchingPipelines = product.pipeline_id.filter(pipeline => pipeline.product === product._id);

                                    return (
                                        <div key={product._id} style={{ marginBottom: '10px' }}> {/* Ensure each div has a unique key */}
                                            <Button
                                                type={product._id === selectedProduct ? 'primary' : 'default'}
                                                onClick={() => handleProductClick(product._id, product.name)}
                                                style={{ display: 'block', width: '100%' }} // Optional: makes button full width
                                            >
                                                {product.name}
                                            </Button>

                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Conditionally show the Select component if the selected product is 'Personal Loan' */}
                        {/* {showFilterSelect && (
                            <Select
                                mode="multiple"
                                options={filterOptions}
                                onChange={handleFilterChange}
                                placeholder="Select Filters (e.g., Personal Loan, EIB Bank)"
                                style={{ marginTop: '10px', width: '100%' }}
                            />
                        )} */}

                        {/* Loading Indicator */}
                        {loading && <Spin size="large" className="d-flex justify-content-center mt-4" />}

                        {/* Stages and Leads Display */}
                        {!loading && selectedProduct && productStages.length > 0 && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="stage-scroll-container mt-4">
                                    <div className="stages-wrapper d-flex flex-nowrap overflow-auto">
                                        {productStages.map(stage => (
                                            <Droppable key={stage._id} droppableId={stage._id}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        style={{
                                                            borderRadius: 4,
                                                            maxHeight: '70vh',
                                                            overflowY: 'auto'
                                                        }}
                                                        className="stage-column mx-2"
                                                    >
                                                        <Card className="stage-card" bordered>
                                                            <h5 className="text-center stage-title">{stage.name}</h5>
                                                            <div className="leads-container">
                                                                {stagesWithLeads.find(s => s.stage._id === stage._id)?.leads.map((lead, index) => {
                                                                    return (
                                                                        <>
                                                                            <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                                                                {(provided) => (
                                                                                    <Card
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                        className="lead_card mb-2"

                                                                                    >
                                                                                        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '-27px' }}>
                                                                                            {lead.labels.map((labelname, index) => {
                                                                                                let backgroundColor = '';
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
                                                                                                            <p style={{ color: '#fff', margin: 0, fontSize: '11px' }}>{labelname.name}</p>
                                                                                                        </div>

                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>

                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '28px' }}>
                                                                                            <div style={{ width: '100%', maxWidth: '160px' }}>
                                                                                                <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }} >
                                                                                                    <p className='mb-1' style={{ color: '#B9406B', fontWeight: '600', fontSize: '14px' }} >{lead.company_Name ? lead.company_Name : lead.client?.name && lead.client?.name}</p>
                                                                                                </Link>
                                                                                            </div>
                                                                                            <Dropdown overlay={renderMenu(lead)} trigger={['click']}>
                                                                                                <Button icon={<BsThreeDotsVertical />} />
                                                                                            </Dropdown>
                                                                                        </div>
                                                                                        <div className="image_container">
                                                                                            {lead.selected_users
                                                                                                .filter((leadImage) => {
                                                                                                    const excludedRoles = [
                                                                                                        'Developer', 'Marketing', 'CEO', 'MD',
                                                                                                        'Super Admin', 'HOD', 'Admin'
                                                                                                    ];

                                                                                                    return !excludedRoles.includes(leadImage?.role);
                                                                                                })
                                                                                                .map((leadImage, index) => {
                                                                                                    const imageSrc = leadImage?.image
                                                                                                        ? `/images/${leadImage?.image}`
                                                                                                        : default_image;

                                                                                                    return (
                                                                                                        <Image
                                                                                                            key={index}
                                                                                                            src={imageSrc}
                                                                                                            alt={`Lead ${index}`}
                                                                                                            className="image_control_discussion_main_lead"
                                                                                                            style={{ cursor: 'pointer' }}
                                                                                                        />
                                                                                                    );
                                                                                                })}

                                                                                        </div>


                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='mb-2'>
                                                                                            <div className='marketing_source_lead' >
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }} > {lead.lead_type?.name && lead.lead_type?.name} </p>
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}> {lead.source?.name && lead.source?.name} </p>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '5px' }} >
                                                                                                <div className="main_lead_users_delete_btn">
                                                                                                    <IoMdAdd
                                                                                                        style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }}
                                                                                                        onClick={() => handleAddUserClick(lead._id)} // Pass the lead ID to the handler
                                                                                                    />
                                                                                                </div>
                                                                                                <SiImessage className='mt-2' style={{ fontSize: '20px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDiscussion(lead)} />
                                                                                                <TbFileDescription className='mt-2' style={{ fontSize: '20px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDetails(lead)} />
                                                                                                <IoLogoWhatsapp style={{ color: 'green', fontSize: '20px', cursor: 'pointer' }} onClick={() => openWhtsappModal(lead._id, lead.client._id)} />
                                                                                            </div>
                                                                                        </div>

                                                                                        <div
                                                                                            className='product_stage_lead'
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    lead.pipeline_id?.name === 'Personal Loan'
                                                                                                        ? '#ffa000'
                                                                                                        : lead.pipeline_id?.name === 'EIB Bank'
                                                                                                            ? '#08448c'
                                                                                                            : 'defaultBackgroundColor', // You can set a default background color if needed
                                                                                            }}
                                                                                        >
                                                                                            <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                {lead.pipeline_id?.name && lead.pipeline_id?.name}
                                                                                            </p>
                                                                                        </div>

                                                                                        {lead.is_transfer && (
                                                                                            <div className='Transfer_stage_lead' onClick={() => TransferMessageModal(lead._id)} >
                                                                                                <p className="mb-0 text-center" style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                    Transfer Form
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

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

                                                                                    </Card>
                                                                                )}
                                                                            </Draggable>
                                                                        </>
                                                                    )
                                                                })}
                                                                {provided.placeholder}
                                                            </div>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Droppable>
                                        ))}
                                    </div>
                                </div>
                            </DragDropContext>
                        )}

                        {/* No Stages or Products Selected */}
                        {(!selectedProduct || productStages.length === 0) && (
                            <div className="no-stages mt-4">
                                <h5>No Stages or Products Selected. Please Select a Product and Branch.</h5>
                            </div>
                        )}
                    </Col>
                </Row>

                {/* Add user Modal */}
                <Modal
                    size="lg"
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


                <Modal
                    size="sm"
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className='all_close_btn_container' onClick={() => setRejectedLeadModal(false)}>Close</Button>
                        <Button className='all_single_leads_button' onClick={RejectedLead} >Reject Lead</Button>
                    </Modal.Footer>
                </Modal>
                {/* Child Components (Modals) */}
                <CreateLead
                    setModal2Open={setModal2Open}
                    modal2Open={modal2Open}
                    fetchLeadsData={fetchLeadsData}
                />
                <EditLead
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    leadId={leadId}
                    fetchLeadsData={fetchLeadsData}
                />
                <MoveLeads
                    moveLeadModal={moveLeadModal}
                    setMoveLeadModal={setMoveLeadModal}
                    leadId={leadId}
                    fetchLeadsData={fetchLeadsData}
                />
                <TransferLeads
                    leadId={leadId}
                    fetchLeadsData={fetchLeadsData}
                    setTransferModal={setTransferModal}
                    transferModal={transferModal}
                />
                <ConvertLead leadId={leadId} setLeadToContract={setLeadToContract} leadtocontract={leadtocontract} contractModal={contractModal} setContractModal={setContractModal} />
                <WhatsappNotification leadId={leadId} whtsappModal={whtsappModal} setWhatsAppModal={setWhatsAppModal} clientId={clientId} />
                <DashboardLabels leadId={leadId} fetchLeadsData={fetchLeadsData} labelsDashboardModal={labelsDashboardModal} setLabelsDashBoardModal={setLabelsDashBoardModal} />
            </Container>
        </>
    );
};

export default Leads;