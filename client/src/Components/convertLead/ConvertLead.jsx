import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button, Form, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';
import './convertLeadStyle.css'
import { FiAlertCircle } from "react-icons/fi";

const ConvertLead = ({ leadId, setLeadToContract, leadtocontract, fetchSingleLead, contractModal, setContractModal }) => {
    // User Token
    const token = useSelector(state => state.loginSlice.user?.token)
    const [leadData, setLeadData] = useState({});
    const [hodOptions, setHodOptions] = useState([]);
    const [managerOptions, setManagerOptions] = useState([]);
    const [coordinatorOptions, setCoordinatorOptions] = useState([]);
    const [teamLeaderOptions, setTeamLeaderOptions] = useState([]);
    const [tsAgentOptions, setTsAgentOptions] = useState([]);
    const [developerOptions, setDeveloperOptions] = useState([])
    const [marketingOptions, setMarketingOptions] = useState([])
    const [financialAmount, setFinancialAmount] = useState('');
    const [bankCommission, setBankCommission] = useState('');
    const [customerCommission, setCustomerCommission] = useState('');
    const [revenueWithVat, setRevenueWithVat] = useState('');
    const [revenueWithoutVat, setRevenueWithoutVat] = useState('');
    const [brokerName, setBrokerName] = useState('')
    const [otherPersonName, setOtherPersonName] = useState('')
    const [userOptions, setUserOptions] = useState([]);
    const [selectedHod, setSelectedHod] = useState(null);
    const [selectedManger, setSelectedManager] = useState(null);
    const [selectedCoordinator, setSelectedCoordinator] = useState(null)
    const [selectedTeamLeader, setSelectedTeamLeader] = useState(null)
    const [selectedTeamLeaderOne, setSelectedTeamLeaderOne] = useState(null)
    const [selectedSalesAgent, setSelectedSalesAgent] = useState(null)

    const [selectedSalesAgentOne, setSelectedSalesAgentOne] = useState(null)
    const [selectedSalesAgenttwo, setSelectedSalesAgentTwo] = useState(null)

    const [selectedMarketingManager, setSelectedMarketingManager] = useState(null)
    const [selectedMarketingManagerOne, setSelectedMarketingManagerOne] = useState(null)

    // IT Team
    const [selectedItManager, setSelectedItManager] = useState(null)
    const [developer, setDeveloper] = useState(null)
    const [developerOne, setDeveloperOne] = useState(null)
    const [developerTwo, setDeveloperTwo] = useState(null)

    const [selectedMarketingAgent, setSelectedMarketingAgent] = useState(null)
    const [selectedMarketingAgentOne, setSelectedMarketingOneAgent] = useState(null)

    const [selectedTeleSalesMaangers, setSelectedTeleSalesMaangers] = useState(null)
    const [selectedtelesalesTeamLeader, setSelectedTeleSalesTeamLeader] = useState(null)
    const [selectedtelesalesAgent, setSelectedTeleSalesAgent] = useState(null)
    const [selectedtelesalesAgentOne, setSelectedTeleSalesAgentOne] = useState(null)

    const [brokerCommission, setBrokerCommission] = useState(0);
    const [hodCommissionPercentage, setHodCommissionPercentage] = useState(0);
    const [hodCommission, setHodCommission] = useState(0);
    const [brokerCommissionValue, setBrokerCommissionValue] = useState(0);
    const [salesManagerCommissionPercentage, setSalesManagerCommissionPercentage] = useState(0);
    const [salesManagerCommission, setSalesManagerCommission] = useState(0);
    const [coordinatorCommissionPercentage, setCoordinatorCommissionPercentage] = useState(0);
    const [coordinatorCommission, setCoordinatorCommission] = useState(0);
    const [teamLeaderCommissionPercentage, setTeamLeaderCommissionPercentage] = useState(0);
    const [teamLeaderCommission, setTeamLeaderCommission] = useState(0);
    const [agentCommissionPercentage, setAgentCommissionPercentage] = useState(0);
    const [agentCommission, setAgentCommission] = useState(0);
    const [otherCommissionPercentage, setOtherCommissionPercentage] = useState(0);
    const [otherCommission, setOtherCommission] = useState(0);

    const [teleSalesHodCommissionPercentage, setTeleSalesHodCommissionPercentage] = useState(0);
    const [teleSalesHodCommission, setTeleSalesHodCommission] = useState(0);
    const [teleSalesTeamLeaderCommissionPercentage, setTeleSalesTeamLeaderCommissionPercentage] = useState(0);
    const [teleSalesTeamLeaderCommission, setTeleSalesTeamLeaderCommission] = useState(0);

    const [teleSalesAgentCommissionPercentage, setTeleSalesAgentCommissionPercentage] = useState(0);
    const [teleSalesAgentCommission, setTeleSalesAgentCommission] = useState(0);

    const [teleSalesAgentOneCommissionPercentage, setTeleSalesAgentOneCommissionPercentage] = useState(0);
    const [teleSalesAgentOneCommission, setTeleSalesAgentOneCommission] = useState(0);

    const [marketingManagerCommissionPercentage, setMarketingManagerCommissionPercentage] = useState(0);
    const [marketingManagerOneCommissionPercentage, setMarketingManagerOneCommissionPercentage] = useState(0);
    const [marketingManagerCommission, setMarketingManagerCommission] = useState(0);
    const [marketingManagerOneCommission, setMarketingManagerOneCommission] = useState(0);

    const [marketingAgentCommissionPercentage, setMarketingAgentCommissionPercentage] = useState(0);
    const [marketingAgentCommission, setMarketingAgentCommission] = useState(0);

    const [marketingAgentOneCommissionPercentage, setMarketingAgentOneCommissionPercentage] = useState(0);
    const [marketingAgentOneCommission, setMarketingAgentOneCommission] = useState(0);

    // IT Team Percentage
    const [ItManagerCommission, setItManagerCommission] = useState(0)
    const [ItManagerCommissionPercentage, setItManagerCommissionPercentage] = useState(0)

    const [developerCommission, setDeveloperCommission] = useState(0)
    const [developerCommissionPercentage, setDeveloperCommissionPercentage] = useState(0)

    const [developerOneCommission, setDeveloperOneCommission] = useState(0)
    const [developerOneCommissionPercentage, setDeveloperOneCommissionPercentage] = useState(0)

    const [developerTwoCommission, setDeveloperTwoCommission] = useState(0)
    const [developerTwoCommissionPercentage, setDeveloperTwoCommissionPercentage] = useState(0)

    const [salesManagerRefCommissionTransferPercentage, setSalesManagerRefCommissionTransferPercentage] = useState(0);
    const [salesManagerRefCommissionTransfer, setSalesManagerRefCommissionTransfer] = useState(0);
    const [agentRefCommissionPercentage, setAgentRefCommissionPercentage] = useState(0);
    const [agentRefCommission, setAgentRefCommission] = useState(0);
    const [teamLeaderOnePercentage, setTeamLeaderOnePercentage] = useState(0);
    const [teamLeaderOneCommission, setteamLeaderOneCommission] = useState(0);

    const [agentCommissionOnePercentage, setAgentCommissionOnePercentage] = useState(0);
    const [agentOneCommission, setAgentOneCommission] = useState(0);

    const [agentCommissionTwoPercentage, setAgentCommissiontwoPercentage] = useState(0);
    const [agentTwoCommission, setAgentTwoCommission] = useState(0);



    // Fetch leads data by ID
    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                // Fetch lead data
                const leadResponse = await axios.get(`/api/leads/single-lead/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLeadData(leadResponse.data);

                // Extract selected users by role from lead response
                const selectedUsers = leadResponse.data.selected_users;

                const getUsersByRole = (role) => {
                    return selectedUsers
                        .filter(user => user.role === role)
                        .map(user => ({
                            value: user._id,
                            label: user.name,
                        }));
                };

                // Initialize options for each role using selected_users data if available
                const hodOptions = getUsersByRole("HOD");
                const managerOptions = getUsersByRole("Manager");
                const coordinatorOptions = getUsersByRole("Coordinator");
                const teamLeaderOptions = getUsersByRole("Team Leader");
                const tsAgentOptions = getUsersByRole("Sales");
                const DeveloperOptions = getUsersByRole("Developer");
                const marketingOptions = getUsersByRole("Marketing");

                // Set options that were available in selected_users
                setHodOptions(hodOptions);
                setManagerOptions(managerOptions);
                setCoordinatorOptions(coordinatorOptions);
                setTeamLeaderOptions(teamLeaderOptions);
                setTsAgentOptions(tsAgentOptions);
                setDeveloperOptions(DeveloperOptions)
                setMarketingOptions(marketingOptions)

                // Check if any roles are missing in selected_users and fetch from /api/users/get-users if needed
                if (!(hodOptions.length && managerOptions.length && coordinatorOptions.length && teamLeaderOptions.length && tsAgentOptions.length)) {
                    const usersResponse = await axios.get(`/api/users/get-users`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const allUsers = usersResponse.data;

                    const addFallbackOptions = (role, setOptionsFunc, existingOptions) => {
                        if (!existingOptions.length) {
                            const fallbackOptions = allUsers
                                .filter(user => user.role === role)
                                .map(user => ({
                                    value: user._id,
                                    label: user.name,
                                }));
                            setOptionsFunc(fallbackOptions);
                        }
                    };

                    // Add fallback options for missing roles
                    addFallbackOptions("HOD", setHodOptions, hodOptions);
                    addFallbackOptions("Manager", setManagerOptions, managerOptions);
                    addFallbackOptions("Coordinator", setCoordinatorOptions, coordinatorOptions);
                    addFallbackOptions("Team Leader", setTeamLeaderOptions, teamLeaderOptions);
                    addFallbackOptions("Sales", setTsAgentOptions, tsAgentOptions);
                    addFallbackOptions("Developer", setDeveloperOptions, developerOptions);
                    addFallbackOptions("Marketing", setMarketingOptions, marketingOptions);

                    // Set all users as user options
                    const userOptions = allUsers.map(user => ({
                        value: user._id,
                        label: user.name,
                    }));
                    setUserOptions(userOptions);
                }
            } catch (error) {
                console.error(error, 'Error fetching data');
            }
        };

        if (leadId && token) {
            fetchLeadData();
        }
    }, [leadId, token]);

    useEffect(() => {
        // Calculate revenue based on inputs
        const totalCommission = bankCommission + customerCommission;
        const totalRevenue = totalCommission / 1.05

        // Update revenues
        setRevenueWithVat(totalCommission);
        setRevenueWithoutVat(totalRevenue);
    }, [financialAmount, bankCommission, customerCommission]);

    // Helper function to calculate commission
    const calculateCommission = (adjustedRevenue, percentage) => {
        return (adjustedRevenue * percentage) / 100;
    };
    // Broker Commission Handler
    const handleBrokerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value) || 0;
        setBrokerCommission(percentage);

        // Calculate and update broker commission value
        const commissionValue = calculateCommission(revenueWithoutVat, percentage);
        setBrokerCommissionValue(commissionValue);

        // Adjust all other commissions after the broker commission
        const adjustedRevenue = revenueWithoutVat - commissionValue;

        // Update HOD Commission
        const hodCommissionValue = calculateCommission(adjustedRevenue, hodCommissionPercentage);
        setHodCommission(hodCommissionValue);

        // Update Sales Manager Commission
        const salesManagerCommissionValue = calculateCommission(adjustedRevenue, salesManagerCommissionPercentage);
        setSalesManagerCommission(salesManagerCommissionValue);

        // Update Coordinator Commission
        const coordinatorCommissionValue = calculateCommission(adjustedRevenue, coordinatorCommissionPercentage);
        setCoordinatorCommission(coordinatorCommissionValue);

        // Update Team Leader Commission
        const teamLeaderCommissionValue = calculateCommission(adjustedRevenue, teamLeaderCommissionPercentage);
        setTeamLeaderCommission(teamLeaderCommissionValue);

        // Update Agent Commission
        const agentCommissionValue = calculateCommission(adjustedRevenue, agentCommissionPercentage);
        setAgentCommission(agentCommissionValue);

        // Update Agent Two Commission
        const agentTwoCommissionValue = calculateCommission(adjustedRevenue, agentCommissionTwoPercentage);
        setAgentTwoCommission(agentTwoCommissionValue);

        // Update Other Commission
        const otherCommissionValue = calculateCommission(adjustedRevenue, otherCommissionPercentage);
        setOtherCommission(otherCommissionValue);

        // Update Tele Sales HOD Commission
        const teleSalesHodCommissionValue = calculateCommission(adjustedRevenue, teleSalesHodCommissionPercentage);
        setTeleSalesHodCommission(teleSalesHodCommissionValue);

        // Update Tele Sales Team Leader Commission
        const teleSalesTeamLeaderCommissionValue = calculateCommission(adjustedRevenue, teleSalesTeamLeaderCommissionPercentage);
        setTeleSalesTeamLeaderCommission(teleSalesTeamLeaderCommissionValue);

        // Update Tele Sales Agent Commission
        const teleSalesAgentCommissionValue = calculateCommission(adjustedRevenue, teleSalesAgentCommissionPercentage);
        setTeleSalesAgentCommission(teleSalesAgentCommissionValue);

        // Update Tele Sales Agent one Commission
        const teleSalesAgentOneCommissionValue = calculateCommission(adjustedRevenue, teleSalesAgentOneCommissionPercentage);
        setTeleSalesAgentOneCommission(teleSalesAgentOneCommissionValue);

        // Update Marketing Manager Commission
        const marketingManagerCommissionValue = calculateCommission(adjustedRevenue, marketingManagerCommissionPercentage);
        setMarketingManagerCommission(marketingManagerCommissionValue);

        // Update IT Manager Commission
        const ItManagerCommissionValue = calculateCommission(adjustedRevenue, ItManagerCommissionPercentage);
        setItManagerCommission(ItManagerCommissionValue);

        // Update IT Developer Commission
        const ItDeveloperCommissionValue = calculateCommission(adjustedRevenue, developerCommissionPercentage);
        setDeveloperCommission(ItDeveloperCommissionValue);

        // Update IT Developer One Commission
        const ItDeveloperOneCommissionValue = calculateCommission(adjustedRevenue, developerOneCommissionPercentage);
        setDeveloperOneCommission(ItDeveloperOneCommissionValue);

        // Update IT Developer two Commission
        const ItDeveloperTwoCommissionValue = calculateCommission(adjustedRevenue, developerTwoCommissionPercentage);
        setDeveloperTwoCommission(ItDeveloperTwoCommissionValue);

        // Update Marketing Manager One Commission
        const marketingManagerOneCommissionValue = calculateCommission(adjustedRevenue, marketingManagerOneCommissionPercentage);
        setMarketingManagerOneCommissionPercentage(marketingManagerOneCommissionValue);

        // Update Marketing Agent Commission
        const marketingAgentCommissionValue = calculateCommission(adjustedRevenue, marketingAgentCommissionPercentage);
        setMarketingAgentCommission(marketingAgentCommissionValue);

        // Update Marketing Agent One Commission
        const marketingAgentOneCommissionValue = calculateCommission(adjustedRevenue, marketingAgentOneCommissionPercentage);
        setMarketingAgentOneCommission(marketingAgentOneCommissionValue);


        // Update Transfer Ref sales Manager Commission
        const TransferRefsalesManagerCommissionValue = calculateCommission(adjustedRevenue, salesManagerRefCommissionTransferPercentage);
        setSalesManagerRefCommissionTransfer(TransferRefsalesManagerCommissionValue);

        // Update Transfer Ref sales Agent Commission
        const TransferRefsalesAgentCommissionValue = calculateCommission(adjustedRevenue, agentRefCommissionPercentage);
        setAgentRefCommission(TransferRefsalesAgentCommissionValue);

        // Update TeamLeaderOneCommissionValue Commission
        const TeamLeaderOneCommissionValue = calculateCommission(adjustedRevenue, teamLeaderOnePercentage);
        setteamLeaderOneCommission(TeamLeaderOneCommissionValue);

        // Update SalesAgentOneCommissionValue Commission
        const SalesAgentOneCommissionValue = calculateCommission(adjustedRevenue, agentCommissionOnePercentage);
        setAgentOneCommission(SalesAgentOneCommissionValue);

    };
    // HOD Commission Handler
    const handleHodCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setHodCommissionPercentage(percentage);

        // HOD Commission Handler
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const hodCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setHodCommission(hodCommissionValue);
    };
    // Sales Manager Commission Handler
    const handleSalesManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setSalesManagerCommissionPercentage(percentage);

        // Calculate and update Sales Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const salesManagerCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setSalesManagerCommission(salesManagerCommissionValue);
    };
    // Coordinator Commission Handler
    const handleCoordinatorCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setCoordinatorCommissionPercentage(percentage);

        // Calculate and update Coordinator commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const coordinatorCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setCoordinatorCommission(coordinatorCommissionValue);
    };
    // Team Leader Commission Handler
    const handleTeamLeaderCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeamLeaderCommissionPercentage(percentage);

        // Calculate and update Team Leader commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teamLeaderCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeamLeaderCommission(teamLeaderCommissionValue);
    };
    // Team Leader one Commission Handler
    const handleTeamLeaderOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeamLeaderOnePercentage(percentage);

        // Calculate and update Team Leader commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teamLeaderOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setteamLeaderOneCommission(teamLeaderOneCommissionValue);
    };
    // Agent Commission Handler
    const handleAgentCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentCommissionPercentage(percentage);

        // Calculate and update Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const agentCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setAgentCommission(agentCommissionValue);
    };
    // Agent one Commission Handler
    const handleAgentOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentCommissionOnePercentage(percentage);

        // Calculate and update Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const agentCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setAgentOneCommission(agentCommissionValue);
    };

    // Agent Two Commission Handler
    const handleAgentTwoCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentCommissiontwoPercentage(percentage);

        // Calculate and update Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const agentCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setAgentTwoCommission(agentCommissionValue);
    };


    // Other Commission Handler
    const handleOtherCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setOtherCommissionPercentage(percentage);

        // Calculate and update Other commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const otherCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setOtherCommission(otherCommissionValue);
    };
    // Tele Sales HOD Commission Handler
    const handleTeleSalesHodCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesHodCommissionPercentage(percentage);

        // Calculate and update Tele Sales HOD commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesHodCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesHodCommission(teleSalesHodCommissionValue);
    };
    // Tele Sales Team Leader Commission Handler
    const handleTeleSalesTeamLeaderCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesTeamLeaderCommissionPercentage(percentage);

        // Calculate and update Tele Sales Team Leader commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesTeamLeaderCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesTeamLeaderCommission(teleSalesTeamLeaderCommissionValue);
    };
    // Tele Sales Agent Commission Handler
    const handleTeleSalesAgentCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesAgentCommissionPercentage(percentage);

        // Calculate and update Tele Sales Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesAgentCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesAgentCommission(teleSalesAgentCommissionValue);
    };

    // Tele Sales AgenT one Commission Handler
    const handleTeleSalesAgentOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesAgentOneCommissionPercentage(percentage);

        // Calculate and update Tele Sales Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesAgentOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesAgentOneCommission(teleSalesAgentOneCommissionValue);
    };

    // Marketing Manager Commission Handler
    const handleMarketingManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingManagerCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingManagerCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingManagerCommission(marketingManagerCommissionValue);
    };

    // Marketing Manager One Commission Handler
    const handleMarketingManagerOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingManagerOneCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingManagerOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingManagerOneCommission(marketingManagerOneCommissionValue);
    };

    // Marketing Agent Commission Handler
    const handleMarketingAgentCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingAgentCommissionPercentage(percentage);

        // Calculate and update Marketing Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingAgentCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingAgentCommission(marketingAgentCommissionValue);
    }

    // Marketing Agent One Commission Handler
    const handleMarketingAgentOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingAgentOneCommissionPercentage(percentage);

        // Calculate and update Marketing Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingAgentOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingAgentOneCommission(marketingAgentOneCommissionValue);
    }

    // IT Manager Commission Handler
    const handleItManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setItManagerCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITManagerCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setItManagerCommission(ITManagerCommissionValue);
    };

    // IT Developer Commission Handler
    const handleItDeveloperCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITDeveloperCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setDeveloperCommission(ITDeveloperCommissionValue);
    };

    // IT Developer One Commission Handler
    const handleDeveloperOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperOneCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITDeveloperOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setDeveloperOneCommission(ITDeveloperOneCommissionValue);
    };

    // IT Developer Two Commission Handler
    const handleDeveloperTwoCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperTwoCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITDeveloperOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setDeveloperTwoCommission(ITDeveloperOneCommissionValue);
    };

    // Sales Manager Ref Commission Transfer Handler
    const handleSalesManagerRefCommissionTransferChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setSalesManagerRefCommissionTransferPercentage(percentage);

        // Calculate and update Sales Manager Ref commission based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjusted revenue after broker commission
        const commissionValue = calculateCommission(adjustedRevenue, percentage); // Sales Manager Ref commission calculation
        setSalesManagerRefCommissionTransfer(commissionValue);
    };
    // Agent Ref Commission Handler
    const handleAgentRefCommissionTransferChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentRefCommissionPercentage(percentage);

        // Calculate and update Agent Ref commission based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjusted revenue after broker commission
        const commissionValue = calculateCommission(adjustedRevenue, percentage); // Calculate commission
        setAgentRefCommission(commissionValue);
    };
    useEffect(() => {
        // Reset calculations if revenue changes or commission percentages are set to 0
        if (
            hodCommissionPercentage === 0 ||
            brokerCommission === 0 ||
            salesManagerCommissionPercentage === 0 ||
            coordinatorCommissionPercentage === 0 ||
            teamLeaderCommissionPercentage === 0 ||
            agentCommissionPercentage === 0
        ) {
            // setHodCommission((revenueWithoutVat * hodCommissionPercentage) / 100);
            // setSalesManagerCommission((revenueWithoutVat * salesManagerCommissionPercentage) / 100);
            // setCoordinatorCommission((revenueWithoutVat * coordinatorCommissionPercentage) / 100);
            // setTeamLeaderCommission((revenueWithoutVat * teamLeaderCommissionPercentage) / 100);
            // setAgentCommission((revenueWithoutVat * agentCommissionPercentage) / 100); 
        }
    }, [
        revenueWithoutVat,
        hodCommissionPercentage,
        brokerCommission,
        salesManagerCommissionPercentage,
        coordinatorCommissionPercentage,
        teamLeaderCommissionPercentage,
        agentCommissionPercentage
    ]);

    // onChange Function for HOD
    const HandlerChange = (selectedOption) => {
        if (selectedOption) {
            setSelectedHod(selectedOption);
        }
    };
    // onChange Function for Manager
    const handleManagerChange = (selectedManagerOption) => {
        if (selectedManagerOption) {
            setSelectedManager(selectedManagerOption)
        }
    }
    // onChange Function for Coordinator
    const handleCoordinatorChange = (selectedCoordinatorOption) => {
        if (selectedCoordinatorOption) {
            setSelectedCoordinator(selectedCoordinatorOption)
        }
    }
    // onChange Function for Team Leader
    const handleTeamLeaderChange = (selectedTeamLeaderOption) => {
        if (selectedTeamLeaderOption) {
            setSelectedTeamLeader(selectedTeamLeaderOption)
        }
    }
    // onChange Function for Team Leader One
    const handleTeamLeaderOneChange = (selectedTeamLeaderOneOption) => {
        if (selectedTeamLeaderOneOption) {
            setSelectedTeamLeaderOne(selectedTeamLeaderOneOption)
        }
    }
    // onChange Function for Sales Agent
    const handleSaleAgentChange = (selectedSalesAgentOption) => {
        if (selectedSalesAgentOption) {
            setSelectedSalesAgent(selectedSalesAgentOption)
        }
    }
    // onChange Function for Team  Sales Agent One
    const handleSaleAgentOneChange = (selectedSalesAgentOneOption) => {
        if (selectedSalesAgentOneOption) {
            setSelectedSalesAgentOne(selectedSalesAgentOneOption)
        }
    }

    // onChange Function for Team  Sales Agent One
    const handleSaleAgentTwoChange = (selectedSalesAgentTwoOption) => {
        if (selectedSalesAgentTwoOption) {
            setSelectedSalesAgentTwo(selectedSalesAgentTwoOption)
        }
    }

    // onChange Function for Marketing Manager
    const handleMarketingManagerChange = (selectedMarketingManagerOption) => {
        if (selectedMarketingManagerOption) {
            setSelectedMarketingManager(selectedMarketingManagerOption)
        }
    }

    // onChange Function for Marketing Manager One
    const handleMarketingManagerOneChange = (selectedMarketingManagerOneOption) => {
        if (selectedMarketingManagerOneOption) {
            setSelectedMarketingManagerOne(selectedMarketingManagerOneOption)
        }
    }
    // onChange Function for Marketing Agent
    const handleMarketingAgentChange = (selectedMarketingAgentOption) => {
        if (selectedMarketingAgentOption) {
            setSelectedMarketingAgent(selectedMarketingAgentOption)
        }
    }

    // onChange Function for Marketing Agent One
    const handleMarketingAgentOneChange = (selectedMarketingAgentOneOption) => {
        if (selectedMarketingAgentOneOption) {
            setSelectedMarketingOneAgent(selectedMarketingAgentOneOption)
        }
    }

    // IT Team
    // onChange Function for IT Manager
    const handleITManagerChange = (selectedItManagerOption) => {
        if (selectedItManagerOption) {
            setSelectedItManager(selectedItManagerOption)
        }
    }

    // onChange Function for IT Developer
    const handleItDeveloperChange = (selectedITDeveloperOption) => {
        if (selectedITDeveloperOption) {
            setDeveloper(selectedITDeveloperOption)
        }
    }

    // onChange Function for IT Developer One
    const handleDeveloperOneChange = (selectedITDeveloperOneOption) => {
        if (selectedITDeveloperOneOption) {
            setDeveloperOne(selectedITDeveloperOneOption)
        }
    }

    // onChange Function for IT Developer Two
    const handleDeveloperTwoChange = (selectedITDevelopertwoOption) => {
        if (selectedITDevelopertwoOption) {
            setDeveloperTwo(selectedITDevelopertwoOption)
        }
    }

    // onChange Function for Tele sales Agent
    const handleTelesalesHodChange = (selectedTelesalesOption) => {
        if (selectedTelesalesOption) {
            setSelectedTeleSalesMaangers(selectedTelesalesOption)
        }
    }
    // onChange Function for Tele salesTeam Leader
    const handleTelesalesTeamLeaderChange = (selectedTelesalesTeamLeaderOption) => {
        if (selectedTelesalesTeamLeaderOption) {
            setSelectedTeleSalesTeamLeader(selectedTelesalesTeamLeaderOption)
        }
    }
    // onChange Function for Tele sales Agent
    const handleTelesalesAgentChange = (selectedTelesalesAgentOption) => {
        if (selectedTelesalesAgentOption) {
            setSelectedTeleSalesAgent(selectedTelesalesAgentOption)
        }
    }

    // onChange Function for Tele sales Agent One
    const handleTelesalesAgentOneChange = (selectedTelesalesAgentOneOption) => {
        if (selectedTelesalesAgentOneOption) {
            setSelectedTeleSalesAgentOne(selectedTelesalesAgentOneOption)
        }
    }

    // Post API For Lead Convert to Contract
    const LeadConvertHandler = async () => {
        try {
            await axios.post(`/api/leads/convert-lead-to-contract/${leadId}`, {
                finance_amount: financialAmount,
                bank_commission: bankCommission,
                customer_commission: customerCommission,
                with_vat_commission: revenueWithVat,
                without_vat_commission: revenueWithoutVat,
                hodsale: selectedHod ? selectedHod.value : null,
                hodsalecommission: hodCommission,
                salemanager: selectedManger ? selectedManger.value : null,
                salemanagercommission: salesManagerCommission,
                coordinator: selectedCoordinator ? selectedCoordinator.value : null,
                coordinator_commission: coordinatorCommission,
                team_leader: selectedTeamLeader ? selectedTeamLeader.value : null,
                team_leader_commission: teamLeaderCommission,
                team_leader_one: selectedTeamLeaderOne ? selectedTeamLeaderOne.value : null,
                team_leader_one_commission: teamLeaderOneCommission,
                salesagent: selectedSalesAgent ? selectedSalesAgent.value : null,
                salesagent_commission: agentCommission,
                sale_agent_one: selectedSalesAgentOne ? selectedSalesAgentOne.value : null,
                sale_agent_one_commission: agentOneCommission,
                agent_commission: agentCommission,

                sale_agent_two: selectedSalesAgenttwo ? selectedSalesAgenttwo.value : null,
                sale_agent_two_commission: agentTwoCommission,
                teleSales_agent_one: selectedtelesalesAgentOne ? selectedtelesalesAgentOne.value : null,

                ts_hod: selectedTeleSalesMaangers ? selectedTeleSalesMaangers.value : null,
                ts_hod_commision: teleSalesHodCommission,
                ts_team_leader: selectedtelesalesTeamLeader ? selectedtelesalesTeamLeader.value : null,
                ts_team_leader_commission: teleSalesTeamLeaderCommission,
                tsagent: selectedtelesalesAgent ? selectedtelesalesAgent.value : null,
                tsagent_commission: teleSalesAgentCommission,

                marketingone: selectedMarketingManager ? selectedMarketingManager.value : null,
                marketingonecommission: marketingManagerCommission,

                marketingtwo: selectedMarketingAgent ? selectedMarketingAgent.value : null,
                marketingtwocommission: marketingAgentCommission,

                marketingthree: selectedMarketingManagerOne ? selectedMarketingManagerOne.value : null,
                marketingthreecommission: marketingManagerOneCommission,

                marketingfour: selectedMarketingAgentOne ? selectedMarketingAgentOne.value : null,
                marketingfourcommission: marketingAgentOneCommission,

                developerone: selectedItManager ? selectedItManager.value : null,
                developeronecommission: ItManagerCommission,

                developertwo: developer ? developer.value : null,
                developertwocommission: developerCommission,

                developerthree: developerOne ? developerOne.value : null,
                developerthreecommission: developerTwoCommission,

                developerfour: developerTwo ? developerTwo.value : null,
                developerfourcommission: developerTwoCommission,

                marketingagentOne: selectedMarketingAgentOne ? selectedMarketingAgentOne.value : null,
                marketingagentcommission: marketingAgentCommission,

                other_name: otherPersonName,
                other_name_commission: otherCommission,
                broker_name: brokerName,
                broker_name_commission: brokerCommissionValue,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            fetchSingleLead()
            setLeadToContract(false)
        } catch (error) {
            console.log(error, 'error')
        }
    }

    const openLeadContractModal = () => {
        setLeadToContract(true)
        setContractModal(false)
    }
    return (
        <div>
            <Modal
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={leadtocontract}
                onHide={() => setLeadToContract(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title className='text-center'>
                        Service Application Form
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Card className='convertToLead_card'>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label className='label_class'>Financial Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter Amount"
                                            className='convert_to_lead_input_field'
                                            value={financialAmount}
                                            onChange={(e) => setFinancialAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBankCommission">
                                        <Form.Label className='label_class'>Bank Commission</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Bank Commission"
                                            className='convert_to_lead_input_field'
                                            value={bankCommission}
                                            onChange={(e) => setBankCommission(Math.max(0, parseFloat(e.target.value) || 0))}
                                            required={true}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formCustomerCommission">
                                        <Form.Label className='label_class'>Customer Commission</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Customer Commission"
                                            className='convert_to_lead_input_field'
                                            value={customerCommission}
                                            onChange={(e) => setCustomerCommission(Math.max(0, parseFloat(e.target.value) || 0))}
                                            required={true}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formRevenueWithVat">
                                        <Form.Label className='label_class'>Revenue (with VAT 5%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            value={Math.max(0, Math.round(revenueWithVat))} // Ensures no negative values
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formRevenueWithoutVat">
                                        <Form.Label className='label_class'>Revenue (without VAT 5%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            value={Math.max(0, Math.round(revenueWithoutVat))} // Ensures no negative values
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card>

                        {/* Third Card */}
                        {leadData.lead_type?.name === 'Others' && leadData.source?.name === 'Third Party' && (
                            <Card className='convertToLead_card mt-2'>
                                <h5 className='heading_tag'>3rd Party</h5>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <Form.Group className="mb-3" controlId="formBrokerName">
                                            <Form.Control
                                                type="text"
                                                name="brokerName"
                                                value={brokerName}
                                                onChange={(e) => setBrokerName(e.target.value)}
                                                className='convert_to_lead_input_field'
                                                placeholder="3rd Party Broker Name"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={3}>
                                        <Form.Group className="mb-3" controlId="formBrokerCommission">
                                            <Form.Control
                                                type="number"
                                                className="convert_to_lead_input_field"
                                                placeholder="3rd Party Broker Commission (%)"
                                                value={brokerCommission}
                                                onChange={handleBrokerCommissionChange}
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12} md={2}>
                                        <Form.Group className="mb-3" controlId="formHodCommission">
                                            <Form.Control
                                                type="number"
                                                className="convert_to_lead_input_field"
                                                placeholder="(%)"
                                                value={Math.max(0, Math.floor(brokerCommissionValue))}
                                                disabled
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                        {/* Second Card */}
                        <Card className='convertToLead_card mt-2' >
                            <h5 className='heading_tag' >Sales</h5>
                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicHOD">
                                        <Select
                                            className="custom-select"
                                            options={hodOptions}
                                            placeholder="Select HOD"
                                            isClearable
                                            onChange={HandlerChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formHodCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            onChange={handleHodCommissionChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formHodCommission">
                                        <Form.Control
                                            type="number"
                                            className="convert_to_lead_input_field"
                                            placeholder="(%)"
                                            value={Math.max(0, Math.floor(hodCommission))}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicManager">
                                        <Select
                                            className="custom-select"
                                            options={managerOptions}  // Set the filtered Manager options here
                                            placeholder="Select Manager"
                                            isClearable
                                            onChange={handleManagerChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formSalesManagerCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            onChange={handleSalesManagerCommissionChange}
                                        />

                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formHodCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            value={Math.max(0, Math.floor(salesManagerCommission))}
                                            disabled
                                        />

                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicManager">
                                        <Select
                                            className="custom-select"
                                            options={coordinatorOptions}  // Set the filtered Manager options here
                                            placeholder="Coordinator"
                                            isClearable
                                            onChange={handleCoordinatorChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            // value={coordinatorCommissionPercentage}
                                            onChange={handleCoordinatorCommissionChange} // Call the new handler
                                        />

                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            value={Math.max(0, Math.floor(coordinatorCommission))}
                                            disabled
                                        />

                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTeamLeader">
                                        <Select
                                            className="custom-select"
                                            options={teamLeaderOptions} // Use the teamLeaderOptions array here
                                            placeholder="Team Leader (1)"
                                            isClearable
                                            onChange={handleTeamLeaderChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formTeamLeaderCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            // value={teamLeaderCommissionPercentage}
                                            onChange={handleTeamLeaderCommissionChange} // Call the handler here
                                        />

                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            value={Math.max(0, Math.floor(teamLeaderCommission))}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTeamLeader">
                                        <Select
                                            className="custom-select"
                                            options={teamLeaderOptions} // Use the teamLeaderOptions array here
                                            placeholder="Team Leader (2)"
                                            isClearable
                                            onChange={handleTeamLeaderOneChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formTeamLeaderCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            // value={teamLeaderCommissionPercentage}
                                            onChange={handleTeamLeaderOneCommissionChange} // Call the handler here
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            value={Math.max(0, Math.floor(teamLeaderOneCommission))}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                        <Select
                                            className="custom-select"
                                            options={tsAgentOptions} // Use the tsAgentOptions array here
                                            placeholder="Sales Agent (1)"
                                            isClearable
                                            onChange={handleSaleAgentChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formAgentCommission">
                                        <Form.Control
                                            type="number"
                                            className="convert_to_lead_input_field"
                                            placeholder="(%)"
                                            // value={agentCommissionPercentage}
                                            onChange={handleAgentCommissionChange} // Handle the commission calculation
                                        />

                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            value={Math.max(0, Math.floor(agentCommission))}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                        <Select
                                            className="custom-select"
                                            options={tsAgentOptions} // Use the tsAgentOptions array here
                                            placeholder="Sales Agent (2)"
                                            isClearable
                                            onChange={handleSaleAgentOneChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formAgentCommission">
                                        <Form.Control
                                            type="number"
                                            className="convert_to_lead_input_field"
                                            placeholder="(%)"
                                            // value={agentCommissionPercentage}
                                            onChange={handleAgentOneCommissionChange} // Handle the commission calculation
                                        />

                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            value={Math.max(0, Math.floor(agentOneCommission))}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>


                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                        <Select
                                            className="custom-select"
                                            options={tsAgentOptions} // Use the tsAgentOptions array here
                                            placeholder="Sales Agent (3)"
                                            isClearable
                                            onChange={handleSaleAgentTwoChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formAgentCommission">
                                        <Form.Control
                                            type="number"
                                            className="convert_to_lead_input_field"
                                            placeholder="(%)"
                                            // value={agentCommissionPercentage}
                                            onChange={handleAgentTwoCommissionChange} // Handle the commission calculation
                                        />

                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='(%)'
                                            value={Math.max(0, Math.floor(agentTwoCommission))}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* is_transfer */}
                            <div>
                                {leadData?.is_transfer &&
                                    <>
                                        <Card className='convertToLead_card mt-2'>
                                            <h5 className='heading_tag'>Transfer Information</h5>
                                            <Row className='mt-3'>
                                                <Col xs={12} md={6}>
                                                    <Form.Group className="mb-3" controlId="formSalesManagerRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Sales Manager Ref (Transfer)'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formSalesManagerCommissionTransfer">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Sales Manager Ref Commission Transfer (%)'
                                                            onChange={handleSalesManagerRefCommissionTransferChange} // Add the handler here
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='(%)'
                                                            value={Math.max(0, Math.floor(salesManagerRefCommissionTransfer))}
                                                            disabled
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={6}>
                                                    <Form.Group className="mb-3" controlId="formAgentRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Agent Ref (Transfer)'
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formAgentCommissionTransfer">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Agent Ref Commission Transfer (%)'
                                                            onChange={handleAgentRefCommissionTransferChange} // Add the handler here
                                                        />

                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='(%)'
                                                            value={Math.max(0, Math.floor(agentRefCommission))}
                                                            disabled
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </>
                                }
                            </div>

                            {/* Lead Cards */}
                            <Card className='convertToLead_card mt-2'>
                                {leadData && leadData.lead_type && (
                                    <>
                                        <h5 className='heading_tag'>
                                            {leadData.lead_type.name === "Others" ? leadData.lead_type.name : `${leadData.lead_type.name} Team`}
                                        </h5>
                                        <Row>
                                            {leadData.lead_type?.name === 'Marketing' && (
                                                <>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Managers"
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingManagerChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingManagerCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingManagerCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Marketing Agent"
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingAgentChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingAgentCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingAgentCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    {/* 2nd */}
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Managers_one"
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingManagerOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingManagerOneCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingManagerOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Marketing Agent One"
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingAgentOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingAgentOneCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingAgentOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <h5 className='heading_tag'>Developer Team</h5>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="IT Manager"
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleITManagerChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleItManagerCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(ItManagerCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    {/* Developer */}
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Developer"
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleItDeveloperChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleItDeveloperCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(developerCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>


                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Developer One"
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleDeveloperOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleDeveloperOneCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(developerOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Developer Two"
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleDeveloperTwoChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleDeveloperTwoCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(developerTwoCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                </>
                                            )}

                                            {leadData.lead_type?.name === 'Tele Sales' && (
                                                <>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="HOD"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesHodChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHODCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleTeleSalesHodCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesHodCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Team Leader"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesTeamLeaderChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesTeamLeaderCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='Tele Sales Team Leader commission (%)'
                                                                onChange={handleTeleSalesTeamLeaderCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesTeamLeaderCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Sales Agent (1)"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesAgentChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleTeleSalesAgentCommissionChange} // Add the handler here
                                                            />
                                                            {/* <Form.Text className="text-muted">
                                                                {Math.round(teleSalesAgentCommission)}
                                                            </Form.Text> */}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesAgentCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select"
                                                                placeholder="Sales Agent (2)"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesAgentOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleTeleSalesAgentOneCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesAgentOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </>
                                            )}

                                            {leadData.lead_type?.name === 'Others' && (
                                                <>
                                                    <Col xs={12} md={6}>
                                                        <Form.Group className="mb-3" controlId="formOtherPerson">
                                                            <Form.Control
                                                                type="text"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='Other Person'
                                                                name='otherPersonName'
                                                                value={otherPersonName}
                                                                onChange={(e) => setOtherPersonName(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formOtherCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='Other Commission (%)'
                                                                onChange={handleOtherCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>

                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(otherCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </>
                                            )}
                                        </Row>
                                    </>
                                )}
                            </Card>

                            {/* Third Card */}
                            {/* {leadData.lead_type?.name === 'Others' && leadData.source?.name === 'Third Party' && (
                                <Card className='convertToLead_card mt-2'>
                                    <h5 className='heading_tag'>3rd Party</h5>
                                    <Row>
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="formBrokerName">
                                                <Form.Control
                                                    type="text"
                                                    name="brokerName"
                                                    value={brokerName}
                                                    onChange={(e) => setBrokerName(e.target.value)}
                                                    className='convert_to_lead_input_field'
                                                    placeholder="3rd Party Broker Name"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="formBrokerCommission">
                                                <Form.Control
                                                    type="number"
                                                    className='convert_to_lead_input_field'
                                                    placeholder="3rd Party Broker Commission (%)"
                                                    onChange={handleBrokerCommissionChange}

                                                />
                                                <Form.Text className="text-muted">
                                                    {Math.round(brokerCommissionValue)}
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card>
                            )} */}

                        </Card>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setLeadToContract(false)}>Close</Button>
                    <Button className='all_single_leads_button' onClick={LeadConvertHandler}>Create Contract</Button>
                </Modal.Footer>

            </Modal>

            {/* Contract Modal */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={contractModal}
                onHide={() => setContractModal(false)}
                style={{ zIndex: '-100px' }}
            >
                <Modal.Body>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        <FiAlertCircle style={{ fontSize: '100px', color: '#ffc16a' }} />
                    </div>

                    <div className='lead_information_data mt-3' >
                        <h4 style={{ fontSize: '1.875em', fontWeight: '600px', textAlign: 'center' }} >Alert</h4>
                        <p style={{ fontSize: '1.125em' }}>
                            Please check all <span style={{ color: '#ff3863' }} >Lead Information</span>  . Once a lead is converted to <span style={{ color: '#5dc9d6' }} >Service Application</span>, it can't be <span style={{ color: '#ff3863' }} >changed</span>.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setContractModal(false)}>No</Button>
                    <Button className='all_single_leads_button' onClick={openLeadContractModal}>Yes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
export default ConvertLead