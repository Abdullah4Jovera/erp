import React, { useEffect, useState } from 'react';
import Navbar from '../Components/navbar/Navbar';
import Sidebar from '../Components/sidebar/Sidebar';
import { Container, Row, Col, Table, Dropdown, Card } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Import Link

const Contract = () => {
    const [contracts, setContracts] = useState([]);
    const [contractStages, setContractStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useSelector((state) => state.loginSlice.user?.token);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await axios.get(`/api/contracts/get-all-contracts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContracts(response.data);
            } catch (err) {
                setError('Failed to fetch contracts');
                console.error(err);
            }
        };

        const fetchContractStages = async () => {
            try {
                const response = await axios.get(`/api/contract-stages/get-all-contract-stages`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContractStages(response.data);
            } catch (err) {
                setError('Failed to fetch contract stages');
                console.error(err);
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchContracts(), fetchContractStages()]);
            setLoading(false);
        };

        fetchData();
    }, [token]);

    const handleStageChange = async (contractId, newStageId) => {
        try {
            await axios.put(`/api/contracts/update-stage/${contractId}`, { contract_stage: newStageId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Fetch contracts again to update the state
            const updatedContracts = await axios.get(`/api/contracts/get-all-contracts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setContracts(updatedContracts.data);
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Failed to update contract stage');
            console.error(err);
        }
    };

    // Group contracts by stage
    const groupedContracts = contractStages.reduce((acc, stage) => {
        acc[stage._id] = {
            name: stage.name,
            contracts: contracts.filter(contract => contract.contract_stage && contract.contract_stage._id === stage._id),
        };
        return acc;
    }, {});

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={1}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={11}>
                        <Card className='leads_main_cards'>
                            <h2 className="text-center mt-3"  >Contracts</h2>

                            {loading ? (
                                <h3 className="text-center">Loading...</h3>
                            ) : error ? (
                                <h3 className="text-center text-danger">{error}</h3>
                            ) : Object.keys(groupedContracts).length > 0 ? (
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Stage</th>
                                            <th>Contract Name</th>
                                            <th>Created By</th>
                                            <th>Timestamp</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(groupedContracts).map((stage) => (
                                            stage.contracts.length > 0 ? (
                                                stage.contracts.map((contract) => (
                                                    <tr key={contract._id}>
                                                        <td>{stage.name}</td>
                                                        <td>
                                                            <Link to={`/contracts/${contract._id}`} className="text-decoration-none">
                                                                {contract.client_id.name}
                                                            </Link>
                                                        </td>
                                                        <td>{contract.created_by.name}</td>
                                                        <td>{new Date(contract.created_at).toLocaleString()}</td>
                                                        <td>
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                                    Change Stage
                                                                </Dropdown.Toggle>

                                                                <Dropdown.Menu>
                                                                    {contractStages.map((contractStage) => (
                                                                        <Dropdown.Item
                                                                            key={contractStage._id}
                                                                            onClick={() => handleStageChange(contract._id, contractStage._id)}
                                                                        >
                                                                            {contractStage.name}
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr key={stage.name}>
                                                    <td>{stage.name}</td>
                                                    <td colSpan="4" className="text-center">No contracts available</td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <h3 className="text-center">No contracts available</h3>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contract;