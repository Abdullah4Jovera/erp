import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Container, Row, Col, Table, Form } from 'react-bootstrap'; // Import Modal and Button from React Bootstrap
import { useSelector } from 'react-redux';
import Sidebar from '../Components/sidebar/Sidebar';

const LeadApiConfig = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);

    const [configs, setConfigs] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        formId: '',
        accessToken: '',
        created_by: '6719fda7f9ac6ff8a50c13b4',
        pipeline_id: null, // Default to null
        lead_type: null, // Default to null
        source: null, // Default to null
        product_stage: null, // Default to null
        products: null, // Default to null
        branch: null, // Default to null 
    });
    const [editingId, setEditingId] = useState(null);
    const [pipelines, setPipelines] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [productStages, setProductStages] = useState([]);
    const [sources, setSources] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedLeadType, setSelectedLeadType] = useState('');
    const [modalShow, setModalShow] = useState(false); // State to manage modal visibility
    const fetchConfigs = async () => {
        try {
            const response = await axios.get(`/api/lead-config/get-all-lead-fetch-config`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });
            setConfigs(response.data);
        } catch (error) {
            console.error('Error fetching configurations:', error);
        }
    };
    // Fetch all configurations on component mount
    useEffect(() => {
        fetchConfigs();
    }, []);

    // Fetch additional data on component mount
    useEffect(() => {
        const fetchAdditionalData = async () => {
            try {
                const pipelinesResponse = await axios.get(`/api/pipelines/get-pipelines`);
                setPipelines(pipelinesResponse.data);

                const leadTypesResponse = await axios.get(`/api/leadtypes/get-all-leadtypes`);
                setLeadTypes(leadTypesResponse.data);

                const productsResponse = await axios.get(`/api/products/get-all-products`);
                setProducts(productsResponse.data);

                const branchesResponse = await axios.get(`/api/branch/get-branches`);
                setBranches(branchesResponse.data);
            } catch (error) {
                console.error('Error fetching additional data:', error);
            }
        };

        fetchAdditionalData();
    }, []);

    // Fetch product stages based on selected product ID
    useEffect(() => {
        const fetchProductStages = async () => {
            if (selectedProductId) {
                try {
                    const response = await axios.get(`/api/productstages/${selectedProductId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                        },
                    });
                    setProductStages(response.data);
                } catch (error) {
                    console.error('Error fetching product stages:', error);
                }
            } else {
                setProductStages([]);
            }
        };

        fetchProductStages();
    }, [selectedProductId]);

    // Fetch sources based on selected lead type
    useEffect(() => {
        const fetchSources = async () => {
            if (selectedLeadType) {
                try {
                    const response = await axios.get(`/api/sources/${selectedLeadType}`);
                    setSources(response.data);
                } catch (error) {
                    console.error('Error fetching sources:', error);
                }
            } else {
                setSources([]);
            }
        };

        fetchSources();
    }, [selectedLeadType]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value === 'null' ? null : value, // Set to null if the value is "null"
        }));
    };

    // Handle form submission for creating/updating a configuration
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data for submission, setting "No" values to null
        const submissionData = {
            ...formData,
            pipeline_id: formData.pipeline_id === 'No Pipeline' ? null : formData.pipeline_id,
            product_stage: formData.product_stage === 'No Product Stage' ? null : formData.product_stage,
            branch: formData.branch === 'No Branch' ? null : formData.branch,
        };

        try {

            if (editingId) {
                await axios.put(
                    `/api/lead-config/update-lead-fetch-config/${editingId}`,
                    submissionData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {

                await axios.post(
                    `/api/lead-config/creat-lead-fetch-config`,
                    submissionData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                        },
                    }
                );
            }

            // Reset form and fetch updated configs
            resetForm();
            fetchConfigs();
        } catch (error) {
            console.error('Error submitting configuration:', error);
        }
    };


    // Reset form and close modal
    const resetForm = () => {
        setFormData({
            name: '',
            formId: '',
            accessToken: '',
            created_by: '',
            pipeline_id: null,
            lead_type: null,
            source: null,
            product_stage: null,
            products: null,
            branch: null,
        });
        setEditingId(null);
        setSelectedProductId('');
        setSelectedLeadType('');
        setModalShow(false); // Close modal after submission
    };

    // Handle editing a configuration
    const handleEdit = (config) => {
        setFormData(config);
        setEditingId(config._id);
        setSelectedProductId(config.products);
        setSelectedLeadType(config.lead_type);
        setModalShow(true); // Open modal for editing
    };

    // Handle deleting a configuration
    const handleDelete = async (id) => {
        try {

            await axios.delete(`/api/lead-config/delete-lead-fetch-config/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });

            // Update the local state to remove the deleted configuration
            setConfigs((prevConfigs) => prevConfigs.filter((config) => config._id !== id));
        } catch (error) {
            console.error('Error deleting configuration:', error);
        }
    };


    return (
        <Container fluid>
            <Row>
                <Col xs={12} md={12} lg={2}>
                    <Sidebar />
                </Col>

                <Col xs={12} md={12} lg={10}>
                    <h2 className='text-center mt-4' >Lead Fetch Configurations</h2>
                    <Button variant="primary" onClick={() => setModalShow(true)}>Add Configuration</Button>

                    <Modal show={modalShow} onHide={resetForm}>
                        <Modal.Header closeButton>
                            <Modal.Title>{editingId ? 'Edit Configuration' : 'Add Configuration'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formFormId">
                                            <Form.Label>Form ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="formId"
                                                placeholder="Form ID"
                                                value={formData.formId}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group controlId="formAccessToken">
                                            <Form.Label>Access Token</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="accessToken"
                                                placeholder="Access Token"
                                                value={formData.accessToken}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group controlId="formPipeline">
                                            <Form.Label>Pipeline</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="pipeline_id"
                                                value={formData.pipeline_id || ''}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Pipeline</option>
                                                <option value="No Pipeline">No Pipeline</option>
                                                {pipelines.map(pipeline => (
                                                    <option key={pipeline._id} value={pipeline._id}>{pipeline.name}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group controlId="formLeadType">
                                            <Form.Label>Lead Type</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="lead_type"
                                                value={formData.lead_type || ''}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setSelectedLeadType(e.target.value);
                                                    setSources([]); // Reset sources when lead type changes
                                                }}
                                                required
                                            >
                                                <option value="">Select Lead Type</option>
                                                <option value="No Lead Type">No Lead Type</option>
                                                {leadTypes.map(leadType => (
                                                    <option key={leadType._id} value={leadType._id}>{leadType.name}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group controlId="formSource">
                                            <Form.Label>Source</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="source"
                                                value={formData.source || ''}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Source</option>
                                                <option value="No Source">No Source</option>
                                                {sources.map(source => (
                                                    <option key={source._id} value={source._id}>{source.name}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group controlId="formProduct">
                                            <Form.Label>Product</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="products"
                                                value={formData.products || ''}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setSelectedProductId(e.target.value);
                                                }}
                                                required
                                            >
                                                <option value="">Select Product</option>
                                                <option value="No Product">No Product</option>
                                                {products.map(product => (
                                                    <option key={product._id} value={product._id}>{product.name}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group controlId="formProductStage">
                                            <Form.Label>Product Stage</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="product_stage"
                                                value={formData.product_stage || ''}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Product Stage</option>
                                                <option value="No Product Stage">No Product Stage</option>
                                                {productStages.map(stage => (
                                                    <option key={stage._id} value={stage._id}>{stage.name}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group controlId="formBranch">
                                            <Form.Label>Branch</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="branch"
                                                value={formData.branch || ''}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Branch</option>
                                                <option value="No Branch">No Branch</option>
                                                {branches.map(branch => (
                                                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" variant="primary" className="mt-3">
                                    {editingId ? 'Update' : 'Create'} Configuration
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    <Table striped bordered hover responsive className='mt-3'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Form ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map(config => (
                                <tr key={config._id}>
                                    <td>{config.name}</td>
                                    <td>{config.formId}</td>
                                    <td>
                                        <Button variant="primary"  onClick={() => handleEdit(config)}>Edit</Button>
                                        <Button variant="danger"  onClick={() => handleDelete(config._id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default LeadApiConfig;