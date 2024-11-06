import React from 'react';
import { Card, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import default_image from '../Assets/default_image.jpg';
import './leadactivity.css';

const ActivityLead = ({ singleLead }) => {
    const { activity_logs = [] } = singleLead;

    return (
        <Card body className="lead-discussion-main-card-activity-log mt-4">
            <h4>Activity</h4>
            {activity_logs.length > 0 ? (
                // Reverse the activity logs array to display the most recent activities first
                activity_logs.slice().reverse().map((logactivity, index) => {
                    const imageSrc = logactivity.user_id?.image
                        ? `/images/${logactivity.user_id?.image}`
                        : default_image;

                    // Create a tooltip with the user's name
                    const renderTooltip = (props) => (
                        <Tooltip id="button-tooltip" {...props}>
                            {logactivity.user_id?.name || 'Unknown User'}
                        </Tooltip>
                    );

                    return (
                        <Card className="activity-log mt-3" key={logactivity._id}>
                            <div className="activity-log-content">
                                <div className="activity-log-header">
                                    <OverlayTrigger
                                        placement="top"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={renderTooltip}
                                    >
                                        <Image
                                            src={imageSrc}
                                            alt="User Image"
                                            className="image_control_discussion"
                                        />
                                    </OverlayTrigger>
                                    <div className="activity-log-info">
                                        <p className="log-type">
                                            {logactivity.log_type || 'No Log Type Available'}
                                        </p>
                                        <p className="log-remark">{logactivity.remark || 'No Remark Available'}</p>
                                    </div>
                                </div>
                                <p className="log-date">
                                    {new Date(logactivity.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </p>
                            </div>
                        </Card>
                    );
                })
            ) : (
                <p className="no-activity-log">No Activity Log Available</p>
            )}
        </Card>
    );
};

export default ActivityLead;
