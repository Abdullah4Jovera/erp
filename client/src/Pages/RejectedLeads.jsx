import React, { useState, useEffect } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Table, Form, Pagination, Modal, Button, Card, Image } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { GrView } from "react-icons/gr";
import { Link } from 'react-router-dom';
import { FcCancel } from "react-icons/fc";
import '../Pages/style.css';
import rejected_image from '../Assets/rejected_image.png';

const RejectedLeads = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const branchNames = useSelector(state => state.loginSlice.branches);
    const productNames = useSelector(state => state.loginSlice.products);
    const product = useSelector((state) => state.loginSlice.user?.products);
    const [rejectedLeads, setRejectedLeads] = useState([]);
    const [rejectedLeadReason, setRejectedLeadReason] = useState(false);
    const [selectedRejectReason, setSelectedRejectReason] = useState('');
    const [searchClientName, setSearchClientName] = useState('');
    const [searchPipelineName, setSearchPipelineName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState('All');
    const leadsPerPage = 10;
    const pagesToShow = 5;

    // Fetch Rejected Leads
    useEffect(() => {
        const fetchRejectedLeads = async () => {
            try {
                const response = await axios.get(`/api/leads/rejected-leads`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRejectedLeads(response.data.leadDetails || []);
            } catch (error) {
                console.error('Error fetching rejected leads:', error);
            }
        };

        fetchRejectedLeads();
    }, [token]);

    // Filter leads based on selected branch, pipeline name, and search terms
    const filteredLeads = rejectedLeads.filter(lead =>
        (selectedBranch === 'All' || lead.branchName === selectedBranch) &&
        (selectedProduct === 'All' || lead.productName === selectedProduct) &&
        lead.clientName.toLowerCase().includes(searchClientName.toLowerCase()) &&
        lead.pipelineName.toLowerCase().includes(searchPipelineName.toLowerCase())
    );

    // Pagination for the filtered leads
    const totalLeads = filteredLeads.length;
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
    const totalPages = Math.ceil(totalLeads / leadsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Reset pagination when search terms, branch, or product changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchClientName, searchPipelineName, selectedBranch, selectedProduct]);

    // Calculate page range to show in pagination
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    const handleShowReason = (reason) => {
        setSelectedRejectReason(reason);
        setRejectedLeadReason(true);
    };

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards'>
                            <Image src={rejected_image} className='rejected_image' alt='Rejected Image' style={{ width: '140px', height: '140px', borderRadius: '50%' }} />
                            <h2 className="text-center mt-3" style={{ color: 'black' }}>
                                Rejected Leads ({totalLeads} {totalLeads === 1 ? 'Lead' : 'Leads'})
                            </h2>

                            {/* Branch and Product Filter Buttons */}
                            <div
                                className="filter-buttons mb-3 mt-3"
                                style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}
                            >
                                <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                        setSelectedBranch('All');
                                        setSelectedProduct('All');
                                    }}
                                    active={selectedBranch === 'All' && selectedProduct === 'All'}
                                    style={{
                                        backgroundColor: selectedBranch === 'All' && selectedProduct === 'All' ? '#ffa000' : 'black',
                                        color: selectedBranch === 'All' && selectedProduct === 'All' ? 'white' : 'white',
                                        border: 'none',
                                    }}
                                >
                                    All
                                </Button>
                                {branchNames.map((branch) => (
                                    <Button
                                        key={branch._id}
                                        variant="outline-primary"
                                        onClick={() => setSelectedBranch(branch.name)}
                                        active={selectedBranch === branch.name}
                                        style={{
                                            backgroundColor: selectedBranch === branch.name ? '#ffa000' : 'black',
                                            color: selectedBranch === branch.name ? 'white' : 'white',
                                            border: 'none',
                                        }}
                                    >
                                        {branch.name}
                                    </Button>
                                ))}
                            </div>
                            {!product && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {productNames.map((product) => (
                                        <Button
                                            key={product._id}
                                            variant="outline-primary"
                                            onClick={() => setSelectedProduct(product.name)}
                                            active={selectedProduct === product.name}
                                            style={{
                                                backgroundColor: selectedProduct === product.name ? '#ffa000' : 'black',
                                                color: selectedProduct === product.name ? 'white' : 'white',
                                                border: 'none',
                                            }}
                                        >
                                            {product.name}
                                        </Button>
                                    ))}
                                </div>
                            )}


                            {/* Search Form */}
                            <Form className="my-3">
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId="searchClientName">
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by Client Name"
                                                value={searchClientName}
                                                onChange={e => setSearchClientName(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="searchPipelineName">
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by Pipeline Name"
                                                value={searchPipelineName}
                                                onChange={e => setSearchPipelineName(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>

                            {/* Leads Table */}
                            <Table striped bordered hover className='mt-3 table_main_container' size='md'>
                                <thead>
                                    <tr className="teble_tr_class" style={{ backgroundColor: '#e9ecef', color: '#343a40', borderBottom: '2px solid #dee2e6', transition: 'background-color 0.3s ease' }}>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="cell-width">Client Name</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="cell-width">Pipeline Name</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="cell-width">Product Stage</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="cell-width">Product Name</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="cell-width">Branch Name</th>
                                        <th style={{ backgroundColor: '#f8f9fd' }} className="cell-width">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLeads.length > 0 ? (
                                        currentLeads.map((lead) => (
                                            <tr key={lead.id}>
                                                <td className="cell-width">{lead.clientName}</td>
                                                <td className="cell-width">{lead.pipelineName}</td>
                                                <td className="cell-width">{lead.productStage}</td>
                                                <td className="cell-width">{lead.productName}</td>
                                                <td className="cell-width">{lead.branchName}</td>
                                                <td className="cell-width">
                                                    <Link to={`/single-leads/${lead.id}`} className='addActionbtn'>
                                                        <GrView style={{ color: '#ffa000', fontSize: '20px', cursor: 'pointer', marginRight: '2px' }} />
                                                        <div className="tooltip">View Lead</div>
                                                    </Link>
                                                    <div className='addActionbtn'>
                                                        <FcCancel style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => handleShowReason(lead.reject_reason)} />
                                                        <div className="tooltip">Rejected Reason</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">No leads found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Pagination Controls */}
                            <Pagination className="justify-content-center">
                                <Pagination.Prev
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                />
                                {pages.map(page => (
                                    <Pagination.Item
                                        key={page}
                                        active={page === currentPage}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Rejected Lead Reason Modal */}
            <Modal show={rejectedLeadReason} onHide={() => setRejectedLeadReason(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rejected Lead Reason</Modal.Title>
                </Modal.Header>
                <Modal.Body>{selectedRejectReason}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setRejectedLeadReason(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RejectedLeads;
