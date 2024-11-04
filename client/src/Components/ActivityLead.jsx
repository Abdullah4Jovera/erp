import React from 'react';
import { Card, Image } from 'react-bootstrap';
import default_image from '../Assets/default_image.jpg';
import './leadactivity.css';

const ActivityLead = ({ singleLead }) => {
    const { activity_logs = [] } = singleLead;

    return (
        <Card body className="lead-discussion-main-card-activity-log mt-4">
            <h4 >Activity</h4>
            {activity_logs.length > 0 ? (
                // Reverse the activity logs array to display the most recent activities first
                activity_logs.slice().reverse().map((logactivity, index) => {
                    const imageSrc = logactivity.user_id?.image
                        ? `/images/${logactivity.user_id?.image}`
                        : default_image;
                    return (
                        <>
                            <Card className="activity-log mt-3" key={index}>
                                <div className="activity-log-content">
                                    <div className="activity-log-header">
                                        <Image
                                            src={imageSrc}
                                            alt="image"
                                            className="image_control_discussion"
                                        />
                                        <div className="activity-log-info">
                                            <p className="log-type"  >
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
                        </>
                    )

                })
            ) : (
                <p className="no-activity-log">No Activity Log Available</p>
            )}
        </Card>
    );
};

export default ActivityLead;
