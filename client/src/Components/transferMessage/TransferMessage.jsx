import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Image, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
const TransferMessage = ({ singleLead, fetchSingleLead, id }) => {
    const { is_transfer } = singleLead
    return (
        <>
            <Card className="border-0 shadow card_discussion mt-4" style={{ padding: '20px', borderRadius: '10px' }}>
                {
                    is_transfer && (
                        <div>
                            <p> Lead is Transfer </p>
                        </div>
                    )
                }
            </Card>
        </>
    )
}

export default TransferMessage