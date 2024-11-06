import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const Labels = ({ labelName, labelModal, setLabelModal, leadId, fetchSingleLead, previousLabels }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [selectedLabelIds, setSelectedLabelIds] = useState(previousLabels?.map(label => label._id));
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#fff');
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setSelectedLabelIds(previousLabels.map(label => label._id));
    }, [previousLabels]);

    const handleCheckboxChange = (labelId) => {
        setSelectedLabelIds((prevSelected) => {
            if (prevSelected.includes(labelId)) {
                return prevSelected.filter(id => id !== labelId);
            } else {
                return [...prevSelected, labelId];
            }
        });
    };

    // Mapping color to custom background color
    const getBackgroundColor = (color) => {
        let backgroundColor = '';
        switch (color) {
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
        return backgroundColor;
    };

    const submitLabels = async () => {
        try {
            const payload = { labels: selectedLabelIds };
            await axios.put(`/api/leads/edit-labels/${leadId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabelModal(false);
            fetchSingleLead();
            setNewLabelName('');
            setSelectedColor('#fff');
            setSelectedLabelIds(previousLabels.map(label => label._id));
        } catch (error) {
            console.error('Error adding labels:', error);
        }
    };

    const handleLabelClick = (label) => {
        setNewLabelName(label.name);
        setSelectedColor(getBackgroundColor(label.color)); // Apply color background
        setIsEditMode(true);
        // setEditingLabelId(label._id);
    };

    return (
        <div>
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={labelModal}
                onHide={() => {
                    setLabelModal(false);
                    setIsEditMode(false);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">Labels</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '100%', maxHeight: '600px', overflowY: 'scroll' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-4px' }}>
                        {labelName.map((label, index) => (
                            <div key={index} style={{ flex: '0 0 calc(25% - 8px)', margin: '4px' }}>
                                <div
                                    className='labels_class'
                                    style={{
                                        backgroundColor: getBackgroundColor(label.color), // Set dynamic color
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        justifyContent: 'space-between',
                                    }}
                                    onClick={() => handleLabelClick(label)}
                                >
                                    <Form.Check
                                        inline
                                        id={`${label._id}`}
                                        type="checkbox"
                                        label={
                                            <span
                                                style={{
                                                    backgroundColor: getBackgroundColor(label.color), // Set background color on the label name
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    color: '#fff', // Ensure the text is readable
                                                }}
                                            >
                                                {label.name}
                                            </span>
                                        }
                                        onChange={() => handleCheckboxChange(label._id)}
                                        checked={selectedLabelIds.includes(label._id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_single_leads_button' onClick={submitLabels}>
                        Add Labels
                    </Button>
                    <Button
                        className='all_close_btn_container'
                        onClick={() => {
                            setLabelModal(false);
                            setNewLabelName('');
                            setSelectedColor('#fff');
                            setIsEditMode(false);
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Labels;
