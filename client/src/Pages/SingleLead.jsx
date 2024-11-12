import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Card, Button, Image, Modal, Form, Alert } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { MdOutlinePhone, MdOutlineEmail } from "react-icons/md";
import { SiEmirates } from "react-icons/si";
import LeadUsers from '../Components/LeadUsers';
import LeadDiscussion from '../Components/LeadDiscussion';
import ActivityLead from '../Components/ActivityLead';
import FileUploader from '../Components/FileUploader';
import EditLead from '../Components/editlead/EditLead';
import TransferLeads from '../Components/transferLeads/TransferLeads';
import MoveLeads from '../Components/moveLead/MoveLeads';
import ConvertLead from '../Components/convertLead/ConvertLead';
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import { FaCodeBranch } from "react-icons/fa6";
import { SiGoogleadsense } from "react-icons/si";
import { TbSocial } from "react-icons/tb";
import { TbWorldWww } from "react-icons/tb";
import { TiDeleteOutline } from "react-icons/ti";
import { FiAlertCircle } from "react-icons/fi";
import Labels from '../Components/Labels';
import rejected_image from '../Assets/rejected_image.png'
import './style.css';
import TransferMessage from '../Components/transferMessage/TransferMessage';
import PhoneBookComments from './phoneBook/PhoneBookComments';

