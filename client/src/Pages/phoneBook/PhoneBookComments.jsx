import React, { useEffect, useState } from 'react';
import { Image, Modal } from 'react-bootstrap';
import axios from 'axios';

const PhoneBookComments = ({ leadId, setPhoneBookModal, phoneBookModal, singleLead }) => {
    const [comments, setComments] = useState([]);

    // Effect to set the phonebook comments from singleLead
    useEffect(() => {
        if (singleLead && singleLead.phonebookcomments) {
            setComments(singleLead.phonebookcomments);
        }
    }, [singleLead]);

    return (
        <Modal show={phoneBookModal} onHide={() => setPhoneBookModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>PhoneBook Comments</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height:'100%', maxHeight:'500px', overflowY:'scroll' }} >
                {comments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {comments.map((comment) => (
                            <div key={comment._id} className="comment" style={{ display: 'flex', flexDirection: 'column', padding: '15px', borderBottom: '1px solid #eee' }}>
                                {/* Comment Header (User Info) */}
                                <div className="comment-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Image
                                        src={`/images/${comment?.user?.image}`}
                                        alt={comment.user.name}
                                        style={{ width: 40, height: 40, borderRadius: '50%' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{comment?.user?.name}</span>
                                        <span style={{ fontSize: '12px', color: '#888' }}>
                                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Comment Body (Remarks) */}
                                <div className="comment-body" style={{ marginTop: '10px' }}>
                                    <div
                                        style={{
                                            backgroundColor: '#fff',
                                            padding: '10px 15px',
                                            borderRadius: '10px',
                                            maxWidth: '80%',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                            wordBreak: 'break-word',
                                            border: '1px solid #ddd',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>{comment?.remarks}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>No comments available.</p>
                )}

            </Modal.Body>
        </Modal>
    );
};

export default PhoneBookComments;
