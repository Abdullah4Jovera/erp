import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Modal, Button } from 'react-bootstrap';
import Navbar from '../Components/navbar/Navbar';
import Sidebar from '../Components/sidebar/Sidebar';
import { IoMdAdd } from 'react-icons/io';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { GrView } from "react-icons/gr";

const UnassignedLead = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const product = useSelector((state) => state.loginSlice.user?.products);
    const branchID = useSelector((state) => state.loginSlice.user?.branch);
    const branches = useSelector((state) => state.loginSlice.branches || []);

    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]); // For displaying filtered leads
    const [leadTypes, setLeadTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    console.log(allUsers, 'allUsers')
    const [userError, setUserError] = useState('');
    const [userModal, setUserModal] = useState(false);
    const [selectedLeadUsers, setSelectedLeadUsers] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [pipelineUsers, setPipelineUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState(branchID || ''); // For selected branch

    // Fetch all users
    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/users/get-users-by-branch/${selectedBranchId}/${product}`
            );
            const salesUsers = response.data.filter(user => user.role === 'Sales');
            setAllUsers(salesUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedBranchId, product]);

    // Add User
    const AddUser = async () => {
        setUserError('');

        if (!selectedLeadUsers || selectedLeadUsers.length === 0) {
            setUserError('Please select at least one user before submitting.');
            return;
        }

        try {
            const leadId = selectedLead ? selectedLead._id : null;
            if (!leadId) {
                setUserError('No lead selected.');
                return;
            }

            for (const user of selectedLeadUsers) {
                await axios.put(
                    `/api/leads/add-user-to-lead/${leadId}`,
                    { userId: user.value },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setSelectedLeadUsers([]);
            setUserModal(false);
            filterLeadsByBranch(selectedBranchId); // Filter leads again after adding users
            fetchUnassignedLeads()
        } catch (error) {
            console.error('Error adding users:', error.response.data.message);
            setUserError(error.response.data.message);
        }
    };

    // Fetch lead types
    useEffect(() => {
        const fetchLeadTypes = async () => {
            try {
                const response = await axios.get(`/api/leadtypes/get-all-leadtypes`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLeadTypes(response.data || []);
            } catch (err) {
                console.error('Error fetching lead types:', err);
                setError('Error fetching lead types');
            }
        };

        if (token) {
            fetchLeadTypes();
        }
    }, [token]);

    // Fetch unassigned leads (fetch all leads initially)
    const fetchUnassignedLeads = async () => {
        if (!product || !token) {
            setError('Invalid product or token');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const productId = Array.isArray(product) ? product[0] : product;
            const response = await axios.get(
                `/api/leads/unassigned-leads/${productId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setLeads(response.data.leads || []);
            setFilteredLeads(response.data.leads || []); // Set all leads initially
        } catch (err) {
            console.error('Error fetching unassigned leads:', err);
            setError('Error fetching unassigned leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnassignedLeads();
    }, [product, token]);

    // Filter leads by selected branch
    const filterLeadsByBranch = (branchId) => {
        if (branchId) {
            const filtered = leads.filter((lead) => lead.branch?._id === branchId);
            setFilteredLeads(filtered);
        } else {
            setFilteredLeads(leads); // Show all leads if no branch is selected
        }
    };

    useEffect(() => {
        if (branches.length > 0) {
            if (!branchID) {
                // branchID is null, so try to set Abu Dhabi as default
                const abuDhabiBranch = branches.find(branch => branch.name.toLowerCase() === 'abu dhabi');
                if (abuDhabiBranch) {
                    setSelectedBranchId(abuDhabiBranch._id); // Set Abu Dhabi as the default branch
                } else {
                    // Optionally, set a fallback branch (e.g., the first branch) if Abu Dhabi is not found
                    setSelectedBranchId(branches[0]._id);
                }
            } else {
                // branchID is available, use it to set the branch
                setSelectedBranchId(branchID);
            }
        }
    }, [branches, branchID]);

    useEffect(() => {
        if (selectedBranchId) {
            filterLeadsByBranch(selectedBranchId); // Filter leads for selected branch
        } else {
            setFilteredLeads(leads); // Show all leads if no branch is selected
        }
    }, [selectedBranchId, leads]);

    if (loading) {
        return <div>Loading...</div>;
    }

    // if (error) {
    //     return <div>{error}</div>;
    // }

    if (filteredLeads.length === 0) {
        return <div>No unassigned leads found for this product</div>;
    }

    const handleAddUserClick = (leadId) => {
        const lead = filteredLeads.find((lead) => lead._id === leadId);
        setSelectedLead(lead);
        setSelectedLeadUsers(selectedUsers[leadId] || []);

        const filteredUsers = allUsers.filter((user) =>
            user.pipeline?.[0]?._id === lead.pipeline_id?._id
        );
        setPipelineUsers(filteredUsers);

        setUserModal(true);
    };

    // Filter leads based on the search term
    const filteredLeadsBySearch = filteredLeads.filter((lead) =>
        lead.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBranchSelect = (branchId) => {
        setSelectedBranchId(branchId);
    };

    const viewDescription = (lead) => {
        // setSelectedUserDescription(lead);
        // setCeoUnassignModal(true);
    };

    return (
        <div>
            {/* <Navbar /> */}
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards' style={{ maxHeight: '92vh', overflowX: 'auto' }} >

                            <h2 className="text-center mt-3">Un-Assigned Leads</h2>

                            {/* Branch Selection */}
                            {!branchID && (
                                <div className="mt-3">
                                    {branches.length > 0 ? (
                                        branches.map((branch) => (
                                            <Button
                                                key={branch._id}
                                                className={selectedBranchId === branch._id ? 'selected-branch' : ''}
                                                style={{
                                                    backgroundColor: selectedBranchId === branch._id ? '#ffa000' : '#5c91dc',
                                                    color: 'white',
                                                    border: 'none',
                                                    margin: '5px'
                                                }}
                                                onClick={() => handleBranchSelect(branch._id)}
                                            >
                                                {branch.name}
                                            </Button>
                                        ))
                                    ) : (
                                        <p>No branches available</p>
                                    )}
                                </div>
                            )}

                            {/* Search Input */}
                            <Form.Group className="mb-3 mt-3" controlId="search">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by client name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>

                            {/* Display Leads */}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {leadTypes && leadTypes.length > 0 ? (
                                    leadTypes.map((leadType) => {
                                        // Filter leads by the lead type and calculate the length
                                        const leadsForThisType = filteredLeadsBySearch
                                            .filter((lead) => lead.lead_type?._id === leadType._id)
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by created_at

                                        return (
                                            <Card key={leadType._id} className="mb-3 p-1 unassign_stage-card" style={{ margin: '0 7px', height: 'auto', borderRadius: '20px', maxHeight: '70vh', overflowX: 'auto' }}>
                                                <h5 className='sticky-top stageNames' style={{ backgroundColor: 'black', color: 'white', textAlign: 'center', fontSize: '16px', padding: '15px 0px' }}>{leadType.name} ({leadsForThisType.length})</h5>
                                                <div className="row">
                                                    {leadsForThisType.map((lead) => (
                                                        <div key={lead._id} className="col-6 mb-2" style={{ width: '45%', padding: '0px 10px 0px 25px' }} >
                                                            <Card className="lead-card"
                                                                style={{
                                                                    minWidth: '215px',  
                                                                    maxWidth: '230px',
                                                                    height: '250px',
                                                                    backgroundColor: '#efefef'
                                                                }}
                                                            >
                                                                <div>
                                                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                                                        <div className="main_lead_users_delete_btn_unassign">
                                                                            <IoMdAdd
                                                                                style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }}
                                                                                onClick={() => handleAddUserClick(lead._id)}
                                                                            />
                                                                        </div>
                                                                        <GrView style={{ fontSize: '20px', color: '#ffa000', cursor: 'pointer' }} onClick={() => viewDescription(lead)} />
                                                                    </div>
                                                                    <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                                                        <p style={{ fontWeight: '600', color: '#979797' }} className='text-center mt-2' >{lead.client?.name}</p>
                                                                    </Link>

                                                                    <div className="text-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }} >
                                                                        <div className='marketing_source_lead_unassign'>
                                                                            <p className='mb-0' style={{ fontSize: '11px' }}>
                                                                                {lead?.pipeline_id?.name && lead.pipeline_id.name}
                                                                            </p>
                                                                            <p className='mb-0' style={{ fontSize: '11px' }}>
                                                                                {lead?.product_stage?.name && lead.product_stage.name}
                                                                            </p>
                                                                        </div>
                                                                        <div className='marketing_source_lead_unassign'>
                                                                            <p className='mb-0' style={{ fontSize: '11px' }}>
                                                                                {lead?.source?.name && lead.source.name}
                                                                            </p>
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
                                                                </div>
                                                            </Card>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>

                                        );
                                    })
                                ) : (
                                    <p>No lead types available</p>
                                )}
                            </div>

                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal to add users */}
            <Modal show={userModal} onHide={() => setUserModal(false)} centered size='md' >
                <Modal.Header closeButton>
                    Add Users for {selectedLead ? selectedLead.client?.name : 'Lead'}
                </Modal.Header>
                <Modal.Body>
                    {userError && <p className="text-danger">{userError}</p>}
                    <Select
                        options={allUsers.map((user) => ({ value: user._id, label: `${user.name} (${user.role})` }))}
                        isMulti
                        value={selectedLeadUsers}
                        onChange={setSelectedLeadUsers}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setUserModal(false)}>
                        Close
                    </Button>
                    <Button className='all_single_leads_button' onClick={AddUser}>
                        Add User
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UnassignedLead;
