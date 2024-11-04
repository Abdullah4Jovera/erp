import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Col, Container, Image, Row, Card, Button } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { Link } from 'react-router-dom';
import { MdNavigateNext } from "react-icons/md";
const Request = () => {
    const [requests, setRequests] = useState([]);
    const token = useSelector(state => state.loginSlice.user?.token);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = useSelector(state => state.loginSlice.user?._id);
    const [pendingCount, setPendingCount] = useState(0);
    const [actionCount, setActionCount] = useState(0);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    const fetchRequests = async () => {
        try {
            const response = await axios.get(
                `/api/request/my-requests`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.data) {
                const fetchedRequests = response.data.data;
                setRequests(fetchedRequests);

                // Count pending requests where the user is a receiver
                const pending = fetchedRequests.filter(request =>
                    request.receivers.some(receiver => receiver._id === userId) && request.action === 'Pending'
                );
                setPendingCount(pending.length);

                // Count accepted or declined requests where the sender is the logged-in user and read is false
                const actionTaken = fetchedRequests.filter(request =>
                    request.sender._id === userId &&
                    (request.action === 'Accept' || request.action === 'Decline') &&
                    request.read === false
                );
                setActionCount(actionTaken.length);

            } else {
                setRequests([]);
                setPendingCount(0);
                setActionCount(0);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token, userId]);

    const handleActionChange = async (requestId, action) => {
        try {
            const response = await axios.put(
                `/api/request/change-action/${requestId}`,
                { action },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            // Update the local state after successful action change
            setRequests(prevRequests =>
                prevRequests.map(req =>
                    req._id === requestId ? { ...req, action: response.data.updatedRequest?.action || 'Pending' } : req
                )
            );
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating request action');
        }
    };

    const handleMarkReadChange = async (requestId) => {
        try {
            await axios.put(`/api/request/mark-read/${requestId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchRequests();
        } catch (error) {
            console.log(error, 'err');
        }
    };

    // Pagination logic
    const indexOfLastRequest = currentPage * itemsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
    const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(requests.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    if (loading) {
        return <div>Loading...</div>;
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
                            <h2 className='text-center mt-3'>Lead Requests</h2>
                            {requests.length === 0 ? (
                                <p>No lead requests found.</p>
                            ) : (
                                <>
                                    <Row>
                                        {currentRequests.map((request) => {
                                            const imageSrc = request.sender.image
                                                ? `/images/${request.sender.image}`
                                                : null;
                                            return (
                                                <Col key={request._id} xs={12} sm={6} md={6} lg={6} className="mb-4">
                                                    <Card style={{ width: '100%' }} className='lead_request_main_card' >
                                                        <Card.Body>
                                                            <Card.Title className='request_message' >{request.message}</Card.Title>
                                                            <Row className='mt-4' >
                                                                <Col md={6} lg={6} >
                                                                    <strong>Sender:</strong>
                                                                    <Card.Subtitle className="mb-2 text-muted">
                                                                        {imageSrc && (
                                                                            <Image
                                                                                src={imageSrc}
                                                                                alt="Sender Image"
                                                                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                            />
                                                                        )}
                                                                        <span style={{ color: '#979797', fontWeight: '500' }} > {request.sender?.name}</span>
                                                                    </Card.Subtitle>
                                                                </Col>

                                                                <Col md={6} lg={6} className='mt-1'>
                                                                    <Card.Text>
                                                                        <strong>Client:</strong>
                                                                        <p style={{ color: '#979797', fontWeight: '500' }}>{request.lead_id?.client.name}</p>
                                                                    </Card.Text>
                                                                </Col>

                                                                <Col md={6} lg={6}>
                                                                    <Card.Text>
                                                                        <strong>Type:</strong>
                                                                        <p style={{ color: '#979797', fontWeight: '500' }}>{request.type}</p>
                                                                    </Card.Text>
                                                                </Col>

                                                                <Col md={6} lg={6}>
                                                                    <Card.Text>
                                                                        <strong>Action:</strong>
                                                                        <p style={{ color: '#979797', fontWeight: '500' }}> {request.action || 'Pending'}</p>
                                                                    </Card.Text>
                                                                </Col>

                                                                <Col md={6} lg={6}>
                                                                    <Card className='current_request_status' >
                                                                        <Card.Text>
                                                                            <strong>Current Status:</strong>
                                                                            <div>
                                                                                <p className='mt-3'><strong>Branch:</strong> {request.lead_id?.branch?.name || 'N/A'}</p>
                                                                                <p><strong>Product:</strong> {request.lead_id?.products?.name || 'N/A'}</p>
                                                                                <p><strong>Pipeline:</strong> {request.lead_id?.pipeline_id?.name || 'N/A'}</p>
                                                                                <p><strong>Product Stage:</strong> {request.lead_id?.product_stage?.name || 'N/A'}</p>
                                                                            </div>
                                                                        </Card.Text>
                                                                    </Card>
                                                                </Col>

                                                                <Col md={6} lg={6}>
                                                                    <Card className='current_request_status'>
                                                                        <Card.Text>
                                                                            <strong>Requested Status:</strong>
                                                                            <div>
                                                                                <p className='mt-3' ><strong>Branch:</strong> {request.branch?.name || 'N/A'}</p>
                                                                                <p><strong>Product:</strong> {request.products?.name || 'N/A'}</p>
                                                                                <p><strong>Pipeline:</strong> {request.pipeline_id?.name || 'N/A'}</p>
                                                                                <p><strong>Product Stage:</strong> {request.product_stage?.name || 'N/A'}</p>
                                                                            </div>
                                                                        </Card.Text>
                                                                    </Card>
                                                                </Col>
                                                            </Row>

                                                            <Card.Text className='mt-3' >
                                                                <strong  >Receivers:</strong>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    {request.receivers?.map((receiver) => (
                                                                        <React.Fragment key={receiver._id}>
                                                                            <Image
                                                                                src={`/images/${receiver.image}`}
                                                                                alt="Receiver Image"
                                                                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                            />
                                                                            <p className='mb-0'>{receiver.name}</p>
                                                                        </React.Fragment>
                                                                    ))}
                                                                </div>
                                                                <Link
                                                                    to={`/single-leads/${request?.lead_id?._id}`}
                                                                    style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                                    className='viewRequestLead mt-3'
                                                                >
                                                                    View Lead
                                                                </Link>
                                                            </Card.Text>
                                                            {request?.action !== 'Pending' && request?.actionChangedBy && (
                                                                <Card.Text className={`mt-3 ${request.action === 'Accept' ? 'text-success' : request.action === 'Decline' ? 'text-danger' : ''}`}>
                                                                    The Lead Request of type "{request?.type}" has been {request.action.toLowerCase()} by <strong>{request.actionChangedBy.name}</strong>
                                                                    {request.actionChangedBy.image && (
                                                                        <Image
                                                                            src={`/images/${request?.actionChangedBy.image}`}
                                                                            alt="Action Changed By"
                                                                            style={{ width: '30px', height: '30px', borderRadius: '50%', marginLeft: '8px' }}
                                                                        />
                                                                    )}
                                                                </Card.Text>
                                                            )}
                                                            {request.action === 'Pending' && request.receivers?.some((receiver) => receiver._id === userId) && (
                                                                <div className="mt-3" style={{ display: 'flex', gap: '10px' }}>
                                                                    <Button
                                                                        variant="success"
                                                                        onClick={() => handleActionChange(request._id, 'Accept')}
                                                                    >
                                                                        Accept
                                                                    </Button>
                                                                    <Button
                                                                        variant="danger"
                                                                        onClick={() => handleActionChange(request._id, 'Decline')}
                                                                    >
                                                                        Decline
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {(request.action === 'Accept' || request.action === 'Decline') && request.sender && request.sender._id === userId && !request.read && (
                                                                <div className="mt-3" style={{ display: 'flex', gap: '10px' }}>
                                                                    <Button
                                                                        variant="success"
                                                                        onClick={() => handleMarkReadChange(request._id)}
                                                                    >
                                                                        Mark as Read
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    {/* Pagination */}
                                    <div className="pagination mt-1 d-flex justify-content-center">
                                        <Button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="mx-2 mb-0">{currentPage} of {totalPages}</span>
                                        <Button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Request;
