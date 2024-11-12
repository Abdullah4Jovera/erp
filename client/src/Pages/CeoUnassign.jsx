import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Modal, Button, Card, Pagination, Spinner } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import Select from 'react-select';
import { MdDriveFileMove } from "react-icons/md";
import { FaFacebookSquare } from "react-icons/fa";
import { GrView } from "react-icons/gr";

const CEOunassignedLead = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branches = useSelector((state) => state.loginSlice.branches);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignModal, setAssignModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [stages, setStages] = useState([]);
    const [moveSuccessMessage, setMoveSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserDescription, setSelectedUserDescription] = useState('')
    const [ceoUnassignModal, setCeoUnassignModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 10; // Number of leads per page

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/leads/ceo-lead`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(response.data);
        } catch (error) {
            setError('Error fetching CEO leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchLeads();
        }
    }, [token]);

    const fetchProductStages = async (productId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`/api/productstages/${productId}`, { headers });
            setStages(response.data);
        } catch (err) {
            setError('Error fetching product stages');
        }
    };

    const moveLeadsHandler = async () => {
        try {
            const response = await axios.put(
                `/api/leads/move-lead/${selectedLead?._id}`,
                {
                    pipeline: selectedPipeline?.value,
                    branch: selectedBranch?.value,
                    product_stage: selectedStage?.value,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMoveSuccessMessage(response.data.message);
            setSelectedPipeline(null);
            setSelectedBranch(null);
            setSelectedStage(null);

            setTimeout(() => {
                setMoveSuccessMessage(false);
                setAssignModal(false);
            }, 3000);

            fetchLeads();

        } catch (error) {
            console.error('Error moving leads:', error);
        }
    };

    useEffect(() => {
        if (selectedLead && selectedPipeline) {
            fetchProductStages(selectedLead.products._id);
        }
    }, [selectedPipeline, selectedLead, token]);

    const openMoveModal = (lead) => {
        setSelectedLead(lead);
        setAssignModal(true);
    };

    const viewDescription = (lead) => {
        setSelectedUserDescription(lead);
        setCeoUnassignModal(true);
    };

    const pipelineOptions = selectedLead?.products.pipeline_id.map((pipeline) => ({
        value: pipeline._id,
        label: pipeline.name,
    }));

    const stageOptions = stages.map((stage) => ({
        value: stage._id,
        label: stage.name,
    }));

    const branchOptions = branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
    }));

    // Automatically set selectedPipeline when the specific branch is selected
    useEffect(() => {
        if (selectedBranch?.value === '6719fdded3de53c9fb53fb79') {
            setSelectedPipeline({ value: '6719fda75035bf8bd708d024', label: 'Ajman Branch' });
        } else {
            setSelectedPipeline(null);
        }
    }, [selectedBranch]);

    const filteredLeads = leads.filter(lead =>
        lead.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationItems = () => {
        const maxPagesToShow = 3;
        let startPage = Math.max(currentPage - 1, 1);
        let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

        // Adjust startPage if we're at the end of the page list
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(endPage - maxPagesToShow + 1, 1);
        }

        const pageItems = [];
        for (let i = startPage; i <= endPage; i++) {
            pageItems.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return pageItems;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="grow" />
            </div>
        );
    }

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards' style={{ maxHeight: '95vh', overflowX: 'auto' }}>
                            <h2 className="text-center mt-3">
                                Un-Assigned Leads ({filteredLeads.length})
                            </h2>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by client name"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '5px',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {currentLeads.map((lead) => (
                                    <Card
                                        key={lead.id}
                                        className="lead-card p-3 border rounded"
                                        style={{
                                            // width: '215px',
                                            height: '303px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            backgroundColor: '#efefef'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'start' }}>
                                            <MdDriveFileMove
                                                style={{ fontSize: '20px', color: '#ffa000', cursor: 'pointer', marginRight: '5px' }}
                                                onClick={() => openMoveModal(lead)}
                                            />
                                            <GrView style={{ fontSize: '20px', color: '#ffa000', cursor: 'pointer' }} onClick={() => viewDescription(lead)} />
                                        </div>

                                        <div style={{ width: '100%', maxWidth: '220px' }} className='mt-2 text-center'>
                                            <p className='text-center' style={{ fontWeight: '500', color: '#979797' }}>{lead.client.name}</p>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }} >
                                            <p style={{ fontWeight: '600' }} >{lead.client.phone}</p>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} >
                                                <div className="product_stage_lead p-1">
                                                    <p className="mb-0 text-center" style={{ fontSize: '11px' }}>
                                                        {lead.products?.name}
                                                    </p>
                                                </div>
                                                <p className="mb-0 text-center" style={{ fontSize: '30px', cursor: 'pointer', color: '#3f51b5' }}>
                                                    <FaFacebookSquare />
                                                </p>
                                                <div className="product_stage_lead">
                                                    <p className="mb-0 text-center" style={{ fontSize: '11px' }}>
                                                        {lead.lead_type?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-center mt-4" style={{ fontWeight: '500', fontSize: '16px', color: '#979797' }}>
                                            {new Date(lead.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </p>
                                    </Card>
                                ))}
                            </div>
                            {/* Pagination Controls */}
                                <Pagination className="mt-3 justify-content-center custom-pagination">
                                    <Pagination.Prev
                                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    />
                                    {renderPaginationItems()}
                                    <Pagination.Next
                                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    />
                                </Pagination>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal for Assigning Leads */}
            <Modal show={assignModal} onHide={() => setAssignModal(false)} size="md">
                <Modal.Header closeButton>
                    <Modal.Title>Assign Lead</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {moveSuccessMessage && <div className="alert alert-success">{moveSuccessMessage}</div>}
                    <h6>Select Branch</h6>
                    <Select
                        options={branchOptions}
                        onChange={setSelectedBranch}
                        value={selectedBranch}
                    />

                    <h6 className="mt-3">Select Pipeline</h6>
                    <Select
                        options={pipelineOptions}
                        onChange={setSelectedPipeline}
                        value={selectedPipeline}
                        isDisabled={selectedBranch?.value === '6719fdded3de53c9fb53fb79'} // Disable when specific branch is selected
                    />

                    <h6 className="mt-3">Select Stage</h6>
                    <Select
                        options={stageOptions}
                        onChange={setSelectedStage}
                        value={selectedStage}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setAssignModal(false)}>
                        Close
                    </Button>
                    <Button className='all_single_leads_button' onClick={moveLeadsHandler}>
                        Move Lead
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Selected User Modal Description */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={ceoUnassignModal}
                onHide={() => setCeoUnassignModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Lead Description
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUserDescription && (
                        <ul>
                            {selectedUserDescription.description.split('\n').map((item, index) => (
                                <li key={index}>{item.replace('• ', '')}</li> // Remove the bullet character
                            ))}
                        </ul>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setCeoUnassignModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default CEOunassignedLead;
