import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { Dropdown, Menu } from 'antd';
import { BsThreeDotsVertical } from "react-icons/bs";

const Labels = ({ labelName, labelModal, setLabelModal, leadId, fetchSingleLead, previousLabels, pipelineId, getAllLabels }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [selectedLabelIds, setSelectedLabelIds] = useState(previousLabels?.map(label => label._id));
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingLabelId, setEditingLabelId] = useState(null);
    const [error, setError] = useState(''); // Add error state for validation

    // Update selectedLabelIds when previousLabels changes
    useEffect(() => {
        setSelectedLabelIds(previousLabels.map(label => label._id));
    }, [previousLabels]);

    // Handle checkbox changes
    const handleCheckboxChange = (labelId) => {
        setSelectedLabelIds((prevSelected) => {
            if (prevSelected.includes(labelId)) {
                return prevSelected.filter(id => id !== labelId);
            } else {
                return [...prevSelected, labelId];
            }
        });
    };

    // Submit selected labels
    const submitLabels = async () => {
        try {
            const payload = { labels: selectedLabelIds };
            await axios.put(`/api/leads/edit-labels/${leadId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabelModal(false);
            fetchSingleLead();
            // Reset fields after creation
            setNewLabelName('');
            setSelectedColor(null);
            setSelectedLabelIds(previousLabels.map(label => label._id));
        } catch (error) {
            console.error('Error adding labels:', error);
        }
    };

    // Create new label
    const createLabel = async () => {
        if (!newLabelName) {
            setError('Name is required'); // Set error if name is empty
            return;
        }
        setError(''); // Clear error if name is valid
        try {
            const payload = {
                name: newLabelName,
                color: selectedColor ? selectedColor.value : 'primary',
                pipeline_id: pipelineId,
            };
            const response = await axios.post(`/api/labels/create`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            labelName.push(response.data); // Add new label to the list

            // Reset fields after creation
            setNewLabelName('');
            setSelectedColor(null);
            getAllLabels()
        } catch (error) {
            console.error('Error creating label:', error);
        }
    };

    // Update existing label
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

            // Reset fields and exit edit mode after updating
            setNewLabelName('');
            setSelectedColor(null);
            setIsEditMode(false);
            setEditingLabelId(null);
            getAllLabels()
        } catch (error) {
            console.error('Error updating label:', error);
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

    // Handle label click for editing
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
        <div>
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={labelModal}
                onHide={() => {
                    setLabelModal(false);
                    setIsEditMode(false); // Reset edit mode on close
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Labels
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '100%', maxHeight: '600px', overflowY: 'scroll' }}>
                    <Row>
                        <Col md={5}>
                            <Form.Control
                                type="text"
                                placeholder="Create or Edit Label"
                                value={newLabelName}
                                onChange={(e) => {
                                    setNewLabelName(e.target.value);
                                    if (e.target.value) setError(''); // Clear error on typing
                                }}
                                className="mr-2"
                            />
                            {error && <small style={{ color: 'red' }}>{error}</small>} {/* Display error message */}
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
                    {labelName.map((label, index) => {
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
                                backgroundColor = '#ccc';
                        }
                        return (
                            <div key={index} style={{ marginRight: '4px', marginTop: '8px' }}>
                                <div
                                    className='labels_class'
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
                                        inline
                                        id={`${label._id}`}
                                        type="checkbox"
                                        label={label.name}
                                        onChange={() => handleCheckboxChange(label._id)}
                                        checked={selectedLabelIds.includes(label._id)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </Modal.Body>
                <Modal.Footer>
                    {/* {isEditMode ? (
                    ) : (
                    )} */}
                    {/* <Button variant="success" onClick={createLabel}>Create Label</Button>
                    <Button variant="warning" onClick={updateLabel}>Update Label</Button> */}
                    <Button variant="primary" onClick={submitLabels}>Add Labels</Button>
                    <Button variant="secondary" onClick={() => {
                        setLabelModal(false);
                        setNewLabelName('');
                        setSelectedColor(null);
                        setIsEditMode(false); // Exit edit mode on close
                    }}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Labels;