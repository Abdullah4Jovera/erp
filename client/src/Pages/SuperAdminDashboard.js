import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'antd'
import Navbar from '../Components/navbar/Navbar';
import Sidebar from '../Components/sidebar/Sidebar';
import Branches from '../Components/SuperAdminPages/Branches';
const SuperAdminDashboard = () => {


    return (
        <div>
            {/* <Navbar /> */}
            <Row>
                <Col xs={24} sm={24} md={12} lg={4} >
                    <div>
                        <Sidebar />
                    </div>
                </Col>
                <Col xs={24} sm={24} md={12} lg={6}>
                    <h1>Super Admin Dashboard</h1>
                </Col>
            </Row>
        </div>
    );
};

export default SuperAdminDashboard;
