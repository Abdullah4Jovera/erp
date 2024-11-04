import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Col, Container, Row } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';

const ProductStages = () => {
    const [productStages, setProductStages] = useState([]);
    const [filteredStages, setFilteredStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [newStage, setNewStage] = useState({
        name: '',
        product_id: '',
        pipeline_id: '',
        order: 1, // default order
    });
    const [editStage, setEditStage] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(''); // For filtering stages by product

    useEffect(() => {
        const fetchProductStages = async () => {
            try {
                const response = await fetch(`/api/productstages/get-all-productstages`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product stages');
                }
                const data = await response.json();
                setProductStages(data);
                setFilteredStages(data); // Initially, all stages are displayed
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await fetch(`/api/products/get-all-products`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchPipelines = async () => {
            try {
                const response = await fetch(`/api/pipelines/get-pipelines`);
                if (!response.ok) {
                    throw new Error('Failed to fetch pipelines');
                }
                const data = await response.json();
                setPipelines(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchProductStages();
        fetchProducts();
        fetchPipelines();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStage((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditStage((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/productstages/create-productstages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStage),
            });

            if (!response.ok) {
                throw new Error('Failed to create product stage');
            }

            const createdStage = await response.json();
            setProductStages((prev) => [...prev, createdStage]);
            setFilteredStages((prev) => [...prev, createdStage]); // Update the filtered list
            setShowCreateModal(false); // Close modal
            setNewStage({ name: '', product_id: '', pipeline_id: '', order: 1 }); // Reset form
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/productstages/${editStage._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editStage),
            });

            if (!response.ok) {
                throw new Error('Failed to update product stage');
            }

            const updatedStage = await response.json();
            setProductStages((prev) =>
                prev.map((stage) => (stage._id === updatedStage._id ? updatedStage : stage))
            );
            setFilteredStages((prev) =>
                prev.map((stage) => (stage._id === updatedStage._id ? updatedStage : stage))
            );
            setShowEditModal(false); // Close modal
            setEditStage(null); // Reset edit stage
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteStage = async (id) => {
        if (window.confirm('Are you sure you want to delete this product stage?')) {
            try {
                const response = await fetch(`/api/productstages/${id}`, {}, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete product stage');
                }

                setProductStages((prev) => prev.filter((stage) => stage._id !== id));
                setFilteredStages((prev) => prev.filter((stage) => stage._id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const openEditModal = (stage) => {
        setEditStage(stage);
        setShowEditModal(true);
    };

    // Handle product filter change
    const handleProductFilterChange = (e) => {
        const selectedProductId = e.target.value;
        setSelectedProduct(selectedProductId);

        if (selectedProductId === '') {
            setFilteredStages(productStages); // Show all stages if no product is selected
        } else {
            const filtered = productStages.filter(
                (stage) => stage.product_id._id === selectedProductId
            );
            setFilteredStages(filtered);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>

                        <h2 style={{ color: 'white' }} >Product Stages</h2>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            Create Product Stage
                        </Button>

                        {/* Filter by Product */}
                        <Form.Group controlId="productFilter" style={{ marginTop: '20px' }}>
                            <Form.Label style={{ color: 'white' }}>Filter by Product</Form.Label>
                            <Form.Control as="select" value={selectedProduct} onChange={handleProductFilterChange}>
                                <option value="">All Products</option>
                                {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                        <p style={{ color: 'white' }}>{product.name}</p>
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <ul>
                            {filteredStages.map((stage) => (
                                <li key={stage._id}>
                                    <h3 style={{ color: 'white' }}>{stage.name}</h3>
                                    <p style={{ color: 'white' }}><strong>Product:</strong> {stage.product_id?.name}</p>
                                    <p style={{ color: 'white' }}><strong>Pipeline:</strong> {stage.pipeline_id?.name}</p>
                                    <p style={{ color: 'white' }}><strong>Order:</strong> {stage.order}</p>
                                    <p style={{ color: 'white' }}><strong>Created At: </strong>
                                        {new Date(stage.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                    <p style={{ color: 'white' }}><strong>Updated At: </strong>
                                        {new Date(stage.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                    <p style={{ color: 'white' }}><strong>Deleted Status:</strong> {stage.delstatus ? 'Deleted' : 'Active'}</p>
                                    <Button variant="secondary" onClick={() => openEditModal(stage)}>
                                        Edit Stage
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDeleteStage(stage._id)}>
                                        Delete Stage
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>

            {/* Modal for Creating New Product Stage */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Product Stage</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateSubmit}>
                        <Form.Group controlId="formProductStageName">
                            <Form.Label>Stage Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter stage name"
                                name="name"
                                value={newStage.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formProductSelect">
                            <Form.Label>Product</Form.Label>
                            <Form.Control
                                as="select"
                                name="product_id"
                                value={newStage.product_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                    <option key={product._id} value={product._id}>{product.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="formPipelineSelect">
                            <Form.Label>Pipeline</Form.Label>
                            <Form.Control
                                as="select"
                                name="pipeline_id"
                                value={newStage.pipeline_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Pipeline</option>
                                {pipelines.map((pipeline) => (
                                    <option key={pipeline._id} value={pipeline._id}>{pipeline.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="formOrder">
                            <Form.Label>Order</Form.Label>
                            <Form.Control
                                type="number"
                                name="order"
                                value={newStage.order}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Create Stage
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal for Editing Product Stage */}
            {editStage && (
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Product Stage</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditSubmit}>
                            <Form.Group controlId="formProductStageName">
                                <Form.Label>Stage Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter stage name"
                                    name="name"
                                    value={editStage.name}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formProductSelect">
                                <Form.Label>Product</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="product_id"
                                    value={editStage.product_id}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map((product) => (
                                        <option key={product._id} value={product._id}>{product.name}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="formPipelineSelect">
                                <Form.Label>Pipeline</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="pipeline_id"
                                    value={editStage.pipeline_id}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="">Select Pipeline</option>
                                    {pipelines.map((pipeline) => (
                                        <option key={pipeline._id} value={pipeline._id}>{pipeline.name}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="formOrder">
                                <Form.Label>Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="order"
                                    value={editStage.order}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                Update Stage
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
};

export default ProductStages;