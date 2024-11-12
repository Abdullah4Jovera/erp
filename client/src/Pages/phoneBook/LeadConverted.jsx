import React, { useState, useEffect } from 'react';
import { Table, Form, Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../../Components/sidebar/Sidebar';
import { LuView } from "react-icons/lu";

const LeadConverted = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [blockedNumbers, setBlockedNumbers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNumbers, setFilteredNumbers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15; // Show 13 items on the first page
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            // Fetch blocked numbers from the API
            axios.get(`/api/phonebook/get-leads-numbers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    setBlockedNumbers(response.data);
                    setFilteredNumbers(response.data); // Initialize filtered numbers
                })
                .catch(error => {
                    console.error('Error fetching blocked numbers:', error);
                });
        }
    }, [token, navigate]);

    useEffect(() => {
        // Filter numbers based on search query for both number and user name
        if (searchQuery) {
            const queryLower = searchQuery.toLowerCase();
            setFilteredNumbers(blockedNumbers.filter(entry =>
                entry.number.toLowerCase().includes(queryLower) ||
                entry.status.toLowerCase().includes(queryLower) ||
                (entry.user && entry.user.name && entry.user.name.toLowerCase().includes(queryLower))
            ));
            setCurrentPage(1); // Reset to the first page when search is applied
        } else {
            setFilteredNumbers(blockedNumbers);
        }
    }, [searchQuery, blockedNumbers]);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredNumbers.length / itemsPerPage)) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNumbers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards'>
                            <h2 className="text-center mt-3">
                                Total Converted Leads: {filteredNumbers.length}
                            </h2>
                            <div className="phonebook-container">
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                    <Form.Group controlId="searchBar" className='w-50'>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by Number or User Name"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>

                                {currentItems.length > 0 ? (
                                    <>
                                        <Table hover bordered responsive className='mt-3 table_main_container' size='md'>
                                            <thead style={{ backgroundColor: '#f8f9fd' }}>
                                                <tr
                                                    className="teble_tr_class"
                                                    style={{
                                                        backgroundColor: '#e9ecef',
                                                        color: '#343a40',
                                                        borderBottom: '2px solid #dee2e6',
                                                        transition: 'background-color 0.3s ease',
                                                    }}
                                                >
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">User</th>
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Number</th>
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Status</th>
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Call Status</th>
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Pipeline</th>
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">View Lead</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td className='table_td_class'>
                                                            {entry.user && entry.user.name ? entry.user.name : 'N/A'}
                                                        </td>
                                                        <td className='table_td_class'>{entry.number}</td>
                                                        <td className='table_td_class'>{entry.status}</td>
                                                        <td className='table_td_class'>{entry.calstatus}</td>
                                                        <td className='table_td_class'>{entry.pipeline?.name}</td>
                                                        <td className='table_td_class'>
                                                            <Link to={`/single-leads/${entry.lead_id}`} style={{ textDecoration: 'none', }} ><LuView style={{ color: '#ffa000', fontSize: '20px', cursor: 'pointer' }} /></Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>

                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <Button
                                                variant="primary"
                                                onClick={handlePreviousPage}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <span>
                                                Page {currentPage} of {Math.ceil(filteredNumbers.length / itemsPerPage)}
                                            </span>
                                            <Button
                                                variant="primary"
                                                onClick={handleNextPage}
                                                disabled={currentPage === Math.ceil(filteredNumbers.length / itemsPerPage)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <p>No Leads Numbers Available.</p>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LeadConverted;
