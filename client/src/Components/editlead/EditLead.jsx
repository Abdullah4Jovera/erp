import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap'; // Importing Row and Col from react-bootstrap
import InputMask from "react-input-mask";

const EditLead = ({ modalShow, setModalShow, leadId, fetchLeadsData, fetchSingleLead }) => {
    const [leadData, setLeadData] = useState({
        clientPhone: '',
        clientName: '',
        clientEmail: '',
        cliente_id: '',
        description: '',
        company_Name: '',
        lead_type: {},
        pipeline_id: {},
        products: {},
        branch: {},
        product_stage: {},
        source: {},
    });
    const [sources, setSources] = useState([]);
    const [productStages, setProductStages] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const productsName = useSelector(state => state.loginSlice.productNames);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branchesSlice = useSelector(state => state.loginSlice.branches || []);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);

    // Fetching lead data when the modal opens
    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`/api/leads/single-lead/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const client = response.data.client || {};
                setLeadData({
                    clientPhone: client.phone || '',
                    clientName: client.name || '',
                    clientEmail: client.email || '',
                    cliente_id: client.e_id,
                    description: response.data.description || '',
                    company_Name: response.data.company_Name,
                    lead_type: response.data.lead_type || {},
                    pipeline_id: response.data.pipeline_id || {},
                    products: response.data.products || {},
                    branch: response.data.branch || {},
                    product_stage: response.data.product_stage || {},
                    source: response.data.source || {},
                });

                setSelectedProduct(response.data.products?._id || '');
            } catch (error) {
                console.log(error, 'Error fetching lead data');
            }
        };

        if (modalShow) {
            fetchLeadData();
        }
    }, [modalShow, leadId, token]);

    // Fetching sources based on the selected lead type
    useEffect(() => {
        const fetchSources = async () => {
            if (leadData.lead_type?._id) {
                try {
                    const response = await axios.get(`/api/sources/${leadData.lead_type._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setSources(response.data);
                } catch (error) {
                    console.log(error, 'Failed to fetch sources');
                }
            } else {
                setSources([]);
            }
        };

        fetchSources();
    }, [leadData.lead_type, token]);

    // Fetching product stages based on the selected product
    useEffect(() => {
        const fetchProductStages = async () => {
            if (selectedProduct) {
                try {
                    const response = await axios.get(`/api/productstages/${selectedProduct}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProductStages(response.data);
                } catch (error) {
                    console.log(error, 'Error fetching product stages');
                }
            } else {
                setProductStages([]);
            }
        };

        fetchProductStages();
    }, [selectedProduct, token]);

    // Handling changes to input fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handling branch selection
    const handleBranchChange = (e) => {
        const selectedBranchId = e.target.value;
        const selectedBranch = branchesSlice.find((branch) => branch._id === selectedBranchId);
        setLeadData((prevData) => ({
            ...prevData,
            branch: selectedBranch ? { _id: selectedBranch._id, name: selectedBranch.name } : {},
        }));
    };

    // Handling product selection
    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        setSelectedProduct(selectedProductId);
        setLeadData((prevData) => ({
            ...prevData,
            products: productsName.find((product) => product._id === selectedProductId) || {},
        }));
    };

    // Handling lead type selection
    const handleLeadTypeChange = (e) => {
        const selectedLeadTypeId = e.target.value;
        const selectedLeadType = leadTypeSlice.find((leadType) => leadType._id === selectedLeadTypeId);
        setLeadData((prevData) => ({
            ...prevData,
            lead_type: selectedLeadType || {},
        }));
    };

    // Handling pipeline selection
    const handlePipelineChange = (e) => {
        const selectedPipelineId = e.target.value;
        const selectedPipeline = pipelineSlice.find((pipeline) => pipeline._id === selectedPipelineId);
        setLeadData((prevData) => ({
            ...prevData,
            pipeline_id: selectedPipeline || {},
        }));
    };

    // Handling source selection
    const handleSourceChange = (e) => {
        const selectedSourceId = e.target.value;
        const selectedSource = sources.find((source) => source._id === selectedSourceId);
        setLeadData((prevData) => ({
            ...prevData,
            source: selectedSource || {},
        }));
    };

    // Handling product stage selection
    const handleProductStagesChange = (e) => {
        const selectedProductStageId = e.target.value;
        const selectedProductStage = productStages.find((stage) => stage._id === selectedProductStageId);
        setLeadData((prevData) => ({
            ...prevData,
            product_stage: selectedProductStage || {},
        }));
    };
    const getProductID = localStorage.getItem('selectedProductId')
    const getBranchID = localStorage.getItem('selectedBranchId')
    // Saving changes to the lead
    const handleSaveChanges = async () => {
        const payload = {
            clientPhone: leadData.clientPhone,
            clientName: leadData.clientName,
            clientEmail: leadData.clientEmail,
            company_Name: leadData.company_Name,
            cliente_id: leadData.cliente_id,
            description: leadData.description || '',
            product_stage: leadData.product_stage?._id || '',
            lead_type: leadData.lead_type?._id || '',
            pipeline: leadData.pipeline_id?._id || '',
            products: leadData.products?._id || '',
            source: leadData.source?._id || '',
            branch: leadData.branch?._id || '',
            selected_users: selectedUsers || [],
        };

        try {
            await axios.put(`/api/leads/edit-lead/${leadId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setModalShow(false);
            fetchLeadsData(getProductID,getBranchID);
            fetchSingleLead();
        } catch (error) {
            console.log(error, 'Error saving lead data');
        }
    };

    return (
        <Modal
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={modalShow}
            onHide={() => setModalShow(false)}

        >
            <Modal.Body style={{ padding: '40px' }}>
                <h4 className='text-center mb-3' >Edit Lead</h4>
                <Form>
                    <Row>
                        {/* Client Phone */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="clientPhone">
                                <Form.Label>Client Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Number"
                                    name="clientPhone"
                                    value={leadData.clientPhone}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col> */}

                        {/* Client Name */}
                        <Col md={6} className="mb-3">
                            <Form.Group controlId="clientName">
                                <Form.Label>Client Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Name"
                                    name="clientName"
                                    value={leadData.clientName}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Group controlId="clientEmail">
                                <Form.Label>Client Email</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Email"
                                    name="clientEmail"
                                    value={leadData.clientEmail}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        {/* Client Email */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="clientEmail">
                                <Form.Label>Client Email</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Email"
                                    name="clientEmail"
                                    value={leadData.clientEmail}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col> */}

                        {/* Branch */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="branch">
                                <Form.Label>Branch</Form.Label>
                                <Form.Select value={leadData.branch?._id || ''} onChange={handleBranchChange}>
                                    <option value="">Select Branch</option>
                                    {branchesSlice.map((branch) => (
                                        <option key={branch._id} value={branch._id}>{branch.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}

                        <Col md={6} className="mb-3">
                            <Form.Group controlId="cliente_id">
                                <Form.Label>Emirates ID</Form.Label>
                                <InputMask
                                    mask="999-9999-9999999-9"
                                    value={leadData.cliente_id}
                                    onChange={handleInputChange}
                                    name="cliente_id" // Keep this name to match your state
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder="784-1234-1234567-1"
                                            // Ensure this name matches your leadData state
                                            name="cliente_id" // Use "cliente_id" to match state
                                        />
                                    )}
                                </InputMask>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Group controlId="company_Name">
                                <Form.Label>Company Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Name"
                                    name="company_Name"
                                    value={leadData.company_Name}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>


                    </Row>

                    <Row>
                        {/* Lead Type */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="leadType">
                                <Form.Label>Lead Type</Form.Label>
                                <Form.Select value={leadData.lead_type?._id || ''} onChange={handleLeadTypeChange}>
                                    <option value="">Select Lead Type</option>
                                    {leadTypeSlice.map((leadType) => (
                                        <option key={leadType._id} value={leadType._id}>{leadType.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}

                        <Col md={12} className="mb-3">
                            <Form.Group controlId="description">
                                <Form.Label>Lead Details</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter Description"
                                    name="description"
                                    value={leadData.description}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>


                        </Col>

                        {/* Pipeline */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="pipeline">
                                <Form.Label>Pipeline</Form.Label>
                                <Form.Select value={leadData.pipeline_id?._id || ''} onChange={handlePipelineChange}>
                                    <option value="">Select Pipeline</option>
                                    {pipelineSlice.map((pipeline) => (
                                        <option key={pipeline._id} value={pipeline._id}>{pipeline.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}
                    </Row>

                    <Row>
                        {/* Product */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="product">
                                <Form.Label>Product</Form.Label>
                                <Form.Select value={leadData.products?._id || ''} onChange={handleProductChange}>
                                    <option value="">Select Product</option>
                                    {productsName.map((product) => (
                                        <option key={product._id} value={product._id}>{product.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}

                        {/* Source */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="source">
                                <Form.Label>Source</Form.Label>
                                <Form.Select value={leadData.source?._id || ''} onChange={handleSourceChange}>
                                    <option value="">Select Source</option>
                                    {sources.map((source) => (
                                        <option key={source._id} value={source._id}>{source.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}
                    </Row>

                    <Row>
                        {/* Product Stage */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="productStage">
                                <Form.Label>Lead Stage</Form.Label>
                                <Form.Select value={leadData.product_stage?._id || ''} onChange={handleProductStagesChange}>
                                    <option value="">Select Product Stage</option>
                                    {productStages.map((stage) => (
                                        <option key={stage._id} value={stage._id}>{stage.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}

                        {/* Description */}
                        {/* <Col md={6} className="mb-3">
                            <Form.Group controlId="description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter Description"
                                    name="description"
                                    value={leadData.description}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col> */}
                    </Row>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '10px' }} >
                        <Button className='all_close_btn_container' onClick={() => setModalShow(false)}>Close</Button>
                        <Button className='all_single_leads_button' onClick={handleSaveChanges}>
                            Update Lead
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditLead;
