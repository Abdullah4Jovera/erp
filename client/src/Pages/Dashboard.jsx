import React from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import Sidebar from '../Components/sidebar/Sidebar'

const Dashboard = () => {
    return (
        <div>
            <Container fluid>
                <Row >
                    <Col xs={12} md={12} lg={1}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={11}>
                        <Card className='leads_main_cards mb-3' style={{  }}>
                            <h1 className='text-center' >Dashboard</h1>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Dashboard

// linear-gradient(141.55deg, #ffa000 3.46%, #1c1c1c 99.86%), #ffa000 !important
// #6fd943
// #3ec9d6
// #ffa21d
// #ff3a6e
// #6E777F