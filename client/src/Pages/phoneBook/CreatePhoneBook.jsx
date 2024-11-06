import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap'
import Select from 'react-select';
import InputMask from "react-input-mask";

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const CreatePhoneBook = ({ setPhoneBookModal, phoneBookModal, fetchData, getHodPhoneBookData, phoneBookNumber, phoneID, getPhoneNumber }) => {
    // Redux User Data
    const branchesSlice = useSelector(state => state.loginSlice.branches);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    const productNamesSlice = useSelector(state => state.loginSlice.productNames);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);
    const branchUserSlice = useSelector(state => state.loginSlice.user?.branch);
    const pipelineUserSlice = useSelector(state => state.loginSlice.user?.pipeline);
    const productUserSlice = useSelector(state => state.loginSlice.user?.products);
    const userRole = useSelector(state => state?.loginSlice?.user?.role)
    const userPipeline = useSelector(state => state?.loginSlice?.user?.pipeline)
    const userBranch = useSelector(state => state?.loginSlice?.user?.branch)
    const userProduct = useSelector(state => state?.loginSlice?.user?.products)
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [isValidPhone, setIsValidPhone] = useState(null);
    const [disableField, setDisableField] = useState(true);
    const [pipelineId, setPipelineId] = useState('');
    const [filteredPipelines, setFilteredPipelines] = useState([]);
    const [sources, setSources] = useState([]);
    const [selectedProductStage, setSelectedProductStage] = useState('');
    const [contactNumber, setContactNumber] = useState('')
    const [whatsappContact, setWhatsappContact] = useState('')
    const [eid, setEid] = useState('')
    const [clientName, setClientName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [branch, setBranch] = useState('')
    const [product, setProduct] = useState('')
    const [productStage, setProductStage] = useState([])
    const [leadType, setLeadType] = useState('6719fda75035bf8bd708d03a')
    const [source, setSource] = useState('6719fda75035bf8bd708d03d')
    const [leadDetails, setLeadDetails] = useState('')
    const [thirdparty, setThirdParty] = useState('')
    const [fullPhoneNumber, setFullPhoneNumber] = useState('');
    const [errorMessages, setErrorMessages] = useState({});
    const [movePipeline, setMovePipeline] = useState(false)
    const [apiData, setApiData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('')
    const [isClientNameDisabled, setIsClientNameDisabled] = useState(false);
    const [productEnableTransfer, setProductEnableTransfer] = useState(true)


    // Auth Token
    const token = useSelector(state => state.loginSlice.user?.token);

    const getProductID = localStorage.getItem('selectedProductId')
    const getBranchID = localStorage.getItem('selectedBranchId')

    useEffect(() => {
        // If branchUserSlice is not null, set the branch state to its value
        if (branchUserSlice) {
            setBranch(branchUserSlice);
        }
    }, [branchUserSlice]);

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    useEffect(() => {
        if (branch === '6719fdded3de53c9fb53fb79') {
            // Set filtered pipelines to show only "Ajman Branch"
            setFilteredPipelines([{ _id: '6719fda75035bf8bd708d024', name: 'Ajman Branch' }]);
        } else {
            // Handle other branches
            if (product) {
                const selectedProductName = productNamesSlice.find(p => p._id === product)?.name;
                if (selectedProductName && productPipelineMap[selectedProductName]) {
                    // Filter pipelines based on the selected product
                    setFilteredPipelines(pipelineSlice.filter(pipeline =>
                        productPipelineMap[selectedProductName].includes(pipeline.name)
                    ));
                } else {
                    // If no matching product name, reset to empty
                    setFilteredPipelines([]);
                }
            } else {
                // Reset to the default filtered pipelines if no product is selected
                setFilteredPipelines(pipelineSlice);
            }
        }
    }, [product, branch, pipelineSlice, productNamesSlice]);

    // Fetch all users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/users/get-users`);
                setAllUsers(response.data);

            } catch (error) {
                console.log(error, 'err');
            }
        };
        fetchData();
    }, []);

    // Fetch sources based on selected leadType
    useEffect(() => {
        const fetchSources = async () => {
            if (leadType) {
                try {
                    const response = await axios.get(`/api/sources/${leadType}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setSources(response.data); // assuming response.data contains the sources array
                } catch (error) {
                    console.log(error, 'Failed to fetch sources');
                }
            } else {
                setSources([]); // Clear sources if no lead type is selected
            }
        };

        fetchSources();
    }, [leadType, token]);

    const selectedProduct = userProduct || product;
    const fetchProductStages = async () => {
        try {
            const response = await axios.get(`/api/productstages/${selectedProduct}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProductStage(response.data);
        } catch (error) {
            console.error('Error fetching product stages:', error);
        }
    };
    useEffect(() => {
        fetchProductStages();
    }, [selectedProduct]);

    // Handle form submission
    const handleSubmit = async () => {
        // Clear previous error messages
        setErrorMessages({});

        // Validate fields
        const newErrors = {};
        if (!clientName) newErrors.clientName = "Name is required.";
        if (!selectedProductStage) newErrors.selectedProductStage = "Product stage is required.";
        if (['CEO', 'MD', 'Superadmin'].includes(userRole)) {
            if (!pipelineId) newErrors.pipelineId = "Pipeline ID is required.";
            if (!product) newErrors.product = "Product is required.";
            if (!branch) newErrors.branch = "Branch is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrorMessages(newErrors);
            return; // Stop submission if there are errors
        }

        try {
            // Submit lead data
            await axios.post(
                `/api/leads/create-lead`,
                {
                    clientPhone: phoneBookNumber,
                    clientw_phone: whatsappContact,
                    clientName: clientName,
                    clientEmail: clientEmail,
                    cliente_id: eid,
                    company_Name: companyName,
                    product_stage: selectedProductStage,
                    lead_type: leadType,
                    pipeline: pipelineId ? pipelineId : userPipeline,
                    products: product ? product : userProduct,
                    source: source,
                    description: leadDetails,
                    branch: branch ? branch : userBranch,
                    thirdpartyname: thirdparty,
                    selected_users: selectedUsers.value
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Close modal, reset fields, and update call status
            setPhoneBookModal(false);
            resetFormFields();
            updateCallStatus();

            // Call additional functions independently
            await callFunctionsIndependently();
        } catch (error) {
            console.log(error, 'err');
        }
    };

    // Define a helper function to call each independent function
    const callFunctionsIndependently = async () => {
        try {
            await getHodPhoneBookData();
        } catch (error) {
            console.warn("Error in getHodPhoneBookData:", error);
        }

        try {
            await getPhoneNumber();
        } catch (error) {
            console.warn("Error in getPhoneNumber:", error);
        }

        try {
            await fetchData();
        } catch (error) {
            console.warn("Error in fetchData:", error);
        }
    };


    // Update API
    const handleSaveChanges = async () => {
        const payload = {
            clientPhone: contactNumber,
            clientw_phone: whatsappContact,
            clientName: clientName,
            clientEmail: clientEmail,
            company_Name: companyName,
            cliente_id: eid,
            description: leadDetails || '',
            product_stage: selectedProductStage || '',
            lead_type: leadType || '',
            pipeline: pipelineId || '',
            products: product || '',
            source: source || '',
            branch: branch || '',
            selected_users: selectedUsers || [],
        };

        try {
            await axios.put(`/api/leads/edit-lead/${apiData.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPhoneBookModal(false);
            resetFormFields();
            setIsClientNameDisabled(false)
        } catch (error) {
            console.log(error, 'Error saving lead data');
        }
    };


    const checkClientPhone = async (completePhoneNumber) => {
        try {
            const response = await axios.post(
                `/api/leads/check-client-phone`,
                {
                    clientPhone: completePhoneNumber, // Use the complete phone number
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const responseData = response.data[0];
            setApiData(responseData); // Save the first object in state
            setIsValidPhone(true); // Assuming the response means it's valid

            if (responseData && responseData.client.phone === completePhoneNumber) {
                // Setting relevant client data
                setClientName(responseData.client.name);
                setClientEmail(responseData.client.email);
                setLeadDetails(responseData.description);
                setCompanyName(responseData.companyName);
                setEid(responseData.client.e_id);
                setBranch(responseData?.branch?._id);
                setLeadType(responseData.leadType._id);
                setSource(responseData.source._id);
                setPipelineId(responseData.pipeline._id);
                setProduct(responseData.products._id);
                setWhatsappContact(responseData.client.w_phone);

                // If the phone matches, disable the client name input
                setIsClientNameDisabled(true);

                // Set the selected product stage if available
                if (responseData.productStage && responseData.productStage._id) {
                    setSelectedProductStage(responseData.productStage._id);
                }

                // After setting the state, open the modal after 3 seconds
                setTimeout(() => {
                    setMovePipeline(true); // Open the modal
                }, 1000); // 2-second delay
            }
        } catch (error) {
            setIsValidPhone(false); // Set phone as invalid if there's an error
        }
    };

    // Function to handle input change and trigger API call when the phone is complete
    const handlePhoneInputChange = (e) => {
        const value = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, clientPhone: '' }));
        // setDisableField(value.trim() === '');

        let processedValue = value.replace(/^\+971\s?/, '').replace(/^0+/, '');
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9);
        const formattedValue = digitsOnly?.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');

        setContactNumber(formattedValue);
        if (errorMessages.contactNumber) {
            setErrorMessages((prev) => ({ ...prev, contactNumber: '' }));
        }
        const fullPhone = `+971${digitsOnly}`;
        setFullPhoneNumber(fullPhone);

        // Trigger API call when user has input the full 9 digits
        if (digitsOnly.length === 9) {
            debouncedCheckClientPhone(fullPhone);
        }

        // Check if the API data phone matches the input
        if (apiData && apiData?.client && apiData?.client?.phone !== contactNumber) {
            // setContactNumber('');
            setWhatsappContact('');
            setEid('');
            setClientName('');
            setCompanyName('');
            setClientEmail('');
            setBranch('');
            setProduct('');
            setPipelineId('');
            setSelectedProductStage('');
            // setLeadType('');
            // setSource('');
            setLeadDetails('');
            setThirdParty('');
            setSelectedUsers([]);
            setIsClientNameDisabled(false);
        }
    };

    // Debounced version of the API call
    const debouncedCheckClientPhone = debounce(checkClientPhone, 500);

    const handleEidInputChange = (e) => {
        const value = e.target.value
        setEid(value)
        setDisableField(value.trim() === '');
    }

    // Handle Input Change Name
    const handleClientNameHandler = (e) => {

        const value = e.target.value;
        const regex = /^[a-zA-Z\s]{3,20}$/;

        // Set client name value
        setClientName(value);
        setDisableField(value.trim() === '');
        // Validate client name
        if (!regex.test(value)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                clientName: 'Name must be between 3 to 20 characters and contain only letters',
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                clientName: '', // Clear the error if valid
            }));
        }
        if (errorMessages.clientName) {
            setErrorMessages((prev) => ({ ...prev, clientName: '' }));
        }
    };

    const handleCompanyInputChange = (e) => {
        const value = e.target.value;  // Get the current input value
        setCompanyName(value);

        setDisableField(value.trim() === '');
    }

    const handleEmailInputChange = (e) => {
        const value = e.target.value;
        setClientEmail(value)

        setDisableField(value.trim() === '');
    }


    const handleBranchname = (e) => {
        const selectedBranchId = e.target.value;
        setBranch(selectedBranchId);

        // Disable the field if the branch value is empty
        setDisableField(selectedBranchId.trim() === '');

        // Clear branch error if any
        if (errorMessages.branch) {
            setErrorMessages((prev) => ({ ...prev, branch: '' }));
        }

        // Check for product and API data
        if (product && apiData) {
            const matchingProduct = apiData.products?._id === product;

            if (matchingProduct) {
                const productPipelineId = apiData.products.pipeline_id[0];
                const productBranchId = apiData.branch?._id;
                const selectedPipelineBranchId = apiData.pipeline?._id;

                // Check if the selected branch matches the API response branch and pipeline
                if (productBranchId === selectedBranchId && productPipelineId === selectedPipelineBranchId) {
                    console.log("Pipeline and Branch match the product");
                    // setMatchingProduct(true);
                    // setCheckTransfer(false);
                    // setNotMatchingProduct(false);
                    // setModal2Open(true); 
                    // showModalWithMatch(true); 
                } else if (productBranchId === selectedBranchId) {
                    console.log("Only the branch matches the product");
                    // setMovePipeline(true);
                    // setCheckTransfer(false);
                    // setMatchingProduct(false);
                    // setNotMatchingProduct(false);
                    // setModal2Open(true); 
                    // showModalWithNoMatch(); 
                } else {
                    console.log("Branch does not match the product");
                    // setMovePipeline(true);
                    // setCheckTransfer(false);
                    // setMatchingProduct(false);
                    // setNotMatchingProduct(false);
                    // setModal2Open(true); 
                    // showModalWithNoMatch(); 
                }
            } else {
                console.log("No branch available for this product");
                // setCheckTransfer(true);
                // setMatchingProduct(false);
                // setModal2Open(true); 
                // showModalWithNoMatch(); 
            }
        }
    };

    const handleProductInputChange = async (e) => {
        const value = e.target.value
        const selectedProductId = value;
        setProduct(selectedProductId);
        setPipelineId(''); // Reset pipeline ID when the product changes

        setDisableField(value.trim() === '');

        if (errorMessages.product) {
            setErrorMessages((prev) => ({ ...prev, product: '' }));
        }
    };

    const handlePipelineInputChange = (e) => {
        const selectedPipelineId = e.target.value;
        setPipelineId(selectedPipelineId);

        if (errorMessages.pipelineId) {
            setErrorMessages((prev) => ({ ...prev, pipelineId: '' }));
        }

        if (product && apiData) {
            const matchingProduct = apiData.products?._id === product;

            if (matchingProduct) {
                const productPipelineId = apiData.products.pipeline_id[0];
                const productBranchId = apiData.branch?._id;
                const selectedPipelineBranchId = apiData.pipeline?._id;

                // Check if both the product pipeline and branch match the selected pipeline and branch
                if (productPipelineId === selectedPipelineId && productBranchId === selectedPipelineBranchId) {
                    console.log("Pipeline and Branch match the product");
                } else if (productPipelineId === selectedPipelineId) {
                    console.log("Only the pipeline matches the product");
                } else {
                    console.log("Pipeline does not match the product");
                }
            } else {
                console.log("No pipeline available for this product");
            }
        }
    };

    const handleLeadDetailsInputChange = (e) => {
        const value = e.target.value
        setLeadDetails(value)

        setDisableField(value.trim() === '');
    }
    const handleInputChangeProductstage = (e) => {
        const value = e.target.value
        setSelectedProductStage(value);

        setDisableField(value.trim() === '');
        if (errorMessages.selectedProductStage) {
            setErrorMessages((prev) => ({ ...prev, selectedProductStage: '' }));
        }
    }
    const handleInputChangeLeadType = (e) => {
        const value = e.target.value
        setLeadType(value)

        setDisableField(value.trim() === '');

        if (errorMessages.leadType) {
            setErrorMessages((prev) => ({ ...prev, leadType: '' }));
        }
    }

    const userOptions = allUsers
        .filter(user => user.role === 'TS Team Leader') // Filter users by role
        .map(user => ({
            value: user._id,
            label: user.name
        }));

    const resetFormFields = () => {
        setContactNumber('');
        setWhatsappContact('');
        setEid('');
        setClientName('');
        setCompanyName('');
        setClientEmail('');
        setBranch('');
        setProduct('');
        setPipelineId('');
        setSelectedProductStage('');
        // setLeadType('');
        // setSource('');
        setLeadDetails('');
        setThirdParty('');
        setSelectedUsers([]);
        // Reset error messages as well
        setErrorMessages({});
        setErrors({});
    };

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(''); // Clear the error message after 1 second
            }, 4000);

            return () => clearTimeout(timer); // Clear the timer on component unmount or if errorMessage changes
        }
    }, [errorMessage]);

    const handlewhatsppPhoneInputChange = (e) => {
        let value = e.target.value;

        // Process the value to remove leading zero if present
        let processedValue = value.startsWith('0') ? value.slice(1) : value;

        // Keep only digits and limit the number of digits to 9
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9);

        // Format the number as XX XXX XXXX
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');

        // Set the formatted value to the state
        setWhatsappContact(formattedValue);
    };

    const updateCallStatus = async () => {
        if (phoneID) {
            try {
                if (token) {
                    await axios.put(
                        `/api/phonebook/update-calstatus/${phoneID}`,
                        {
                            calstatus: 'Convert to Lead'
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            } catch (error) {
                console.error('Error updating call status:', error);
            }
        }
    };

    return (
        <>
            <Modal
                title="Create Lead"
                centered
                show={phoneBookModal}
                size="xl"
                scrollable
                onHide={() => {
                    setPhoneBookModal(false);
                    resetFormFields(); // Clear the fields when closing the modal
                }}

            >
                <Modal.Header closeButton>
                    <Modal.Title>Create Lead</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            {/* Client Phone */}

                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientPhone">
                                    <Form.Label>Client Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Number"
                                        name="clientPhone"
                                        value={phoneBookNumber} // Remove spaces from the display
                                        onChange={handlePhoneInputChange}
                                        isInvalid={!!errors.clientPhone}
                                        disabled

                                    />
                                    {errorMessages.contactNumber && (
                                        <div className="text-danger">
                                            <p style={{ fontSize: '12px' }}>{errorMessages.contactNumber}</p>
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* WhatsApp Number */}
                            <Col md={4}>
                                <Form.Label>WhatsApp Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Whatsapp Number"
                                    name="clientPhone"
                                    value={whatsappContact?.replace(/\s/g, '')} // Remove spaces from the display
                                    onChange={handlewhatsppPhoneInputChange}
                                    isInvalid={!!errors.clientPhone}
                                    disabled={isClientNameDisabled}
                                />
                            </Col>

                            {/* Emirates ID */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientEID">
                                    <Form.Label>Emirates ID</Form.Label>
                                    <InputMask
                                        mask="999-9999-9999999-9"
                                        value={eid}
                                        onChange={handleEidInputChange}
                                        disabled={isClientNameDisabled}
                                    >
                                        {(inputProps) => (
                                            <Form.Control
                                                {...inputProps}
                                                type="text"
                                                placeholder="784-1234-1234567-1"
                                                name="clientEID"
                                                isInvalid={!!errors.clientEID}

                                            />
                                        )}
                                    </InputMask>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            {/* Client Name */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientName">
                                    <Form.Label>Client Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Name"
                                        name="clientName"
                                        value={clientName}
                                        onChange={handleClientNameHandler}
                                        onPaste={handleClientNameHandler}
                                        isInvalid={!!errors.clientName}
                                        disabled={isClientNameDisabled} // Disable based on state
                                    />
                                    {errorMessages.clientName && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.clientName} </p></div>}
                                </Form.Group>
                            </Col>

                            {/* Company Name */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="company_Name">
                                    <Form.Label>Company Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Company Name"
                                        name="company_Name"
                                        value={companyName}
                                        onChange={handleCompanyInputChange}
                                        disabled={isClientNameDisabled} // Disable based on state
                                    />
                                </Form.Group>
                            </Col>

                            {/* Client Email */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientEmail">
                                    <Form.Label>Client Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter Email"
                                        name="clientEmail"
                                        value={clientEmail}
                                        onChange={handleEmailInputChange}
                                        isInvalid={!!errors.clientEmail}
                                        disabled={isClientNameDisabled} // Disable based on state
                                    />
                                </Form.Group>
                            </Col>
                        </Row>


                        <Row>
                            {/* Product Select Dropdown */}
                            {!productUserSlice && (
                                <Col md={4}>
                                    <Form.Group controlId="product">
                                        <Form.Label>Product</Form.Label>
                                        <Form.Select
                                            aria-label="Select Product"
                                            name="product"
                                            value={product}
                                            onChange={handleProductInputChange}
                                            disabled={isClientNameDisabled} // Disable based on state
                                        >
                                            <option value="">Select Product</option>
                                            {productNamesSlice.map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errorMessages.product && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.product}</p> </div>}
                                    </Form.Group>
                                </Col>
                            )}

                            {branchUserSlice === null && (
                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="branch">
                                        <Form.Label>Branch</Form.Label>
                                        <Form.Select
                                            aria-label="Select Branch"
                                            name="branch"
                                            value={branch}
                                            onChange={handleBranchname}
                                            isInvalid={!!errors.branch}
                                            disabled={isClientNameDisabled} // Disable based on state
                                        >
                                            <option value="">Select Branch</option>
                                            {branchesSlice.map((branch, index) => (
                                                <option key={index} value={branch._id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.branch}
                                        </Form.Control.Feedback>
                                        {errorMessages.branch && (
                                            <div className="text-danger">
                                                <p style={{ fontSize: '12px' }}>{errorMessages.branch}</p>
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            )}

                            {/* Pipeline Select Dropdown */}
                            {pipelineUserSlice?.length === 0 && (
                                <Col md={4}>
                                    <Form.Label>Pipeline</Form.Label>
                                    <Form.Select
                                        aria-label="Select Pipeline"
                                        name="pipeline"
                                        value={pipelineId}
                                        onChange={handlePipelineInputChange}
                                        disabled={isClientNameDisabled} // Disable based on state
                                    >
                                        <option value="">Select Pipeline</option>
                                        {filteredPipelines.map(pipeline => (
                                            <option key={pipeline._id} value={pipeline._id}>
                                                {pipeline.name}
                                            </option>
                                        ))}
                                        {errorMessages.pipelineId && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.pipelineId}</p> </div>}
                                    </Form.Select>
                                </Col>
                            )}

                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="product_stage">
                                    <Form.Label>Product Stages</Form.Label>
                                    <Form.Select
                                        aria-label="Select Product Stage"
                                        name="product_stage"
                                        value={selectedProductStage}
                                        onChange={handleInputChangeProductstage}
                                        isInvalid={!!errors.product_stage}
                                        disabled={isClientNameDisabled} // Disable based on state
                                    >
                                        <option value="">Select Product Stage</option>
                                        {productStage.map(stage => (
                                            <option key={stage._id} value={stage._id}>
                                                {stage.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.product_stage}
                                    </Form.Control.Feedback>
                                    {errorMessages.selectedProductStage && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.selectedProductStage}</p></div>}
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Lead Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        name="description"
                                        value={leadDetails}
                                        onChange={handleLeadDetailsInputChange}
                                        isInvalid={!!errors.description}
                                        disabled={isClientNameDisabled}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>

                            <Col md={4} >
                                {(userRole === 'TS Agent' || userRole === 'TS Team Leader') && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Users</Form.Label>
                                        <Select
                                            options={userOptions} // Pass the filtered user options
                                            value={selectedUsers} // Value for the selected users
                                            onChange={(options) => {
                                                setSelectedUsers(options); // Update the selected users
                                            }}
                                            isMulti // Allow multiple user selection
                                            placeholder="Select users..."
                                        />
                                    </Form.Group>
                                )}
                            </Col>
                        </Row>
                    </Form>

                    {errorMessage && <div className="alert alert-danger">{errorMessage.message}</div>}

                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container'
                        onClick={() => {
                            setPhoneBookModal(false);
                            resetFormFields(); // Clear the fields when closing the modal
                            setIsClientNameDisabled(false)
                        }}

                    >
                        Close
                    </Button>
                    {
                        apiData && apiData.isRejected ?
                            <Button className='all_single_leads_button' onClick={handleSaveChanges} disabled={disableField}>
                                Update
                            </Button>
                            :

                            <Button className='all_single_leads_button' onClick={handleSubmit} disabled={disableField} >
                                Submit
                            </Button>
                    }
                </Modal.Footer>
            </Modal>

        </>
    );
};

export default CreatePhoneBook;