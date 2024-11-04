import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for creating product modal
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [selectedPipelines, setSelectedPipelines] = useState([]);

    // State for editing product modal
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [editProductName, setEditProductName] = useState('');
    const [editSelectedPipelines, setEditSelectedPipelines] = useState([]);

    // Fetch products and pipelines
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`/api/products/get-all-products`);
                setProducts(response.data);
            } catch (err) {
                setError('Error fetching products');
            } finally {
                setLoading(false);
            }
        };

        const fetchPipelines = async () => {
            try {
                const response = await axios.get(`/api/pipelines/get-pipelines`);
                setPipelines(response.data.map(pipeline => ({ value: pipeline._id, label: pipeline.name })));
            } catch (err) {
                setError('Error fetching pipelines');
            }
        };

        fetchProducts();
        fetchPipelines();
    }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/products/create-new-product`, {
                name: newProductName,
                pipeline_id: selectedPipelines.map(option => option.value),
            });
            setProducts((prevProducts) => [...prevProducts, response.data.product]);
            closeCreateModal();
        } catch (err) {
            setError('Error creating product');
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/products/${editProductId}`, {
                name: editProductName,
                pipeline_id: editSelectedPipelines.map(option => option.value),
            });
            setProducts((prevProducts) =>
                prevProducts.map((product) => (product._id === editProductId ? response.data.product : product))
            );
            closeEditModal();
        } catch (err) {
            setError('Error updating product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await axios.put(`/api/products/delete-product/${productId}`);
            setProducts((prevProducts) =>
                prevProducts.map((product) => (product._id === productId ? response.data.product : product))
            );
        } catch (err) {
            setError('Error marking product as deleted');
        }
    };

    const handleStartEdit = (product) => {
        setEditProductId(product._id);
        setEditProductName(product.name);
        setEditSelectedPipelines(product.pipeline_id.map(pipeline => ({ value: pipeline._id, label: pipeline.name })));
        setEditModalOpen(true);
    };

    const openCreateModal = () => {
        setNewProductName('');
        setSelectedPipelines([]);
        setCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setCreateModalOpen(false);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditProductId(null);
        setEditProductName('');
        setEditSelectedPipelines([]);
    };

    if (loading) {
        return <div>Loading products...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <h1 style={{ color: 'white' }}>Products</h1>
                        <Button variant="primary" onClick={openCreateModal}>Create Product</Button>

                        {/* Create Product Modal */}
                        <Modal show={isCreateModalOpen} onHide={closeCreateModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create Product</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={handleCreateProduct}>
                                    <Form.Group controlId="productName">
                                        <Form.Label>Product Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter product name"
                                            value={newProductName}
                                            onChange={(e) => setNewProductName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="pipelines">
                                        <Form.Label>Select Pipelines</Form.Label>
                                        <Select
                                            isMulti
                                            options={pipelines}
                                            value={selectedPipelines}
                                            onChange={setSelectedPipelines}
                                            placeholder="Select Pipelines"
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">Create</Button>
                                </Form>
                            </Modal.Body>
                        </Modal>

                        {/* Edit Product Modal */}
                        <Modal show={isEditModalOpen} onHide={closeEditModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Product</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={handleEditProduct}>
                                    <Form.Group controlId="editProductName">
                                        <Form.Label>Product Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Edit product name"
                                            value={editProductName}
                                            onChange={(e) => setEditProductName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="editPipelines">
                                        <Form.Label>Select Pipelines</Form.Label>
                                        <Select
                                            isMulti
                                            options={pipelines}
                                            value={editSelectedPipelines}
                                            onChange={setEditSelectedPipelines}
                                            placeholder="Select Pipelines"
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">Update</Button>
                                </Form>
                            </Modal.Body>
                        </Modal>

                        <ul>
                            {products.map((product) => (
                                <li key={product._id} style={{ color: 'white' }}>
                                    <h2 style={{ color: 'white' }}>{product.name}</h2>
                                    <p style={{ color: 'white' }}>Created At:
                                        {new Date(product.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                    <p style={{ color: 'white' }}>Updated At :
                                        {new Date(product.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                    <p style={{ color: 'white' }}>Pipelines: {product.pipeline_id.map(pipeline => pipeline.name).join(', ')}</p>
                                    <Button variant="warning" onClick={() => handleStartEdit(product)}>Edit</Button>
                                    <Button variant="danger" onClick={() => handleDeleteProduct(product._id)}>Delete</Button>
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Products;
