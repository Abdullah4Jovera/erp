import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Row, Col, Form, Modal, Button, Card } from 'react-bootstrap';
import { MdClear } from "react-icons/md";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../Pages/style.css'

const LeadSearch = ({ onSearch, fetchLeadsData, selectedBranchId, selectedProductId, }) => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branchID = useSelector((state) => state.loginSlice.user?.branch);
    const productID = useSelector((state) => state.loginSlice.user?.products);
    const [branch, setBranch] = useState([]);
    const [pipelines, setPipelines] = useState([]); // State for pipelines
    const [users, setUsers] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [sources, setSources] = useState([]);
    const [clients, setClients] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('')
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState('');
    const [selectedLeadType, setSelectedLeadType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [createdAtStart, setCreatedAtStart] = useState('');
    const [createdAtEnd, setCreatedAtEnd] = useState('');
    const [apiData, setApiData] = useState(null);
    const [phoneNumberSuccess, setPhoneumberSuccess] = useState(false)
    const defaultBranchName = 'Abu Dhabi';
    const branchId = selectedBranchId || branch.find(b => b.name === defaultBranchName)?._id;

    // Fetch data for branches, lead types, sources, and clients
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchResponse, leadTypeResponse, sourceResponse, clientResponse] = await Promise.all([
                    axios.get(`/api/branch/get-branches`),
                    axios.get(`/api/leadtypes/get-all-leadtypes`),
                ]);

                setBranch(branchResponse.data);
                setLeadTypes(leadTypeResponse.data);
                setSources(sourceResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Fetch sources based on selected lead type
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = selectedLeadType
                    ? await axios.get(`/api/sources/${selectedLeadType.value}`)
                    : await axios.get(`/api/sources/get/get-sources`);

                setSources(response.data);
            } catch (error) {
                console.error('Error fetching sources:', error);
            }
        };

        fetchSources();
    }, [selectedLeadType]);

    // Fetch users based on selected product
    useEffect(() => {
        const fetchUsers = async () => {
            if (selectedProductId) {
                try {
                    const response = await axios.get(`/api/users/get-users-by-product/${selectedProductId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            } else {
                setUsers([]); // Clear users if no product is selected
            }
        };

        fetchUsers();
    }, [selectedProductId]);

    // Fetch pipelines based on selected branch and product
    useEffect(() => {
        const fetchPipelines = async () => {
            if (selectedBranchId === '6719fdded3de53c9fb53fb79') {
                // If the branch is the specific Ajman Branch, set static pipeline data
                setPipelines([
                    {
                        _id: '6719fda75035bf8bd708d024', // The specified ID
                        name: 'Ajman Branch' // The specified label
                    }
                ]);
            } else if (selectedProductId) {
                // If the branch is not the Ajman Branch, fetch pipelines based on the selected product
                try {
                    const response = await axios.get(`/api/products/${selectedProductId}`);
                    const pipelinesData = response.data.pipeline_id || [];
                    setPipelines(pipelinesData);
                } catch (error) {
                    console.error('Error fetching pipelines:', error);
                }
            } else {
                // If no product is selected, clear pipelines
                setPipelines([]);
            }
        };

        fetchPipelines();
    }, [selectedProductId, selectedBranchId]);

    // Debouncing function
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const handleSearch = () => {
        onSearch({
            branch: selectedBranchId,
            pipeline: selectedPipeline ? selectedPipeline.value : '',
            product: selectedProductId,
            userId: selectedUsers ? selectedUsers.value : '',
            lead_type: selectedLeadType ? selectedLeadType.value : '',
            source: selectedSource ? selectedSource.value : '',
            client: selectedClient ? selectedClient.value : '',
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
        });
    };

    const debouncedSearch = debounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [selectedPipeline, selectedUsers, selectedLeadType, selectedSource, selectedClient, createdAtStart, createdAtEnd]);


    const getProductID = localStorage.getItem('selectedProductId') || productID
    const getBranchID = localStorage.getItem('selectedBranchId') || branchId

    const handleClearFilters = () => {
        setSelectedPipeline(null);
        setSelectedUsers([]);
        setSelectedLeadType(null);
        setSelectedSource(null);
        setCreatedAtStart('');
        setCreatedAtEnd('');
        setPhoneNumber('')
        fetchLeadsData(getProductID, getBranchID)
    };

    // Clear selected filters when selectedProductId or selectedBranchId change
    useEffect(() => {
        setSelectedPipeline(null);
        setSelectedUsers([]);
        setSelectedLeadType(null);
        setSelectedSource(null);
        setCreatedAtStart('');
        setCreatedAtEnd('');
        setPhoneNumber('')
    }, [selectedProductId, selectedBranchId]);

    const handlePhoneInputChange = async (e) => {
        let inputValue = e.target.value;

        // Validation and formatting
        let processedValue = inputValue.replace(/^\+971\s?/, '').replace(/^0+/, '');
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9); // Keep only digits
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'); // Format the number

        setPhoneNumber(formattedValue); // Update state with formatted number

        // If no digits are left after processing, return early
        if (digitsOnly.length === 0) {
            return; // Optionally, add a message to inform the user if needed
        }

        // Concatenate +971 with the processed phone number for the payload
        const payloadPhone = `+971${digitsOnly}`;

        try {
            const response = await axios.post(`/api/leads/check-client-phone`, {
                clientPhone: payloadPhone, // Use the concatenated phone number for API call
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Handle the response as needed
            const responseData = response.data[0];
            setApiData(responseData); // Save the first object in state

            // Check if apiData exists and if the phone number matches
            if (responseData && responseData.client && responseData.client.phone === payloadPhone) {
                setPhoneumberSuccess(true)
            }
        } catch (error) {
            console.error('Error checking client phone:', error);
            // Handle error accordingly (e.g., show an error message)
        }
    };

    // Custom styles for the select dropdown
    const customStyles = {
        menu: (provided) => ({
            ...provided,
            maxHeight: 120, // Limit height to show only 2 or 3 options
            overflowY: 'hidden', // Hide scrollbar in the menu container
            padding: 0, // Remove padding
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: 120, // Set the same max height to the menuList
            overflowY: 'auto', // Enable scrolling
            paddingRight: '8px', // Add padding to make room for the scrollbar
            '::-webkit-scrollbar': {
                width: '6px', // Set scrollbar width
            },
            '::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc', // Style the scrollbar thumb
                borderRadius: '4px', // Make the scrollbar thumb rounded
            },
            '::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#aaa', // Change color on hover for better visibility
            },
        }),
        control: (provided) => ({
            ...provided,
            minHeight: 38, // Set the minimum height of the control
        }),
    };


    return (
        <div className="lead-search" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }} >

            <div>
                <Select
                    id="pipeline"
                    value={selectedPipeline}
                    onChange={setSelectedPipeline}
                    options={pipelines.map((pipeline) => ({ value: pipeline._id, label: pipeline.name }))} // Use the fetched pipelines
                    placeholder="Select Pipeline"
                />
            </div>

            <div>
                <Select
                    id="users"
                    value={selectedUsers}
                    onChange={setSelectedUsers}
                    options={users.map((user) => ({ value: user._id, label: user.name }))} // Updated to show users based on selected product
                    // isMulti
                    placeholder="Select Users"
                    styles={customStyles}
                />
            </div>

            <div>
                <Select
                    id="lead_type"
                    value={selectedLeadType}
                    onChange={setSelectedLeadType}
                    options={leadTypes.map((leadType) => ({ value: leadType._id, label: leadType.name }))}
                    placeholder="Select Lead Type"
                />
            </div>

            <div>
                <Select
                    id="source"
                    value={selectedSource}
                    onChange={setSelectedSource}
                    options={sources.map((source) => ({ value: source._id, label: source.name }))}
                    placeholder="Select Source"
                    styles={customStyles} // Apply custom styles
                />
            </div>

            <div>
                <Form.Control type="text" placeholder="Search By Number" value={phoneNumber} name='phoneNumber' onChange={handlePhoneInputChange} />
            </div>

            <div>
                <Form.Control
                    type="date"
                    id="created_at_start"
                    value={createdAtStart}
                    onChange={(e) => setCreatedAtStart(e.target.value)}
                />
            </div>

            <div>
                <Form.Control
                    type="date"
                    id="created_at_end"
                    value={createdAtEnd}
                    onChange={(e) => setCreatedAtEnd(e.target.value)}
                    placeholder='End Date'
                    className='date_picker'
                />
            </div>

            <div style={{ cursor: 'pointer' }} className='clear_filter_btn' onClick={handleClearFilters}>
                <MdClear style={{ color: 'white', fontSize: '24px' }} />
            </div>

            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={phoneNumberSuccess}
                onHide={() => setPhoneumberSuccess(false)}
            >
                <Modal.Body>
                    <Card body className='lead_search_card' >
                        <h4>Lead Already Exist</h4>
                        {
                            apiData && (
                                <>
                                    <p>
                                        {`Name : ${apiData.companyName ? apiData.companyName : apiData.client.name}`}
                                    </p>

                                    <p>
                                        {`Emirates ID : ${apiData.client.e_id ? apiData.client.e_id : 'No Emirates ID'}`}
                                    </p>

                                    <p>
                                        {`Email : ${apiData.client.email ? apiData.client.email : 'No Email'}`}
                                    </p>

                                    <p>
                                        {`Product :  ${apiData.products.name}`}
                                    </p>

                                    <p>
                                        {`PipeLine :  ${apiData.pipeline.name}`}
                                    </p>

                                    <p>
                                        {`Product Stage :  ${apiData.productStage.name}`}
                                    </p>

                                    <p>
                                        {`Lead Type :  ${apiData.leadType.name}`}
                                    </p>

                                    <p>
                                        {`Source :  ${apiData.source.name}`}
                                    </p>

                                    <p>
                                        {`Lead Details :  ${apiData.description}`}
                                    </p>
                                </>
                            )
                        }

                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }} >
                            <Button className='all_close_btn_container' onClick={() => setPhoneumberSuccess(false)}>Close</Button>
                            {
                                apiData && (
                                    <Link className='view_lead_btn_lead_search' to={`/single-leads/${apiData.id}`}>View Lead</Link>
                                )
                            }
                        </div>
                    </Card>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default LeadSearch;
