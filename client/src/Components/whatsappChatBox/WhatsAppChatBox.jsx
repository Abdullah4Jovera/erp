import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import '../../Pages/style.css';
import { FiSend } from "react-icons/fi";
import { RiWhatsappFill } from "react-icons/ri";

const WhatsAppChat = ({ leadId }) => {
    const { id } = useParams();
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const token = useSelector(state => state.loginSlice.user?.token);
    const textareaRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Fetch chat history
        const fetchChatHistory = async () => {
            try {
                const { data } = await axios.get(`/api/whatsup/chat-history/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setChatHistory(data);
            } catch (err) {
                console.error('Failed to fetch chat history', err);
            }
        };

        fetchChatHistory();

        // Initialize socket connection 
        const socket = io(``, {
            transports: ['websocket'],
            upgrade: false,
        });

        // Join the specific room for this lead
        socket.emit('join_lead_room', id);

        // Handle incoming messages
        socket.on('new_message', (newMessage) => {
            setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, [id, token]);

    const handleSendMessage = async () => {
        if (message.length > 300) {
            setError('Message cannot exceed 300 characters');
            return;
        }
        setSending(true);
        setError('');

        try {
            await axios.post(
                `/api/whatsup/send-message`,
                {
                    messageBody: message,
                    clientId: null, // Adjust accordingly
                    leadId: id || leadId // or another identifier
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage('');
        } catch (err) {
            setError('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        // Adjust the height of the textarea based on the scrollHeight
        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'; // Reset the height
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
            }
        };

        adjustHeight();
    }, [message]);

    // Scroll to the bottom of the chat on mount and when new messages are added
    // useEffect(() => {
    //     if (chatEndRef.current) {
    //         chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [chatHistory]);

    const firstUser = chatHistory[0]?.user; // Get the first user from chat history
    const firstUserName = firstUser ? firstUser.name : 'the user'; // Default to 'the user' if no user exists

    return (
        <Card body style={{ padding: '5px 5px 0px 5px', backgroundColor: 'white' }} className='card_discussion_chat_boat mutual_background_class'>
            <h5 className='text-center'>
                <RiWhatsappFill style={{ fontSize: '24px', color: '#4fc65a' }} /> <span className='mutual_class_color'>WhatsApp Chat</span>
            </h5>

            <div className="chat-history mb-3" style={{ height: '100%', maxHeight: '315px', display: 'flex', flexDirection: 'column', overflowY: 'scroll' }}>
                <div
                    className="chat-messages"
                    style={{
                        flex: '1',
                        overflowY: 'auto',
                        padding: '30px 5px 5px 5px',
                        backgroundColor: '#f5f5f5',
                        marginBottom: '10px', // Space between messages and input
                    }}
                >
                    {chatHistory.length > 0 ? (
                        chatHistory.map((chat, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: chat.user ? 'flex-end' : 'flex-start', // Adjusted to conditionally set alignment
                                    margin: '10px 0'
                                }}
                            >
                                <Card
                                    className={`message_sender ${chat.user ? 'bg-green text-white' : ''}`} // Adjusting class for client
                                    style={{
                                        width: 'auto', // Removed 'maxWidth: auto' as it's not valid
                                        borderRadius: '10px',
                                        padding: '10px',
                                    }}
                                >
                                    <p className="mb-0" style={{ fontSize: '14px', padding: '0 5px' }}>
                                        <strong style={{ fontSize: '12px', paddingRight: '5px' }}>
                                            {chat.user ? chat.user.name : 'Client'}:
                                        </strong>
                                        {chat.message_body}
                                    </p>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'black', fontSize: '12px' }}>
                            Start a chat with {firstUserName}.
                        </p>
                    )}
                    {/* Reference div to scroll to the bottom */}
                    <div ref={chatEndRef} />
                </div>

                <div className='chat_text_container'>
                    <Form.Group controlId="messageTextarea" className='chat_text_message w-100'>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className='chat_input_field_placeholder'
                            ref={textareaRef} // Attach ref to the textarea
                            maxLength={300}
                        />
                    </Form.Group>
                    <div className='whatspp_send_message' onClick={handleSendMessage}>
                        <FiSend className='sending_message_btn' />
                    </div>
                </div>
            </div>

            {error && <p className="text-danger">{error}</p>}
        </Card>
    );
};

export default WhatsAppChat;
