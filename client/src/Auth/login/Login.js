import React, { useEffect, useState } from 'react';
import { Button, Form, Col, Row, Container, Alert, Image } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import JoveraLogoweb from '../../Assets/login.png';
import { loginApi } from '../../Redux/loginSlice';
import { useNavigate } from 'react-router-dom';
import wave from '../../Assets/wave.png'
import { TypeAnimation } from 'react-type-animation';
import { FaFacebook } from "react-icons/fa";
import { IoLogoLinkedin } from "react-icons/io5";
import { GrInstagram } from "react-icons/gr";
import { AiFillTikTok } from "react-icons/ai";
import jovera from '../../Assets/jovera.png'
import './Login.css';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector((state) => state.loginSlice.loading);
    const loginStatus = useSelector((state) => state.loginSlice.user);
    const userRole = useSelector((state) => state.loginSlice.user?.role);
    const [showError, setShowError] = useState(true);
    const error = useSelector((state) => state.loginSlice.error);

    useEffect(() => {
        if (loginStatus) {
            if (userRole === 'TS Agent' || userRole === 'Team Leader') {
                navigate('/phonebook');
            } else {
                navigate('/leads');
            }
        }
    }, [loginStatus, userRole, navigate]);

    const formHandler = (event) => {
        event.preventDefault();
        setShowError(true);
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            const formData = new FormData(form);
            const values = {
                email: formData.get('email'),
                password: formData.get('password'),
            };
            dispatch(loginApi(values)); // Assuming loginApi sets loginStatus and role in the Redux store
            // navigate('/leads');
        }
    };

    setTimeout(() => {
        setShowError(false);
    }, 3000)

    return (
        <Container className='login_main_container d-flex flex-column flex-lg-row align-items-center justify-content-center' style={{ display: 'flex', gap: "20px" }} >
            {/* Left Side: Login Form */}
            <div style={{ flex: 1, maxWidth: '400px' }}  >

                <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }} >
                    <TypeAnimation
                        sequence={[
                            'Login Form',
                            1000,
                            '',
                            500,
                            'Login Form',
                            1000
                        ]}
                        wrapper="h3"
                        cursor={true}
                        repeat={Infinity}
                        style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}
                    />
                    <Image src={wave} alt='wave' style={{ width: '30px', height: '30px' }} />
                </div>

                <div className='mt-2' >
                    <p style={{ color: 'white' }} >Today is a new day. It's your day. You shape it.
                        Sign in to start Managing your Projects.
                    </p>
                </div>
                <Form noValidate onSubmit={formHandler}  >
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label className='mt-2' style={{ fontWeight: '500', color: 'white' }} >Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            required
                            className="animated-input"
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter a valid email.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword">
                        <Form.Label className='mt-2' style={{ fontWeight: '500', color: 'white' }}
                        >Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            required
                            className="animated-input"
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter your password.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button type="submit" className='submitbtn_login' disabled={loading}>
                        {loading ? 'Loading...' : 'Sign in'}
                    </Button>

                    <div className='mt-3' >
                        {showError && error && <Alert variant="danger">{error.message}</Alert>}
                    </div>
                </Form>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '10px' }} className='mt-3'>
                    <FaFacebook style={{ fontSize: '24px', cursor: 'pointer', color: '#0077b5' }} />
                    <IoLogoLinkedin style={{ fontSize: '24px', cursor: 'pointer', color: '#0077b5' }} />
                    <GrInstagram style={{ fontSize: '24px', cursor: 'pointer', color: '#ed5572' }} />
                    <AiFillTikTok style={{ fontSize: '26px', cursor: 'pointer' }} />
                </div>
            </div>

            {/* Right Side: Logo */}
            <div className='logo_container' style={{ position: 'relative' }}>
                {/* Base image */}
                <Image src={JoveraLogoweb} alt="Jovera Logo" style={{ height: '100%', maxHeight: '850px', width: '100%' }} />
                {/* Overlay image */}
                <Image
                    src={jovera}
                    alt='jovera'
                    style={{
                        position: 'absolute',
                        bottom: '30%',
                        left: '25%',
                        width: '50%',
                        height: 'auto',
                        opacity: 0.8,
                    }}
                    className='login_image'
                />
            </div>
        </Container>

    );
};

export default Login;
