import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Table } from 'react-bootstrap';

const SingleContract = () => {
    const { id } = useParams(); // Get the contract ID from URL params 
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useSelector((state) => state.loginSlice.user?.token);

    const fetchContract = async () => {
        if (!token) return; // Ensure ID and token are available
        setLoading(true); // Start loading state

        try {
            const response = await axios.get(
                `/api/contracts/single-contract/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setContract(response.data);
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Failed to fetch contract');
            console.error("Error fetching contract:", err.response || err.message);
        } finally {
            setLoading(false); // End loading state
        }
    };

    useEffect(() => {
        fetchContract();
    }, [token,id]);

    if (loading) {
        return <h3 className="text-center">Loading...</h3>;
    }

    if (error) {
        return <h3 className="text-center text-danger">{error}</h3>;
    }

    if (!contract) {
        return <h3 className="text-center">No contract found</h3>;
    }

    return (
        <Container fluid>
            <Row>
                <Col xs={12}>
                    <h2 className="text-center mt-3">Contract Details</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Contract ID</td>
                                <td>{contract._id}</td>
                            </tr>
                            <tr>
                                <td>Client Name</td>
                                <td>{contract.client_id?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Lead Type</td>
                                <td>{contract.lead_type?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Pipeline</td>
                                <td>{contract.pipeline_id?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Source</td>
                                <td>{contract.source_id?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Created By</td>
                                <td>{contract.created_by?.name || 'N/A'}</td>
                            </tr>
                           
                            <tr>
                                <td>Selected Users</td>
                                <td>{contract.selected_users.map(user => user.name).join(', ') || 'N/A'}</td>
                            </tr>
                           
                            <tr>
                                <td>Created At</td>
                                <td>{new Date(contract.created_at).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default SingleContract;