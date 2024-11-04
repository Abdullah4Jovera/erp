import React, { useState, useRef, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Form, Image } from 'react-bootstrap';
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';
import axios from 'axios';
import default_image from '../Assets/default_image.jpg';
import WhatsAppChatBox from './whatsappChatBox/WhatsAppChatBox';
import '../Pages/style.css';

const LeadDiscussion = ({ id, singleLead, fetchSingleLead }) => {
    console.log(singleLead.is_reject, 'singleleadisreject')
    const token = useSelector(state => state.loginSlice.user?.token);
    const [discussionText, setDiscussionText] = useState('');
    const [error, setError] = useState('');
    const { discussions = [] } = singleLead;
    const textareaRef = useRef(null);
    const chatHistoryRef = useRef(null); // Ref to the chat history container
    const chatEndRef = useRef(null); // Ref to scroll to the end of chat
    const handleInputChange = (e) => {
        const value = e.target.value;
        setDiscussionText(value);

        if (value.trim()) {
            setError('');
        }
    };

    // Add Discussion
    const sendDiscussionMessage = async () => {
        if (!discussionText.trim()) {
            setError('Please Enter a Comment.');
            return;
        }

        try {
            await axios.post(`/api/leads/add-discussion/${id}`, {
                comment: discussionText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDiscussionText('');
            fetchSingleLead();
        } catch (error) {
            console.log(error, 'err');
        }
    }

    // Scroll to the top of the chat on first render
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = 0; // Set scroll to top when component first renders
        }
    }, []);

    // Scroll to the bottom of the chat when new messages are added
    // useEffect(() => {
    //     if (chatEndRef.current) {
    //         chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [discussions]);



    return (
        <div>
            <WhatsAppChatBox />
            <Card className='mt-4 lead_discussion_main_card_main' style={{ padding: '15px' }}>
                <Container>
                    <Row>
                        <Col xs={12}>
                            <div className='discussion_files'>
                                <h5>Lead Discussion</h5>
                            </div>
                            <hr />

                            <div
                                className="chat-history mb-3"
                                style={{ maxHeight: '300px', overflowY: 'auto' }}
                                ref={chatHistoryRef} // Attach ref to the chat history container
                            >
                                {discussions.slice().reverse().map((leadDiscussion, index) => {
                                    const imageSrc = leadDiscussion.created_by.image
                                        ? `/images/${leadDiscussion.created_by.image}`
                                        : default_image;

                                    return (
                                        <div key={index}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <Image src={imageSrc} alt="image" className='image_control_discussion' />
                                                <p className='mb-0' style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {leadDiscussion.created_by.name}
                                                </p>
                                            </div>
                                            <p className='mb-0' style={{ fontSize: '14px' }}>
                                                {new Date(leadDiscussion.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </p>
                                            <p style={{ fontSize: '14px' }} className='mb-4 mt-2'>
                                                {leadDiscussion.comment}
                                            </p>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef}></div> {/* Scroll to this when new messages are added */}
                            </div>

                            <Form>
                                <Form.Control
                                    as="textarea"
                                    placeholder="Leave a comment here"
                                    rows={1}
                                    value={discussionText}
                                    onChange={handleInputChange}
                                    required
                                    ref={textareaRef} // Attach ref to the textarea
                                    maxLength={300}
                                    className='lead_discussion_class'
                                />
                                {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
                            </Form>

                            <Button onClick={sendDiscussionMessage} className="mt-2 all_single_leads_button">Create</Button>

                        </Col>
                    </Row>
                </Container>
            </Card>
        </div>
    );
}

export default LeadDiscussion;
