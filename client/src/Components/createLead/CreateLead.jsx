import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './CreateLead.css';
import { Button, Row, Col, Modal, Form, Image } from 'react-bootstrap'
import Select from 'react-select';
import { GoCheck } from "react-icons/go";
import InputMask from "react-input-mask";
import { TiDeleteOutline } from "react-icons/ti";
import { ImBlocked } from "react-icons/im";
import blovkimage from '../../Assets/blovkimage.png'

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const CreateLead = ({ setModal2Open, modal2Open, fetchLeadsData }) => {
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
    const [leadType, setLeadType] = useState('')
    const [source, setSource] = useState('')
    const [leadDetails, setLeadDetails] = useState('')
    const [thirdparty, setThirdParty] = useState('')
    const [isValid, setIsValid] = useState(false);
    const [fullPhoneNumber, setFullPhoneNumber] = useState('');
    const [errorMessages, setErrorMessages] = useState({});
    const [matchingProduct, setMatchingProduct] = useState(false)
    const [movePipeline, setMovePipeline] = useState(false)
    const [apiData, setApiData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('')
    const [moveModalSuccessMessage, setMoveModalSuccessMessage] = useState(false)
    const [transferModalSuccessMessage, setTransferModalSuccessMessage] = useState(false)
    const [productEnableTransfer, setProductEnableTransfer] = useState(true)
    const [leadId, setLeadId] = useState('')
    const [moveSuccessMessage, setMoveSuccessMessage] = useState('')
    const [transferSuccessMessage, setTransferSuccessMessage] = useState('')
    const [transferErrorMessage, setTransferErrorMessage] = useState('')
    const [moveErrorMessage, setMoveErrorMessage] = useState('')
    const [rejectedNumberModal, setRejectedNumberModal] = useState(false)
    const [isClientNameDisabled, setIsClientNameDisabled] = useState(false);
    const [restoreModal, setRestorModal] = useState(false)
    const [Restoredescription, setRestoreDescription] = useState('');
    const [restoreData, setRestoreData] = useState('')
    const [phonebookEntry, setPhonebookEntry] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [blockModal, setBlockmodal] = useState(false)
    const [authorizedModal, setAuthorizedmodal] = useState(false);
    const [currentBranch, setCurrentBranch] = useState('')
    const [currentProduct, setCurrentProduct] = useState('')
    const [currentPipeLine, setCurrentPipeline] = useState('')
    const [currentProductStage, setCurrentProductStage] = useState('')
    console.log(currentBranch,currentProduct,currentPipeLine,currentProductStage,'currentProductStage')

    // Auth Token
    const token = useSelector(state => state.loginSlice.user?.token);
    const userId = useSelector(state => state.loginSlice.user?._id);
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
        // Check if contactNumber is less than 9 digits
        if (!contactNumber) {
            newErrors.contactNumber = "Number is required.";
        } else if (contactNumber.length < 9) {
            newErrors.contactNumber = "9 digits are required."; // Display error if contactNumber is less than 9 digits
        }
        if (!clientName) newErrors.clientName = "Name is required.";
        if (!selectedProductStage) newErrors.selectedProductStage = "Product stage is required.";
        if (!leadType) newErrors.leadType = "Lead type is required.";
        if (['CEO', 'MD', 'Superadmin'].includes(userRole)) {
            if (!pipelineId) newErrors.pipelineId = "pipelineId is required.";
            if (!product) newErrors.product = "Product is required.";
            if (!branch) newErrors.branch = "Branch is required.";
        }
        if (!source) newErrors.source = "Source is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrorMessages(newErrors);
            return; // Stop submission if there are errors
        }

        try {
            await axios.post(`/api/leads/create-lead`, {
                clientPhone: contactNumber,
                clientw_phone: whatsappContact,
                clientName: clientName,
                clientEmail: clientEmail,
                cliente_id: eid,
                company_Name: companyName,
                product_stage: selectedProductStage,
                lead_type: leadType,
                pipeline: pipelineId ? pipelineId : userPipeline,
                products: product ? product : userProduct, // Conditionally send products
                source: source,
                description: leadDetails,
                branch: branch ? branch : userBranch,
                thirdpartyname: thirdparty,
                selected_users: selectedUsers
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchLeadsData(getProductID, getBranchID)
            setModal2Open(false)
            resetFormFields();
        } catch (error) {
            setErrorMessage(error.response.data)
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
            setModal2Open(false);
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

            const { leadDetails, phonebookEntry } = response.data;
            setLeadDetails(leadDetails);
            setPhonebookEntry(phonebookEntry);

            // Check if leadDetails is empty
            if (!leadDetails || leadDetails.length === 0) {
                if (phonebookEntry) {
                    // Check if the phonebook entry is blocked
                    if (phonebookEntry.status === "BLOCKED") {
                        setBlockmodal(true)
                        if (!blockModal) {
                            setIsValidPhone(false); // Set phone as invalid and stop further processing if user cancels
                            return;
                        }
                    } else {
                        // Check if the user is authorized
                        if (userId !== phonebookEntry.user._id) {
                            setAuthorizedmodal('You are not authorized to create a lead for this phone number.')
                            setIsValidPhone(false);
                            return; // Stop further execution if user is not authorized
                        }

                        // Show an alert if the number is not blocked but no lead details were found
                        // alert(`
                        //     No lead data found for this phone number. 
                        //     Please see the following phone book data:

                        //     Number: ${phonebookEntry.number}
                        //     Status: ${phonebookEntry.status}
                        //     Call Status: ${phonebookEntry.calstatus}

                        //     User: ${phonebookEntry.user.name} (${phonebookEntry.user.email})
                        //     Pipeline: ${phonebookEntry.pipeline.name}
                        //     Uploaded by: ${phonebookEntry.uploaded_by.name}

                        //     Visibility: ${phonebookEntry.visibility.map(user => `${user.name} (${user.email})`).join(', ')}
                        // `);
                    }
                }
                // else {
                //     alert("No lead data or phone book entry found for this phone number.");
                // }
                setIsValidPhone(false);
                return; // Stop further execution if no lead details are found
            }

            const responseData = leadDetails[0];
            setApiData(responseData); // Save the first object in state
            setCurrentBranch(responseData?.branch?._id)
            setCurrentProduct(responseData?.products?._id)
            setCurrentPipeline(responseData?.pipeline?._id)
            setCurrentProductStage(responseData?.productStage?._id)
            setIsValidPhone(true); // Assuming the response means it's valid

            if (responseData && responseData.client.phone === completePhoneNumber) {
                // Check if the lead is rejected
                if (responseData.isRejected) {
                    setRejectedNumberModal(true);
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

                    // Disable the client name input if the phone number matches
                    setIsClientNameDisabled(true);

                    // Set the selected product stage if available
                    if (responseData.productStage && responseData.productStage._id) {
                        setSelectedProductStage(responseData.productStage._id);
                    }
                } else {
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

                    // Disable the client name input if the phone number matches
                    setIsClientNameDisabled(true);

                    // Set the selected product stage if available
                    if (responseData.productStage && responseData.productStage._id) {
                        setSelectedProductStage(responseData.productStage._id);
                    }

                    // Open the modal after a delay
                    setTimeout(() => {
                        setMovePipeline(true); // Open the modal
                    }, 1000); // 1-second delay
                }
            }

        } catch (error) {
            setIsValidPhone(false); // Set phone as invalid if there's an error
        }
    };




    // Function to handle input change and trigger API call when the phone is complete
    const
        handlePhoneInputChange = (e) => {
            const value = e.target.value;
            setErrors((prevErrors) => ({ ...prevErrors, clientPhone: '' }));
            // setDisableField(value.trim() === '');

            // let processedValue = value.startsWith('0') ? value.slice(1) : value;
            let processedValue = value.replace(/^\+971\s?/, '').replace(/^0+/, '');
            const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9); // Keep only digits
            const formattedValue = digitsOnly?.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'); // Format the number

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
                setLeadType('');
                setSource('');
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

    const handleSourceInputChange = (e) => {
        const value = e.target.value
        setSource(value)

        setDisableField(value.trim() === '');
        if (errorMessages.source) {
            setErrorMessages((prev) => ({ ...prev, source: '' }));
        }
    }
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

    // Input change handler
    const handleInputChange = (isValidNumber, value, countryData) => {
        setWhatsappContact(value); // Update state with the new value

        // countryData might still be undefined, so we check for it
        if (countryData) {
            setIsValid(isValidNumber); // Check if the number is valid
        } else {
            setIsValid(false); // Fallback if countryData is undefined
        }
    };

    const userOptions = allUsers
        .filter(user => user.role === 'TS Team Leader') // Filter users by role
        .map(user => ({
            value: user._id,
            label: user.name
        }));

    const handlethirdpartyInputChange = (e) => {
        const value = e.target.value
        setThirdParty(value)

        setDisableField(value.trim() === '');
    }

    const TransferCase = (leadId) => {
        setMovePipeline(false)
        setTransferModalSuccessMessage(true)
        setLeadId(leadId)

    }

    const MoveLead = (leadId) => {
        setMovePipeline(false)
        setMoveModalSuccessMessage(true)
        setLeadId(leadId)
    }

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
        setLeadType('');
        setSource('');
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

    // Transfer Change
    const handleTransferChange = (e) => {
        const value = e.target.value;
        setProduct(value);

        // Enable the button when a product is selected
        if (value) {
            setProductEnableTransfer(false);
        } else {
            setProductEnableTransfer(true); // Re-enable if the selection is cleared
        }
    };
    // Move Request API
    const sendMoveRequest = async () => {
        try {
            const payload = {
                lead_id: leadId,
                message: "Move Request", // Example message
                branch, // The selected branch
                products: product, // The selected product
                product_stage: selectedProductStage, // The selected product stage
                pipeline_id: pipelineId, // The selected pipeline ID
                type: "Move", // Example type (you can customize this if necessary)
                currentBranch:currentBranch,
                currentProduct:currentProduct,
                currentPipeline:currentPipeLine,
                currentProductStage:currentProductStage
            };

            const sendRequest = await axios.post(
                `/api/request/create-request`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMoveSuccessMessage(sendRequest.data.message)
            setTimeout(() => {
                resetFormFields();
                setMoveSuccessMessage(false)
                setMoveModalSuccessMessage(false)
                setIsClientNameDisabled(false)
                setModal2Open(false);
            }, 2000)
        } catch (error) {
            setMoveErrorMessage(error.response.data.message)
            setTimeout(() => {
                resetFormFields();
                setMoveErrorMessage(false)
                setMoveModalSuccessMessage(false)
                setIsClientNameDisabled(false)
            }, 2000)
        }
    };

    const sendTransferRequest = async () => {
        try {
            const payload = {
                lead_id: leadId,
                message: "Transfer Request", // Example message
                branch, // The selected branch
                products: product, // The selected product
                product_stage: selectedProductStage, // The selected product stage
                pipeline_id: pipelineId, // The selected pipeline ID
                type: "Transfer", // Example type (you can customize this if necessary)
                currentBranch:currentBranch,
                currentProduct:currentProduct,
                currentPipeline:currentPipeLine,
                currentProductStage:currentProductStage
            };

            const sendRequest = await axios.post(
                `/api/request/create-request`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTransferSuccessMessage(sendRequest.data.message)
            setTimeout(() => {
                resetFormFields();
                setTransferSuccessMessage(false)
                setTransferModalSuccessMessage(false)
                setIsClientNameDisabled(false)
                setModal2Open(false);
            }, 2000)

        } catch (error) {
            setTransferErrorMessage(error.response.data.message)
            setTimeout(() => {
                resetFormFields();
                setTransferErrorMessage(false)
                setTransferModalSuccessMessage(false)
                setIsClientNameDisabled(false)
            }, 2000)
        }
    }

    const UpdateRejectHandler = (apidata) => {
        if (apiData && apiData.isRejected) {
            setModal2Open(false);
            setRejectedNumberModal(false);
            setIsClientNameDisabled(false)
            setRestorModal(true)
            setRestoreData(apidata)
            resetFormFields();
        }
    };

    const handleRestore = async () => {
        // Check if the restoreData matches the given conditions
        if (
            (restoreData.products._id === product || userProduct) &&
            (restoreData.pipeline._id === pipelineId || userPipeline)
        ) {
            // Show confirmation modal instead of alert
            setShowConfirmModal(true);
            return;
        }

        // Proceed with the API call if the modal condition is not met
        await performRestore();
    };

    const performRestore = async () => {
        try {
            // Perform the API call to restore the lead
            await axios.put(
                `/api/leads/restore-lead/${restoreData.id}`,
                {
                    product_stage: selectedProductStage,
                    pipeline_id: pipelineId || userPipeline,
                    products: product || userProduct,
                    description: Restoredescription,
                    branch: branch || userBranch,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Close modal and clear data after successful restore
            setRestorModal(false);
            setRestoreData('');
        } catch (error) {
            console.error('Error restoring lead:', error);
        }
    };

    return (
        <>
            <Modal
                title="Create Lead"
                centered
                show={modal2Open}
                size="xl"
                scrollable
                onHide={() => {
                    setModal2Open(false);
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
                            <Col md={1}>
                                <Form.Group className="mb-3" controlId="clientPhone">
                                    <Form.Label>Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="+971"
                                        value="+971"
                                        disabled
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3" controlId="clientPhone">
                                    <Form.Label>Client Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Number"
                                        name="clientPhone"
                                        value={contactNumber.replace(/\s/g, '')} // Remove spaces from the display
                                        onChange={handlePhoneInputChange}
                                        isInvalid={!!errors.clientPhone}

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
                                        {productStage?.map(stage => (
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
                                <Form.Group className="mb-3" controlId="lead_type">
                                    <Form.Label>Lead Type</Form.Label>
                                    <Form.Select
                                        aria-label="Select Lead Type"
                                        name="lead_type"
                                        value={leadType}
                                        onChange={handleInputChangeLeadType}
                                        isInvalid={!!errors.lead_type}
                                        disabled={isClientNameDisabled} // Disable based on state
                                    >
                                        <option value="">Select Lead Type</option>
                                        {leadTypeSlice.map((type, index) => (
                                            <option key={index} value={type._id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lead_type}
                                    </Form.Control.Feedback>
                                    {errorMessages.leadType && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.leadType} </p> </div>}
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="source">
                                    <Form.Label>Source</Form.Label>
                                    <Form.Select
                                        aria-label="Select Source"
                                        name="source"
                                        value={source}
                                        onChange={handleSourceInputChange}
                                        isInvalid={!!errors.source}
                                        disabled={isClientNameDisabled} // Disable based on state
                                    >
                                        <option value="">Select Source</option>
                                        {sources.map((source, index) => (
                                            <option key={index} value={source._id}>
                                                {source.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.source}
                                    </Form.Control.Feedback>
                                    {errorMessages.source && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.source}</p> </div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Lead Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={leadDetails}
                                        onChange={handleLeadDetailsInputChange}
                                        isInvalid={!!errors.description}
                                        disabled={isClientNameDisabled}
                                    />
                                </Form.Group>
                            </Col>

                            {leadType.name === "others" && source.name === "Third Party" && (
                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="thirdparty">
                                        <Form.Label>Third Party Name</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            name="thirdparty"
                                            value={thirdparty}
                                            onChange={handlethirdpartyInputChange}
                                        />
                                    </Form.Group>
                                </Col>
                            )}

                            {(userRole === 'TS Agent' || userRole === 'TS Team Leader') && (
                                <Col md={4} >
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
                                </Col>
                            )}
                        </Row>
                    </Form>

                    {errorMessage && <div className="alert alert-danger">{errorMessage.message}</div>}

                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container'
                        onClick={() => {
                            setModal2Open(false);
                            resetFormFields(); // Clear the fields when closing the modal
                            setIsClientNameDisabled(false)
                        }}

                    >
                        Close
                    </Button>
                    {/* {
                        apiData && apiData.isRejected ?
                            <Button className='all_single_leads_button' onClick={handleSaveChanges} disabled={disableField}>
                                Update
                            </Button>
                            : */}

                    <Button className='all_single_leads_button' onClick={handleSubmit} disabled={disableField} >
                        Submit
                    </Button>
                    {/* } */}
                </Modal.Footer>
            </Modal>

            {/* Matching Model */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={matchingProduct}
                onHide={() => setMatchingProduct(false)}
            >
                <Modal.Body>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        <GoCheck style={{ fontSize: '100px', color: 'green' }} />
                    </div>
                    <p className='text-center' >
                        Lead Already Exist in Product <span style={{ fontWeight: 'bold' }} >{apiData && apiData.products.name}</span> and Pipeline <span style={{ fontWeight: 'bold' }}>{apiData && apiData.pipeline.name}</span>
                    </p>

                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setMatchingProduct(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* If PipeLine is Change than open a modal of Move */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={movePipeline}
                onHide={() => setMovePipeline(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Lead Already Exists
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {apiData && apiData ? (
                        <>
                            <p>
                                A lead already exists for the client <strong>{apiData && apiData.client.name}</strong> with the following details:
                            </p>
                            <ul>
                                <li>Product: <strong>{apiData && apiData.products.name}</strong></li>
                                <li>Branch: <strong>{apiData && apiData.branch.name}</strong></li>
                                <li>Pipeline: <strong>{apiData && apiData.pipeline.name}</strong></li>
                                <li>Stage: <strong>{apiData && apiData.productStage.name}</strong></li>
                            </ul>
                            <p>
                                If you wish to work with this lead, please submit a Move or Transfer Request to the <strong>{apiData && apiData.products.name}</strong>. HOD/Manager.
                            </p>
                        </>
                    ) : (
                        <p>Loading lead data...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {/* <Button className='all_close_btn_container' onClick={() => setMovePipeline(false)} >Close</Button> */}
                    <Button className='all_single_leads_button' onClick={() => MoveLead(apiData && apiData.id)} >Move Request </Button>
                    <Button className='all_single_leads_button' onClick={() => TransferCase(apiData && apiData.id)} >Transfer Request </Button>
                </Modal.Footer>
            </Modal>

            {/* Move Modal Success  */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={moveModalSuccessMessage}
                onHide={() => setMoveModalSuccessMessage(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Move Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {moveSuccessMessage && <div className="alert alert-success">{moveSuccessMessage}</div>} {/* Display error message */}
                    {moveErrorMessage && <div className="alert alert-danger">{moveErrorMessage}</div>} {/* Display error message */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2" controlId="product">
                                <Form.Label>Product</Form.Label>
                                <Form.Select
                                    aria-label="Select Product"
                                    name="product"
                                    value={product}
                                    onChange={handleProductInputChange}
                                    disabled
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

                        <Col md={6}>
                            <Form.Group className="mb-2" controlId="branch">
                                <Form.Label>Branch</Form.Label>
                                <Form.Select
                                    aria-label="Select Branch"
                                    name="branch"
                                    value={branch}
                                    onChange={handleBranchname}
                                    isInvalid={!!errors.branch}
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
                                {errorMessages.branch && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.branch}</p> </div>}
                            </Form.Group>
                        </Col>

                        <Col md={6} className="mb-2">
                            <Form.Label>Pipeline</Form.Label>
                            <Form.Select
                                aria-label="Select Pipeline"
                                name="pipeline"
                                value={pipelineId}
                                onChange={handlePipelineInputChange}
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


                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="product_stage">
                                <Form.Label>Product Stages</Form.Label>
                                <Form.Select
                                    aria-label="Select Product Stage"
                                    name="product_stage"
                                    value={selectedProductStage}
                                    onChange={handleInputChangeProductstage}
                                    isInvalid={!!errors.product_stage}
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
                    </Row>

                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => {
                        resetFormFields();
                        setIsClientNameDisabled(false)
                        setMoveModalSuccessMessage(false)
                        setModal2Open(true);
                    }}>Close</Button>
                    <Button className='all_single_leads_button' onClick={() => {
                        resetFormFields();
                        // setIsClientNameDisabled(false)
                        // setMoveModalSuccessMessage(false)
                        // setModal2Open(false);
                        sendMoveRequest()
                    }}>Send Request</Button>
                </Modal.Footer>
            </Modal>

            {/* Transfer Modal Success  */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={transferModalSuccessMessage}
                onHide={() => setTransferModalSuccessMessage(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Transfer Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {transferErrorMessage && <div className="alert alert-danger">{transferErrorMessage}</div>} {/* Display error message */}
                    {transferSuccessMessage && <div className="alert alert-success">{transferSuccessMessage}</div>} {/* Display error message */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2" controlId="product">
                                <Form.Label>Product</Form.Label>
                                <Form.Select
                                    aria-label="Select Product"
                                    name="product"
                                    value={product}
                                    onChange={handleTransferChange}
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

                        <Col md={6}>
                            <Form.Group className="mb-2" controlId="branch">
                                <Form.Label>Branch</Form.Label>
                                <Form.Select
                                    aria-label="Select Branch"
                                    name="branch"
                                    value={branch}
                                    onChange={handleBranchname}
                                    isInvalid={!!errors.branch}
                                    disabled={productEnableTransfer}
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
                                {errorMessages.branch && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.branch}</p> </div>}
                            </Form.Group>
                        </Col>


                        <Col md={6} className="mb-2">
                            <Form.Label>Pipeline</Form.Label>
                            <Form.Select
                                aria-label="Select Pipeline"
                                name="pipeline"
                                value={pipelineId}
                                onChange={handlePipelineInputChange}
                                disabled={productEnableTransfer}
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


                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="product_stage">
                                <Form.Label>Product Stages</Form.Label>
                                <Form.Select
                                    aria-label="Select Product Stage"
                                    name="product_stage"
                                    value={selectedProductStage}
                                    onChange={handleInputChangeProductstage}
                                    isInvalid={!!errors.product_stage}
                                    disabled={productEnableTransfer}
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
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => {
                        resetFormFields();
                        setIsClientNameDisabled(false)
                        setTransferModalSuccessMessage(false)
                        setModal2Open(true);
                    }}>Close</Button>
                    <Button disabled={productEnableTransfer} className='all_single_leads_button' onClick={() => {
                        resetFormFields();
                        // setIsClientNameDisabled(false)
                        // setTransferModalSuccessMessage(false)
                        // setModal2Open(false);
                        sendTransferRequest()
                    }}>Send Request</Button>
                </Modal.Footer>
            </Modal>

            {/* Rejected NUumber Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={rejectedNumberModal}
                onHide={() => setRejectedNumberModal(false)}
            >
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p>
                        This Number is Exist in Rejected Lead. If You Want to Update Click on Yes
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className='all_close_btn_container'
                        onClick={() => {
                            setRejectedNumberModal(false);
                            setModal2Open(false);
                            setIsClientNameDisabled(false)
                            resetFormFields(); // Clear the fields when closing the modal
                        }}
                    >
                        No
                    </Button>
                    <Button className='all_single_leads_button' onClick={() => UpdateRejectHandler(apiData)} >Yes</Button>
                </Modal.Footer>
            </Modal>

            {/* Restore Modal */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={restoreModal}
                onHide={() => setRestorModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Update Rejected Lead
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Product Select Dropdown */}
                    {!productUserSlice && (
                        <Col md={12}>
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
                        <Col md={12}>
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
                        <Col md={12}>
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


                    <Col md={12}>
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
                    <div className="mt-3">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            rows="4"
                            className="form-control"
                            value={Restoredescription}
                            onChange={(e) => setRestoreDescription(e.target.value)}
                            placeholder="Enter description here..."
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setRestorModal(false)}>Close</Button>
                    <Button onClick={() => handleRestore()}>Restore</Button>

                </Modal.Footer>
            </Modal>

            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Confirm To Restore Lead
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        This Lead is Rejected with same Product and Pipeline on Data {new Date(restoreData.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })} Do You want to Restore it again ??
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowConfirmModal(false)}>No</Button>
                    <Button onClick={() => { performRestore(); setShowConfirmModal(false); }}>Yes</Button>
                </Modal.Footer>
            </Modal>

            {/* Block Number Modal */}
            <Modal
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={blockModal}
                onHide={() => setBlockmodal(false)}
            >
                <Modal.Body className='text-center' >
                    {/* <ImBlocked style={{ fontSize: '80px', color: 'red' }} /> */}
                    <Image src={blovkimage} className='' alt='Blocked Image' style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
                    <p className='mt-1'>
                        {`This number is blocked by Etisalat. If you'd like to create a lead, please click `}
                        <strong>YES</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className='all_close_btn_container'
                        onClick={() => {
                            setBlockmodal(false);
                            setModal2Open(false);
                            resetFormFields();
                        }}
                    >
                        No
                    </Button>
                    <Button
                        className='all_single_leads_button'
                        onClick={() => {
                            setBlockmodal(false);
                            // resetFormFields();
                        }}
                    >
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Authorized Number Modal */}
            <Modal
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={authorizedModal}
                onHide={() => setAuthorizedmodal(false)}
            >
                <Modal.Body className='text-center' >
                    <ImBlocked style={{ fontSize: '80px', color: 'red' }} />
                    <p className='mt-3'>
                        {`You are not Authorized to create the lead because this number is assigned to `}
                        <strong>{phonebookEntry?.user.name}</strong>
                        {`. You can contact them at `}
                        <strong>{phonebookEntry?.user.email}</strong>
                        {` for further assistance regarding `}
                        <strong>{phonebookEntry?.number}</strong>.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className='all_close_btn_container'
                        onClick={() => {
                            setAuthorizedmodal(false);
                            setModal2Open(false);
                            resetFormFields();
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CreateLead;