import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap'; // Import React Bootstrap components

const AddCommentsModal = ({
  token,
  selectedEntry,
  setSelectedEntry,
  setCeoPhoneBookData,
  setFilteredPhonebookData,
}) => {
  const [currentComment, setCurrentComment] = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  useEffect(() => {
    if (selectedEntry) {
      // Fetch comments for the selected entry when it's available
      setCommentsList(selectedEntry.comments || []);
    }
  }, [selectedEntry]);

  const handleSaveComment = async () => {
    if (selectedEntry && currentComment.trim()) {
      try {
        if (token) {
          // Post the new comment
          await axios.post(
            `/api/phonebook/add-comment`,
            {
              phonebookId: selectedEntry._id,
              comment: currentComment,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          // Fetch updated data after posting the comment
          await fetchData();

          // Reset the modal and comment input
          setCurrentComment('');
          setSelectedEntry(null);
          setShowModal(false); // Close modal after saving
        } else {
          // Redirect if token is not available
          // navigate('/');
        }
      } catch (error) {
        console.error('Error saving comment:', error);
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `/api/phonebook/get-all-phonebook`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Assuming the API returns updated data
      const sortedData = response.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      // Update state with sorted data
      setCeoPhoneBookData(sortedData);
      setFilteredPhonebookData(sortedData);
    } catch (error) {
      console.error('Error fetching phonebook data:', error);
    }
  };

  const handleAddCommentClick = () => {
    setShowModal(true); // Open the modal when the button is clicked
  };

  return (
    <>
      {/* Button to trigger modal */}
      <Button variant="primary" onClick={handleAddCommentClick}>
        Add Comment
      </Button>

      {/* React Bootstrap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add a Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Form.Group controlId="commentTextarea">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  placeholder="Enter your comment here..."
                />
              </Form.Group>

              <div className="comments-list">
                <h3>Comments:</h3>
                {commentsList.length > 0 ? (
                  commentsList.map((item, index) => (
                    <div key={index} className="comment-item">
                      <p>{item.remarks}</p>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveComment}>
            Save Comment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddCommentsModal;
