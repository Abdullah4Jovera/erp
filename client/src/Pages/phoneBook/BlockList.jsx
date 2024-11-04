import React, { useState, useEffect } from 'react';
import { Table, Form, Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../Components/navbar/Navbar';
import Sidebar from '../../Components/sidebar/Sidebar';

const Blocklist = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [blockedNumbers, setBlockedNumbers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNumbers, setFilteredNumbers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 13; // Show 10 items per page
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            axios.get(`/api/phonebook/get-blocked-numbers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    setBlockedNumbers(response.data);
                    setFilteredNumbers(response.data);
                })
                .catch(error => {
                    console.error('Error fetching blocked numbers:', error);
                });
        }
    }, [token, navigate]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredNumbers(blockedNumbers.filter(entry =>
                entry.number.includes(searchQuery) || entry.status.includes(searchQuery)
            ));
            setCurrentPage(1); // Reset to the first page when a search is applied
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
                            <h3 className='text-center' >
                                Total Blocked Numbers: {filteredNumbers.length}
                            </h3>
                            <div className="phonebook-container">
                                <div style={{ width: '100%', maxWidth: '1500px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                    <Form.Group controlId="searchBar" className='w-50'>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by Number"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>

                                {currentItems.length > 0 ? (
                                    <>
                                        <Table hover bordered responsive className='mt-3 table_main_container' size='md'>
                                            <thead className='table_head' style={{ backgroundColor: '#f8f9fd' }}>
                                                <tr
                                                    className="teble_tr_class"
                                                    style={{
                                                        backgroundColor: '#e9ecef',
                                                        color: '#343a40',
                                                        borderBottom: '2px solid #dee2e6',
                                                        transition: 'background-color 0.3s ease',
                                                    }}
                                                >
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Number</th>
                                                    <th style={{ backgroundColor: '#f8f9fd' }} className="equal-width">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td className='table_td_class' style={{ textAlign: 'center' }}>{entry.number}</td>
                                                        <td className='table_td_class' style={{ textAlign: 'center' }}>{entry.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        <div className="d-flex justify-content-between">
                                            <Button
                                                variant="primary"
                                                onClick={handlePreviousPage}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <span>Page {currentPage} of {Math.ceil(filteredNumbers.length / itemsPerPage)}</span>
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
                                    <p>No Blocked Numbers Available.</p>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Blocklist;
