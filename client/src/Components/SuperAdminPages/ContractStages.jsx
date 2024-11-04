import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Col, Container, Row } from 'react-bootstrap';
import Sidebar from '../sidebar/Sidebar';

const ContractStages = () => {
    const [stages, setStages] = useState([]);
    const [name, setName] = useState('');
    const [order, setOrder] = useState('');
    const [editStage, setEditStage] = useState(null);
    const token = useSelector((state) => state.loginSlice.user?.token);

    useEffect(() => {
        fetchStages();
    }, []);
    const fetchStages = async () => {
        try {
            const response = await axios.get(`/api/contract-stages/get-all-contract-stages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStages(response.data);
        } catch (error) {
            console.error('Failed to fetch stages', error);
        }
    };
    const createStage = async () => {
        try {
            const response = await axios.post(
                `/api/contract-stages/create-contract-stage`,
                { name, order },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStages([...stages, response.data.newStage]);
            setName('');
            setOrder('');
        } catch (error) {
            console.error('Failed to create stage', error);
        }
    };
    const updateStage = async () => {
        try {
            const response = await axios.put(
                `/api/contract-stages/update-contract-stages/${editStage._id}`,
                { name, order },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStages(stages.map(stage => stage._id === editStage._id ? response.data.updatedStage : stage));
            setEditStage(null);
            setName('');
            setOrder('');
        } catch (error) {
            console.error('Failed to update stage', error);
        }
    };
    const deleteStage = async (id) => {
        try {
            await axios.delete(`/api/contract-stages/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStages(stages.filter(stage => stage._id !== id));
        } catch (error) {
            console.error('Failed to delete stage', error);
        }
    };
    const handleEdit = (stage) => {
        setEditStage(stage);
        setName(stage.name);
        setOrder(stage.order);
    };
    const resetForm = () => {
        setEditStage(null);
        setName('');
        setOrder('');
    };

    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>

                        <h2 style={{ color: 'white' }}>Contract Stages</h2>
                        <div>
                            <input
                                type="text"
                                placeholder="Stage Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Order"
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                            />
                            {editStage ? (
                                <>
                                    <button onClick={updateStage}>Update Stage</button>
                                    <button onClick={resetForm}>Cancel</button>
                                </>
                            ) : (
                                <button onClick={createStage}>Add Stage</button>
                            )}
                        </div>

                        <ul>
                            {stages.map(stage => (
                                <li key={stage._id} style={{ color: 'white' }}>
                                    <strong>{stage.name}</strong> - Order: {stage.order}
                                    <button onClick={() => handleEdit(stage)}>Edit</button>
                                    <button onClick={() => deleteStage(stage._id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContractStages;