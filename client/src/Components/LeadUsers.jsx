import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button, Form, Container, Row, Col, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../Pages/style.css';
import { RiDeleteBinLine } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import default_image from '../Assets/default_image.jpg';
import { TiDeleteOutline } from "react-icons/ti";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import { FaCodeBranch } from "react-icons/fa6";
import { SiGoogleadsense } from "react-icons/si";
import { TbSocial } from "react-icons/tb";
import { TbWorldWww } from "react-icons/tb";
import { MdOutlinePhone, MdOutlineEmail } from "react-icons/md";
import { SiEmirates } from "react-icons/si";
import FileUploader from './FileUploader';
import ActivityLead from './ActivityLead';
import rejected_image from '../Assets/rejected_image.png'
import blovkimage from '../Assets/blovkimage.png'
import ReactCardFlip from 'react-card-flip';

const LeadUsers = ({ singleLead, fetchSingleLead, labels }) => {
    const { selected_users = [], pipeline_id } = singleLead;
    const [isFlipped, setIsFlipped] = useState(false);
    const { id } = useParams();
    const [userModal, setUserModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // Changed to an array for multiple users
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [error, setError] = useState('');
    const permissions = useSelector(state => state.loginSlice.user?.permissions)
    const canAddUserLead = permissions?.includes('add_user_lead');
    const canRemoveUserLead = permissions?.includes('remove_user_lead');

    const token = useSelector(state => state.loginSlice.user?.token);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);


    useEffect(() => {
        setIsFlipped(singleLead.is_reject);
    }, [singleLead.is_reject]);

    const handleCardClick = () => {
        if (singleLead.is_reject) {
            setIsFlipped(!isFlipped);
        }
    };;

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

    useEffect(() => {
        if (allUsers.length > 0 && pipeline_id) {
            const usersForPipeline = allUsers?.filter(user =>
                user?.pipeline && user.pipeline.length > 0 && user.pipeline[0]?._id === pipeline_id?._id
            );
            const filtered = usersForPipeline.filter(user =>
                !selected_users.some(selectedUser => selectedUser._id === user._id)
            );
            setFilteredUsers(filtered);
        }
    }, [allUsers, pipeline_id, selected_users]);

    // Add User
    const AddUser = async () => {
        setError('');
        if (selectedUsers.length === 0) {
            setError('Please select at least one user before submitting.');
            return;
        }

        try {
            // Loop through selected users and add them
            for (const user of selectedUsers) {
                await axios.put(`/api/leads/add-user-to-lead/${id}`, {
                    userId: user.value
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            setSelectedUsers([]); // Clear selection after adding users
            fetchSingleLead();
            setUserModal(false);
        } catch (error) {
            console.log(error, 'error');
        }
    };

    // Delete User
    const DeleteUser = async () => {
        try {
            await axios.put(`/api/leads/remove-user-from-lead/${id}`, {
                userId: userIdToDelete
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDeleteModal(false);
            fetchSingleLead();
        } catch (error) {
            console.log(error, 'err');
        }
    };

    // Prepare options for the select dropdown
    const userOptions = filteredUsers.map(user => ({
        value: user._id,
        label: user.name
    }));

    // Function to split description into chunks of 15 words
    const splitDescriptionIntoChunks = (description) => {
        if (!description) return [];
        const words = description.split(' ');
        const chunks = [];
        for (let i = 0; i < words.length; i += 15) {
            chunks.push(words.slice(i, i + 15).join(' '));
        }
        return chunks;
    };

    const descriptionChunks = splitDescriptionIntoChunks(singleLead.description);

    return (
        <>
            <Container>
                <Row>

                    <Col xs={12} md={4}>
                        <Card body className='lead_discussion_main_card_user mutual_background_class' >
                            {/* <h5 style={{ color: '#B9406B', textAlign: 'center' }} > Client Details </h5> */}
                            <h5 style={{ textAlign: 'center' }} className='mutual_class_color' > {singleLead.client?.name && singleLead.client?.name} </h5>
                            <div className='first_card' >
                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons' >
                                        <MdOutlinePhone style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' >Phone</p>
                                        <p className='mb-0 mutual_class_color' style={{}}>{singleLead.client?.phone && singleLead.client?.phone}</p>
                                        {singleLead.is_blocklist_number && (
                                            <div>
                                                <Image
                                                    src={blovkimage}
                                                    className="rejected_image"
                                                    alt="Blocked Image"
                                                    style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons_one' >
                                        <MdOutlineEmail style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' >Email</p>
                                        <div style={{ width: '100%', maxWidth: '180px' }} >
                                            {/* <h5 className='mb-0' style={{ color: '#ffa21d', fontSize: '14px' }} > {singleLead.client?.email && singleLead.client?.email} </h5> */}
                                            <p className='mb-0 mutual_class_color' style={{}}>{singleLead.client?.email && singleLead.client?.email}</p>
                                        </div>

                                    </div>
                                </div>

                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons_two' >
                                        <SiEmirates style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' >Emirates ID</p>
                                        {/* <h5 className='mb-0' style={{ color: '#3ec9d6', fontSize: '14px' }}> {singleLead.client?.e_id && singleLead.client?.e_id} </h5> */}
                                        <p className='mb-0 mutual_class_color' style={{}}>{singleLead.client?.e_id && singleLead.client?.e_id}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {singleLead.is_reject ? (
                            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                                {/* Front Card - Users List */}
                                <Card
                                    className='mt-2 lead_discussion_main_card_user'
                                    style={{ padding: '20px', height: '100%', maxHeight: '300px', overflowY: 'scroll' }}
                                    onClick={handleCardClick}
                                >
                                    <div className='discussion_files'>
                                        <h5 className='mutual_class_color' >Users</h5>
                                        {!singleLead.is_reject && canAddUserLead ? (
                                            <div className='lead_users_delete_btn mb-3'>
                                                <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => setUserModal(true)} />
                                            </div>
                                        ) : null}
                                    </div>
                                    <Table bordered responsive striped hover className="lead_user_class">
                                        {/* <thead>
                                            <tr>
                                                <th style={{ width: '70%' }}>Name</th>
                                                {singleLead.is_reject || !canRemoveUserLead ? null : (
                                                    <th className="text-center" style={{ width: '30%' }}>Action</th>
                                                )}
                                            </tr>
                                        </thead> */}
                                        <tbody>
                                            {selected_users.length > 0 ? (
                                                selected_users
                                                    .filter(
                                                        user =>
                                                            !["ceo", "md", "super admin", "company", "hod"].includes(user?.role?.trim().toLowerCase())
                                                    )
                                                    .map((user) => {
                                                        const imageSrc = user?.image
                                                            ? `/images/${user?.image}`
                                                            : default_image;

                                                        const renderTooltip = (props) => (
                                                            <Tooltip id="user-tooltip" {...props}>
                                                                {user.name}
                                                            </Tooltip>
                                                        );

                                                        return (
                                                            <tr key={user._id} style={{ height: '40px' }}>
                                                                <td style={{ verticalAlign: 'middle' }}>
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            delay={{ show: 250, hide: 400 }}
                                                                            overlay={renderTooltip}
                                                                        >
                                                                            <Image
                                                                                src={imageSrc}
                                                                                alt="User"
                                                                                className="image_control_discussion"
                                                                                style={{ objectFit: 'cover', cursor: 'pointer' }}
                                                                            />
                                                                        </OverlayTrigger>
                                                                        <span style={{ fontWeight: '600', fontSize: '12px' }}>{user.name}</span>
                                                                    </div>
                                                                </td>
                                                                {!singleLead.is_reject && canRemoveUserLead && (
                                                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                                        <div className="lead_users_delete_btn">
                                                                            <RiDeleteBinLine
                                                                                style={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}
                                                                                onClick={() => {
                                                                                    setUserIdToDelete(user._id);
                                                                                    setDeleteModal(true);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center">
                                                        No users available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card>

                                {/* Back Card - Reason for Rejection */}
                                <Card
                                    body
                                    className='mb-2 mt-2 rejected_lead_reason'
                                    style={{ position: 'relative', backgroundColor: '#efefef' }}
                                    onClick={handleCardClick}
                                >
                                    <div>
                                        <h4 style={{ color: '#B9406B', textAlign: 'center' }} className='mb-0'>Reason of Rejection Lead</h4>
                                        <p className='mt-2' >{singleLead && singleLead.reject_reason}</p>
                                    </div>
                                    <Image
                                        src={rejected_image}
                                        className='rejected_image'
                                        alt='Rejected Image'
                                        style={{ width: '90px', height: '90px', borderRadius: '50%' }}
                                    />
                                </Card>
                            </ReactCardFlip>
                        ) : (
                            /* Display only the front card if singleLead.is_reject is false */
                            <Card
                                className='mt-2 lead_discussion_main_card_user mutual_background_class'
                                style={{ padding: '20px', height: '100%', maxHeight: '250px' }}
                                onClick={() => setIsFlipped(!isFlipped)}

                            >
                                <div className='discussion_files'>
                                    <h5 className='mutual_class_color'>Users</h5>
                                    {singleLead.is_reject || !canAddUserLead ? null : (
                                        <div className='lead_users_delete_btn mb-3'>
                                            <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => setUserModal(true)} />
                                        </div>
                                    )}
                                </div>
                                <Table bordered responsive striped hover className="lead_user_class">
                                    {/* <thead>
                                        <tr>
                                            <th style={{ width: '70%' }}>Name</th>
                                            {singleLead.is_reject || !canRemoveUserLead ? null : (
                                                <th className="text-center" style={{ width: '30%' }}>Action</th>
                                            )}
                                        </tr>
                                    </thead> */}
                                    <tbody>
                                        {selected_users.length > 0 ? (
                                            selected_users
                                                .filter(
                                                    user =>
                                                        !["ceo", "md", "super admin", "company", "hod"].includes(user?.role?.trim().toLowerCase())
                                                )
                                                .map((user) => {
                                                    const imageSrc = user?.image
                                                        ? `/images/${user?.image}`
                                                        : default_image;

                                                    const renderTooltip = (props) => (
                                                        <Tooltip id="user-tooltip" {...props}>
                                                            {user.name}
                                                        </Tooltip>
                                                    );

                                                    return (
                                                        <tr key={user._id} style={{ height: '40px' }}>
                                                            <td style={{ verticalAlign: 'middle' }}>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <OverlayTrigger
                                                                        placement="top"
                                                                        delay={{ show: 250, hide: 400 }}
                                                                        overlay={renderTooltip}
                                                                    >
                                                                        <Image
                                                                            src={imageSrc}
                                                                            alt="User"
                                                                            className="image_control_discussion"
                                                                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                                                                        />
                                                                    </OverlayTrigger>
                                                                    <span style={{ fontWeight: '600', fontSize: '12px' }}>{user.name}</span>
                                                                </div>
                                                            </td>
                                                            {!singleLead.is_reject && canRemoveUserLead && (
                                                                <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                                    <div className="lead_users_delete_btn">
                                                                        <RiDeleteBinLine
                                                                            style={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}
                                                                            onClick={() => {
                                                                                setUserIdToDelete(user._id);
                                                                                setDeleteModal(true);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="text-center">
                                                    No users available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card>
                        )}

                        <FileUploader singleLead={singleLead} id={id} fetchSingleLead={fetchSingleLead} />

                    </Col>

                    <Col xs={12} md={8}>
                        <Card className='lead_discussion_main_card_description mutual_background_class' style={{ padding: '15px 20px 20px 20px', backgroundColor: 'white' }}>
                            {
                                labels?.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {labels.map((label, index) => {
                                            let backgroundColor = '';

                                            // Set the background color based on the label color
                                            switch (label.color) {
                                                case 'success':
                                                    backgroundColor = '#6fd943';
                                                    break;
                                                case 'danger':
                                                    backgroundColor = '#ff3a6e';
                                                    break;
                                                case 'primary':
                                                    backgroundColor = '#5c91dc';
                                                    break;
                                                case 'warning':
                                                    backgroundColor = '#ffa21d';
                                                    break;
                                                case 'info':
                                                    backgroundColor = '#6ac4f4';
                                                    break;
                                                case 'secondary':
                                                    backgroundColor = '#6c757d';
                                                    break;
                                                default:
                                                    backgroundColor = '#ccc'; // Default color if no match
                                            }

                                            return (
                                                <div key={index} style={{ marginRight: '4px', marginTop: '-16px', marginBottom: '20px' }}>
                                                    <div
                                                        className='labels_class'
                                                        style={{
                                                            backgroundColor: backgroundColor,
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '4px 8px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <p style={{ color: '#fff', margin: 0 }}>{label.name}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    </div>
                                )
                            }

                            {
                                singleLead?.company_Name ? (
                                    <>
                                        <h4 className='mb-0 mutual_class_color' style={{ textAlign: 'center' }}>
                                            {singleLead?.company_Name || 'No Company Name'}
                                        </h4>
                                        <p className='text-muted text-sm mb-0 text-center mutual_heading_class'>Company Name</p>

                                    </>
                                )
                                    :
                                    <p className='text-sm mb-0 text-center mutual_class_color mutual_heading_class'>No Company Name</p>
                            }
                            <div>
                                <h5 className="mutual_class_color">Lead Details</h5>
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', borderRadius: '5px' }}>
                                {singleLead?.description ? (
                                    singleLead.description.split('\n').map((line, index) => (
                                        <p
                                            className={`mb-1 ${index % 2 === 0 ? 'mutual_class_color' : 'mutual_heading_class'}`}
                                            key={index}
                                        >
                                            {line}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-muted text-sm mb-0">No description available</p>
                                )}
                            </div>
                        </Card>

                        <Card body className='mt-2 lead_discussion_main_card_user mutual_background_class' >
                            <h5 style={{ textAlign: 'center' }} className='mutual_class_color'> {singleLead.products?.name && singleLead.products?.name} </h5>
                            <div className='first_card_product' >

                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons' >
                                        <HiMiniBuildingOffice2 style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' style={{ fontSize: '14px', fontWeight: '600' }} >Branch</p>
                                        <p className='mb-0 mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>{singleLead.branch?.name && singleLead.branch?.name}</p>
                                    </div>
                                </div>

                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons' >
                                        <FaCodeBranch style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' style={{ fontSize: '14px', fontWeight: '600' }}>Pipeline</p>
                                        <p className='mb-0 mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>{singleLead.pipeline_id?.name && singleLead.pipeline_id?.name}</p>
                                    </div>
                                </div>

                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons_two' >
                                        <SiGoogleadsense style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' style={{ fontSize: '14px', fontWeight: '600' }}>Lead Stage</p>
                                        <p className='mb-0 mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>{singleLead.product_stage?.name && singleLead.product_stage?.name}</p>
                                    </div>
                                </div>

                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons_two' >
                                        <TbSocial style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' style={{ fontSize: '14px', fontWeight: '600' }}>Lead From</p>
                                        <p className='mb-0 mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>{singleLead.lead_type?.name && singleLead.lead_type?.name}</p>
                                    </div>
                                </div>

                                <div className='single_lead_upper_container' >
                                    <div className='single_lead_icons_one' >
                                        <TbWorldWww style={{ fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <p className='text-muted text-sm mb-0 mutual_heading_class' style={{ fontSize: '14px', fontWeight: '600' }}>Source</p>
                                        <p className='mb-0 mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>{singleLead.source?.name && singleLead.source?.name}</p>
                                    </div>
                                </div>


                            </div>
                        </Card>

                        {/* <FileUploader singleLead={singleLead} id={id} fetchSingleLead={fetchSingleLead} /> */}
                        <ActivityLead singleLead={singleLead} />
                    </Col>

                </Row>
            </Container>

            {/* Add user Modal */}
            <Modal
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={userModal}
                onHide={() => setUserModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Users</Form.Label>
                            <Select
                                options={userOptions}
                                value={selectedUsers}
                                onChange={(options) => {
                                    setSelectedUsers(options);
                                    setError('');
                                }}
                                isMulti // Enable multi-select
                                placeholder="Select users..."
                            />
                            {error && <div className="text-danger">{error}</div>}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setUserModal(false)} className='all_close_btn_container'>Close</Button>
                    <Button className='all_single_leads_button' onClick={AddUser}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={deleteModal}
                onHide={() => setDeleteModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Delete User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p>Are you sure you want to delete this user?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setDeleteModal(false)} className='all_close_btn_container'>Close</Button>
                    <Button className='all_single_leads_button' onClick={DeleteUser}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LeadUsers;