const SingleLead = () => {
    // User Token
    const token = useSelector(state => state.loginSlice.user?.token)
    const { id } = useParams();
    const [singleLead, setSingleLead] = useState([])
    const [modalShow, setModalShow] = useState(false); // Modal state
    const [transferModal, setTransferModal] = useState(false);
    const [moveLeadModal, setMoveLeadModal] = useState(false)
    const [leadtocontract, setLeadToContract] = useState(false)
    const [rejectedLeadModal, setRejectedLeadModal] = useState(false)
    const [contractModal, setContractModal] = useState(false)
    const [productStages, setProductStages] = useState([]);
    const [eidModal, setEidModal] = useState(false)
    const [labels, setLables] = useState([])
    const [labelModal, setLabelModal] = useState(false)
    const [pipelineId, setPipeLineId] = useState(null);
    const [labelName, setLabelsName] = useState([]);
    const [previousLabels, setPreviousLabels] = useState([]);
    const [rejectLead, setRejectLead] = useState('')
    const [rejectReasonErrorMessage, setRejectReasonErrorMessage] = useState('')
    const permissions = useSelector(state => state.loginSlice.user?.permissions)
    const [phoneBookModal, setPhoneBookModal] = useState(false)

    const canEditLead = permissions?.includes('edit_lead');
    const canMoveLead = permissions?.includes('move_lead');
    const canTransferLead = permissions?.includes('transfer_lead');
    const canRejectLead = permissions?.includes('reject_lead');
    const canAddUserLead = permissions?.includes('add_user_lead');
    const canContractLead = permissions?.includes('convert_lead');
    const canLabelLead = permissions?.includes('lead_labels');

    const fetchSingleLead = async () => {
        try {
            const response = await axios.get(`/api/leads/single-lead/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSingleLead(response.data);
            setLables(response.data.labels)
            fetchProductStages(response.data.products?._id);  // Fetch product stages once single lead is fetched
            setPipeLineId(response.data.pipeline_id._id)
            setPreviousLabels(response.data.labels);
        } catch (error) {
            console.error('Error fetching single lead:', error);
        }
    };

    // Fetch all labels based on the pipelineId
    const getAllLabels = async () => {
        try {
            const response = await axios.get(`/api/labels/pipeline/${pipelineId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabelsName(response.data); // Set labels to state
        } catch (err) {
            console.error(err); // Log error for debugging
        }
    };


    const fetchProductStages = async (productId) => {
        if (!productId) return;

        try {
            const response = await axios.get(`/api/productstages/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProductStages(response.data);
        } catch (error) {
            console.error('Error fetching product stages:', error);
        }
    };

    useEffect(() => {
        if (pipelineId) {
            getAllLabels()
        }
    }, [pipelineId])

    useEffect(() => {
        fetchSingleLead();
    }, [token]);

    // Reject Lead API
    const RejectedLead = async () => {
        try {
            await axios.put(`/api/leads/reject-lead/${id}`,
                {
                    reject_reason: rejectLead
                }
                , {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            setRejectedLeadModal(false)
            setRejectReasonErrorMessage('')

        } catch (error) {
            setRejectReasonErrorMessage(error.response.data.message)
            console.log(error.response.data.message, 'errorMeaage')

            setTimeout(() => {
                setRejectReasonErrorMessage(false);
            }, 3000)
        }
    }


    const openRejectedLead = () => {
        setRejectedLeadModal(true)
    }

    const openLeadConvertModal = () => {
        if (!singleLead.client?.e_id || '') {
            setEidModal(true)
        } else {

            setContractModal(true);
        }
    };
    const openLeadContractModal = () => {
        setLeadToContract(true)
        setContractModal(false)
    }

    const editEmiratesIDModal = () => {
        setModalShow(true)
        setEidModal(false)
    }

    const openPhoneBookModal = () => {
        setPhoneBookModal(true)
    }


    return (
        <div>
            {/* <Navbar /> */}
            <Container fluid>
                <Row >
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <div className='' style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
                            {
                                singleLead.is_reject &&
                                    (canLabelLead || canEditLead || canMoveLead || canTransferLead || canRejectLead || canContractLead)
                                    ? null
                                    : (
                                        <>
                                            {canLabelLead && (
                                                <Button className="mt-3 all_single_leads_button" onClick={() => setLabelModal(true)}>
                                                    Labels
                                                </Button>
                                            )}
                                            {canEditLead && (
                                                <Button className="mt-3 all_single_leads_button" onClick={() => setModalShow(true)}>
                                                    Edit
                                                </Button>
                                            )}
                                            {canMoveLead && (
                                                <Button className="mt-3 all_single_leads_button" onClick={() => setMoveLeadModal(true)}>
                                                    Move
                                                </Button>
                                            )}
                                            {canTransferLead && (
                                                <Button className="mt-3 all_single_leads_button" onClick={() => setTransferModal(true)}>
                                                    Transfer
                                                </Button>
                                            )}
                                            {canRejectLead && (
                                                <Button className="mt-3 all_single_leads_button" onClick={() => openRejectedLead()}>
                                                    Rejected
                                                </Button>
                                            )}
                                            {canContractLead && (
                                                <Button className="mt-3 all_single_leads_button" onClick={() => openLeadConvertModal()}>
                                                    Contract
                                                </Button>
                                            )}

                                            <Button className="mt-3 all_single_leads_button" onClick={() => openPhoneBookModal()}>
                                                PhoneBook Comments
                                            </Button>
                                        </>
                                    )
                            }
                        </div>
                        <Card className='leads_main_cards' style={{ height: '92%' }}>


                            <Row className='' >
                                <Col xs={12} md={12} lg={9} className='single_lead_col'>
                                    <LeadUsers singleLead={singleLead} fetchSingleLead={fetchSingleLead} labels={labels} />
                                </Col>

                                <Col xs={12} md={12} lg={3}>
                                    <LeadDiscussion singleLead={singleLead} id={id} fetchSingleLead={fetchSingleLead} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container >

            <Modal
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={rejectedLeadModal}
                onHide={() => setRejectedLeadModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Reject Lead
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p  >
                        <span style={{ color: 'red', fontWeight: '600' }} > Are You Sure?</span>  <br /> <span style={{ color: '#3ec9d6' }} >You Want to Reject this Lead</span>
                    </p>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Control as="textarea" rows={3} placeholder='Reason For Rejection' name='reject_reason' value={rejectLead} onChange={(e) => setRejectLead(e.target.value)} />
                    </Form.Group>
                    {rejectReasonErrorMessage && rejectReasonErrorMessage && <Alert variant="danger">{rejectReasonErrorMessage}</Alert>}
                </Modal.Body>

                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setRejectedLeadModal(false)}>Close</Button>
                    <Button className='all_single_leads_button' onClick={RejectedLead} >Reject Lead</Button>
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


            <Modal show={eidModal} onHide={() => setEidModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Need Emirates ID</Modal.Title>
                </Modal.Header>
                <Modal.Body>Please provide client Emirates ID to convert lead to contract.</Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setEidModal(false)}>
                        Close
                    </Button>
                    <Button className='all_single_leads_button' onClick={() => editEmiratesIDModal()}>
                        Edit
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* EditLead Modal */}
            <EditLead
                modalShow={modalShow}
                setModalShow={setModalShow}
                leadId={id}
                fetchLeadsData={() => setSingleLead(singleLead)}
                fetchSingleLead={fetchSingleLead}
            />

            <TransferLeads
                leadId={id}
                transferModal={transferModal}
                setTransferModal={setTransferModal}
                fetchLeadsData={() => setSingleLead(singleLead)}
                fetchSingleLead={fetchSingleLead}
            />

            <MoveLeads
                leadId={id}
                fetchLeadsData={() => setSingleLead(singleLead)}
                moveLeadModal={moveLeadModal}
                setMoveLeadModal={setMoveLeadModal}
                fetchSingleLead={fetchSingleLead}
            />

            <ConvertLead
                leadId={id}
                fetchLeadsData={() => setSingleLead(singleLead)}
                leadtocontract={leadtocontract}
                setLeadToContract={setLeadToContract}
                fetchSingleLead={fetchSingleLead}
            />

            <Labels getAllLabels={getAllLabels} pipelineId={pipelineId} labelModal={labelModal} setLabelModal={setLabelModal} labelName={labelName} leadId={id} fetchSingleLead={fetchSingleLead} previousLabels={previousLabels} />
            <PhoneBookComments singleLead={singleLead} fetchSingleLead={fetchSingleLead} leadId={id} fetchLeadsData={() => setSingleLead(singleLead)} phoneBookModal={phoneBookModal} setPhoneBookModal={setPhoneBookModal} />
        </div >
    )
}
export default SingleLead