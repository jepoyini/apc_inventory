import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Card, CardBody, Col, Container, Label, Row, Button, Spinner, Alert } from 'reactstrap';
import ParticlesAuth from "./ParticlesAuth";
import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";

import logoLight from "../../assets/images/logo-light.png";
import { APIClient } from "../../helpers/api_helper";
const ResetPassword = (props) => {
    const api = new APIClient();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(null); // ✅ Track token validity
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    // ✅ Check if token exists in the database before rendering the form
    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            return;
        }

        const verifyToken = async () => {
            try {

                const response = await api.create('/verifytoken', { token:token }); 

                if (response.status === "success") {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                }
            } catch (error) {
                setTokenValid(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const data = { token:token, password:password };
            debugger; 
            const response = await api.create('/resetpassword', data); // ✅ Call API to check token

            if (response.status === "success") {
                setLoading(false);
                Swal.fire({
                    title: 'Success',
                    text: 'Your password has been reset successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/dashboard/login';
                });
            } else {
                setMessage(response.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setMessage('Server error. Please try again later.');
        }
        setLoading(false);
    };

    document.title = "Reset Password | PNP";
    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={`${process.env.PUBLIC_URL}/images/logo2.png`} alt="" height="150" />
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">Reset Password</h5>
                                        </div>

                                        {/* ✅ Show error if token is missing or invalid */}
                                        {tokenValid === false ? (
                                            <div className="text-center mt-4">
                                                <Alert color="danger">
                                                    <h5 className="text-danger">Token not valid</h5>
                                                    <p>The reset token is invalid or expired. Please request a new reset link.</p>
                                                </Alert>
                                                <Link to="/forgot-password" className="btn btn-primary">Go Back</Link>
                                            </div>
                                        ) : tokenValid === null ? (
                                            <div className="text-center mt-4">
                                                <Spinner color="primary" />
                                                <p>Verifying token...</p>
                                            </div>
                                        ) : (
                                            <div className="p-2 mt-4">
                                                <form onSubmit={handleSubmit}>
                                                    <div className="mb-3">
                                                        <Label htmlFor="password" className="form-label">New Password</Label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            placeholder="Enter new password"
                                                            id="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <Label className="form-label" htmlFor="confirmPassword">Confirm New Password</Label>
                                                        <input
                                                            type="password"
                                                            id="confirmPassword"
                                                            className="form-control"
                                                            placeholder="Confirm new password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <br></br>
                                                    {message && <div className="error-label">{message}</div>}
                                                    <br></br>
                                                    <div className="mt-4">
                                                        <Button color="success" disabled={loading} className="btn btn-primary w-100 btn-default" type="submit">
                                                            {loading ? <Spinner size="sm" /> : "Reset Password"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default withRouter(ResetPassword);
