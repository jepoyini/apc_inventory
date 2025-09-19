import PropTypes from "prop-types";
import React, { useState } from 'react';
import { Row, Col, Alert, Card, CardBody, Container, FormFeedback, Input, Label, Form } from "reactstrap";
import axios from 'axios';
import Swal from 'sweetalert2';

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { userForgetPassword } from "../../slices/thunks";

// import images
// import profile from "../../assets/images/bg.png";
// import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "./ParticlesAuth";
import { createSelector } from "reselect";

import logoLight from "../../assets/images/logo-light.png";
import { APIClient } from "../../helpers/api_helper";

const ForgetPasswordPage = props => {
  const api = new APIClient();
  document.title="Reset Password | PNP Inventory";

  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
    }),
    onSubmit: (values) => {

      dispatch(userForgetPassword(values, props.history));
      //"Reset link are sended to your mailbox, check there first"
    }
  });

  const selectLayoutState = (state) => state.ForgetPassword;
  const selectLayoutProperties = createSelector(
    selectLayoutState,
    (state) => ({
      forgetError: state.forgetError,
      forgetSuccessMsg: state.forgetSuccessMsg,
    })
  );
  // Inside your component
  const {
    forgetError, forgetSuccessMsg
  } = useSelector(selectLayoutProperties);


  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success_message, setSuccessMessage] = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();
debugger; 
    try {
      const data = { email: email };
      const response = await api.create( "/forgotpassword",data );
      if (response.status === 'success') {
        Swal.fire('Success', 'Password reset link has been sent to your email.', 'success');
        setMessage('');
        setSuccessMessage("Password reset link has been sent to your email.");
        setEmail('');
      } else {
        setMessage(response.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setMessage(err);
      //setMessage('Server error. Please try again later.');
    }
  };
  return (
    <React.Fragment>

        <ParticlesAuth>
      <div className="auth-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}> 
      <Container>

                        <Row>
                            <Col lg={12}>
                                <div className="text-center mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                        <img src={`${process.env.PUBLIC_URL}/images/logo2.png`} alt="PNP logo" height="150" />
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
                    <h5 className="text-primary">Forgot Password?</h5>
                    <p className="text-muted">Reset password with PNP Inventory</p>

                    <lord-icon
                      src="https://cdn.lordicon.com/rhvddzym.json"
                      trigger="loop"
                      colors="primary:#0ab39c"
                      className="avatar-xl"
                      style={{ width: "120px", height: "120px" }}
                    >
                    </lord-icon>

                  </div>

                  
                    
                  <div className="p-2">
                    {forgetError && forgetError ? (
                      <Alert color="danger" style={{ marginTop: "13px" }}>
                        {forgetError}
                      </Alert>
                    ) : null}
                    {forgetSuccessMsg ? (
                      <Alert color="success" style={{ marginTop: "13px" }}>
                        {forgetSuccessMsg}
                      </Alert>
                    ) : null}
                    <form onSubmit={handleSubmit}>
                      <br></br>
                    <p>Enter your email and instructions will be sent to you!</p>
                      <div className="mb-4">
                        {/* <Label className="form-label">Email</Label> */}
                         <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                             <br></br>
                        {validation.touched.email && validation.errors.email ? (
                          <FormFeedback type="invalid"><div>{validation.errors.email}</div></FormFeedback>
                        ) : null}
                      </div>
                      {message && <div className="error-label">
                        
                        <Alert color="danger" style={{ marginTop: "13px" }}>
                        {message}
                      </Alert>
                        </div>}
                      {success_message && <div className="success-label">{success_message}</div>}
                      <div className="text-center mt-4">
                        <button className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250" type="submit">Send Reset Link</button>
                      </div>
                    </form>
                  </div>
                </CardBody>
              </Card>

              <div className="mt-4 text-center">
                <p className="mb-0">Wait, I remember my password... <Link to="/login" className="fw-semibold text-primary text-decoration-underline"> Click here </Link> </p>
              </div>

            </Col>
          </Row>
        </Container>
      </div>
    </ParticlesAuth>
    </React.Fragment>
);

};

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
