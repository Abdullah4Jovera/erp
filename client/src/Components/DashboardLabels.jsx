import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { BsThreeDotsVertical } from "react-icons/bs";
import { Dropdown, Menu } from 'antd';

const DashboardLabels = ({ fetchLeadsData, leadId, setLabelsDashBoardModal, labelsDashboardModal }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [singleLead, setSingleLead] = useState(null);
    const [pipelineId, setPipelineID] = useState(null);
    const [previousLabels, setPreviousLabels] = useState([]);
    const [allLabels, setAllLabels] = useState([]);
    const [selectedLabelIds, setSelectedLabelIds] = useState([]);
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [editingLabelId, setEditingLabelId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState('');

    const fetchSingleLead = async () => {
        try {
            const response = await axios.get(`/api/leads/single-lead/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const leadData = response.data;
            setSingleLead(leadData);
            setPreviousLabels(leadData.labels);
            setSelectedLabelIds(leadData.labels.map(label => label._id));
            setPipelineID(leadData.pipeline_id._id);
        } catch (error) {
            console.error('Error fetching single lead:', error);
        }
    };

    const fetchPipelineLabels = async (pipelineId) => {
        try {
            const response = await axios.get(`/api/labels/pipeline/${pipelineId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllLabels(response.data);
        } catch (error) {
            console.error('Error fetching labels:', error);
        }
    };

    useEffect(() => {
        fetchSingleLead();
    }, [leadId]);

    useEffect(() => {
        if (pipelineId) {
            fetchPipelineLabels(pipelineId);
        }
    }, [pipelineId]);

    const handleCheckboxChange = (labelId) => {
        setSelectedLabelIds((prevSelected) => {
            if (prevSelected.includes(labelId)) {
                return prevSelected.filter(id => id !== labelId);
            } else {
                return [...prevSelected, labelId];
            }
        });
    };

    const getBranchID = localStorage.getItem('selectedBranchId');
    const getProductID = localStorage.getItem('selectedProductId');

    const submitDashBoardLabels = async () => {
        try {
            const payload = { labels: selectedLabelIds };
            await axios.put(`/api/leads/edit-labels/${leadId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabelsDashBoardModal(false);
            setSelectedColor(null)
            fetchLeadsData(getProductID, getBranchID);
        } catch (error) {
            console.error('Error updating labels:', error);
        }
    };

    const createLabel = async () => {
        if (!newLabelName) {
            setError('Name is required');
            return;
        }
        setError('');
        try {
            const payload = {
                name: newLabelName,
                color: selectedColor ? selectedColor.value : 'primary',
                pipeline_id: pipelineId,
            };
            const response = await axios.post(`/api/labels/create`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            allLabels.push(response.data);
            setNewLabelName('');
            setSelectedColor(null);
            fetchPipelineLabels(pipelineId);
        } catch (error) {
            console.error('Error creating label:', error);
        }
    };

    const colorOptions = [
        { value: 'secondary', label: 'Secondary', color: '#6c757d' },
        { value: 'warning', label: 'Warning', color: '#ffc107' },
        { value: 'primary', label: 'Primary', color: '#007bff' },
        { value: 'danger', label: 'Danger', color: '#dc3545' },
    ];

    const customStyles = {
        option: (styles, { data, isFocused }) => ({
            ...styles,
            backgroundColor: isFocused ? data.color : 'white',
            color: isFocused ? 'white' : data.color,
        }),
        singleValue: (styles, { data }) => ({
            ...styles,
            color: data.color,
        }),
    };

    const updateLabel = async () => {
        try {
            const payload = {
                name: newLabelName,
                color: selectedColor ? selectedColor.value : 'primary',
                pipeline_id: pipelineId,
            };
            await axios.put(`/api/labels/${editingLabelId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSingleLead();
            setNewLabelName('');
            setSelectedColor(null);
            setIsEditMode(false);
            setEditingLabelId(null);
            fetchPipelineLabels(pipelineId);
        } catch (error) {
            console.error('Error updating label:', error);
        }
    };

    const handleLabelClick = (label) => {
        setNewLabelName(label.name);
        setSelectedColor(colorOptions.find(option => option.value === label.color));
        setIsEditMode(true);
        setEditingLabelId(label._id);
    };

    const renderMenu = () => (
        <Menu style={{ padding: '10px 20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <Button variant="success" onClick={createLabel}>Create Label</Button>
            <Button variant="warning" onClick={updateLabel}>Update Label</Button>
        </Menu>
    );

    return (
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={labelsDashboardModal}
            onHide={() => {
                setLabelsDashBoardModal(false);
                setIsEditMode(false);
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Labels</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height: '100%', maxHeight: '600px', overflowY: 'scroll' }}>
                <Row>
                    <Col md={5}>
                        <Form.Control
                            type="text"
                            placeholder="Create or Edit Label"
                            onChange={(e) => {
                                setNewLabelName(e.target.value);
                                if (e.target.value) setError('');
                            }}
                            className="mr-2"
                        />
                        {error && <small style={{ color: 'red' }}>{error}</small>}
                    </Col>
                    <Col md={6}>
                        <Select
                            placeholder="Select Label Color"
                            options={colorOptions}
                            styles={customStyles}
                            onChange={setSelectedColor}
                            value={selectedColor}
                        />
                    </Col>

                    <Col md={1}>
                        <Dropdown
                            overlay={renderMenu()}
                            trigger={['click']}
                            getPopupContainer={(trigger) => trigger.parentNode}
                        >
                            <BsThreeDotsVertical style={{ cursor: 'pointer', fontSize: '20px', zIndex: 1000 }} />
                        </Dropdown>
                    </Col>
                </Row>
                {allLabels.length === 0 ? (
                    <p>No labels found for this pipeline.</p>
                ) : (
                    allLabels.map((label, index) => {
                        let backgroundColor = '';

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
                                backgroundColor = '#ccc';
                        }
                        return (
                            <div key={index} style={{ marginRight: '4px', marginTop: '8px' }}>
                                <div key={label._id} className='labels_class'
                                    style={{
                                        backgroundColor: backgroundColor,
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        width: 'auto',
                                        maxWidth: '150px'
                                    }}
                                    onClick={() => handleLabelClick(label)}
                                >
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectedLabelIds.includes(label._id)}
                                        onChange={() => handleCheckboxChange(label._id)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                                        {label.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={submitDashBoardLabels}>Add Labels</Button>
                <Button onClick={() => setLabelsDashBoardModal(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DashboardLabels;