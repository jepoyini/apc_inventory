import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Row, Col, CardBody, Card, Alert, Container, Input, Label, Form, FormFeedback, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import FeatherIcon from 'feather-icons-react';

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// action
import { registerUser, apiError, resetRegisterFlag } from "../../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";

//import images 
import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "./ParticlesAuth";
import { createSelector } from "reselect";
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
// import Navbar from "../../pages/Pages/Home/Navbar";

import { APIClient } from "../../helpers/api_helper";



const Register = () => {
    const navigate = useNavigate();
    
    const { queryreferrer } = useParams();
    const [initloading, setinitLoading] = useState(true);
    const [username, setUsername] = useState("");
    const history = useNavigate();
    const dispatch = useDispatch();
    const [sponsor_id, setSponsor_id] = useState('');
    const [loading, setLoading] = useState(false);
    const [referrer, setReferrer] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputSponsor, setInputSponsor] = useState('');
    const [captchaValue, setCaptchaValue] = useState(null);
    const [referrerFullName, setReferrerFullName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [errorusername, setErrorUsername] = useState("");
    const [isUsernameChecking, SetIsUsernameChecking] = useState(false); 
    const api = new APIClient();

    useEffect(() => {

        let storedReferrer = '';
        const defaultReferrer = '';
        const defaultReferrerID = '';

        const segments = window.location.pathname.split("/");
        const queryreferrer = segments[segments.length - 1];
    
        // Save it only if it's not 'register' (meaning it's actually a referrer)
        if (queryreferrer && queryreferrer.toLowerCase() !== "register") {
          sessionStorage.setItem("referrer", queryreferrer);
          storedReferrer  = queryreferrer; 
        }

        if (!storedReferrer) {
            const sessionref = sessionStorage.getItem("referrer", queryreferrer);
            if (!sessionref)
                storedReferrer = sessionStorage.setItem("referrer", queryreferrer);
            else 
                storedReferrer =sessionref
        }
            
        setinitLoading(true);
        if (!storedReferrer || storedReferrer === 'undefined' || storedReferrer === 'register') {
           // setIsModalOpen(true); // Show the modal to ask for Sponsor ID
           setSponsor_id(defaultReferrerID);
           setReferrer(defaultReferrer);
           setinitLoading(false);
        } else {
            // Function to fetch sponsor data when the page loads
            const fetchData = async () => {
                try {

                    try {
                        //const response = await axios.post(url, { username: storedReferrer });
                        
                        const response = await api.create('/checkusername', { username: storedReferrer });
                       setinitLoading(false);
                        if (response.status=='success') {
                            setSponsor_id(response.id);
                            setReferrer(response.fullname);
                            setShowModal(false);
                        } else {
                             setErrorUsername("Sponsor username not found. Please try again!")
                        }
                    } catch (error) {
                        setinitLoading(false);
                        setErrorUsername("Error submitting Username");
                        console.error('Error submitting inviter:', error);
                    }

                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

          //  fetchData();
        }            
    }, []);



    const handleSponsorSubmit = () => {
        if (inputSponsor) {
            sessionStorage.setItem('referrer', inputSponsor);
            setIsModalOpen(false);
            window.location.reload(); // Reload the page to use the new referrer
        }
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: '',
            username: '',
            firstname: '',
            lastname: '',
            phone: '',
            password: '',
            confirm_password: '',
            country: '',
            sponsor_id: 0
        },
        validationSchema: Yup.object({
            email: Yup.string().required("Please Enter Your Email"),
            username: Yup.string().required("Please Enter Your Username"),
            lastname: Yup.string().required("Please Enter Your Lastname"),
            firstname: Yup.string().required("Please Enter Your Firstname"),
            phone: Yup.string().required("Please Enter Your Phone"),
            password: Yup.string().required("Please enter your password"),
            confirm_password: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords do not match")
                .required("Please confirm your password"),
            country: Yup.string().required("Please select country").notOneOf([""], "Select country")
        }),
        onSubmit: (values) => {
            setLoading(true);
            values.sponsor_id = sponsor_id; 
            HandleRegisterUser(values);
            //dispatch(registerUser(values));
        }
    });

    const HandleRegisterUser = async (values) => {
        
        try {
            setHasError(false);
            setError(null);

            const response = await api.create( "/register",values );

        
            if (response.status === 'success') {  // response.data, hindi response.status
                setSuccess(true)
                setHasError(false)
                // setSponsor_id(response.id);
                // setShowModal(false);
            } else {
                setLoading(false);
                setHasError(true);
                setError(Object.values(response.data).join('  '));
            }
        } catch (error) {
            setLoading(false);
            setHasError(true);
            setError('Error encountered. Record Not Saved.'); 
            console.error('Error submitting inviter:', error);
        }
    };

  

    const selectLayoutState = (state) => state.Account;
    const registerdatatype = createSelector(
        selectLayoutState,
        (account) => ({
            success: account.success,
            error: account.error,
            message: account.message
        })
    );

    const { error, success, message } = useSelector(registerdatatype);

    const [errorMessage, setError] = useState('');
    const [haserror, setHasError] = useState('');

    const [issuccess, setSuccess] = useState(false);


    useEffect(() => {
        dispatch(apiError(""));
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            setTimeout(() => history("/login"), 3000);
        }
        setTimeout(() => {
            dispatch(resetRegisterFlag());
        }, 3000);

        if (error) {
            setLoading(false);
        }
    }, [dispatch, success, error, history, errorMessage]);


    const handleSubmit = async (e) => {

        e.preventDefault();
        SetIsUsernameChecking(true);

        // Implement the logic to verify inviter username and fetch their sponsor ID and full name
        try {

            const response = await api.create( "/checkusername", { username: username } );
        
            if (response.status === 'success') {  // response.data, hindi response.status
                setSponsor_id(response.id);
                setReferrer(response.fullname);
                setShowModal(false);
            } else {
                setErrorUsername("Sponsor username not found. Please try again!");
            }
        } catch (error) {
            setErrorUsername("Error submitting Username");
            console.error('Error submitting inviter:', error);
        }
        SetIsUsernameChecking(false);
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setError(""); 
    };
    const handleDoneClick = () => {
        navigate("/login"); // Redirect to Dashboard
    };

    document.title = "SignUp | APC Inventory";
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.lordicon.com/bhenfmcm.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return (
        <React.Fragment>
            {/* <Navbar /> */}
            <ParticlesAuth>
                <div className="auth-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>

                {initloading ? (
                    <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center">
                        <Row >
                        <Col xxl={6} lg={8}>
                            <div id="status">
                                <div className="spinner-border text-secondary avatar-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </Col>
                        </Row>
                    {/* <div className="loading-overlay">
                        <p><strong>Loading... Please wait</strong></p>
                    </div> */}
                    </Container>
                ) : (      

                    <Container>

                        <Row>
                        <Col lg={12}>
                            <div className="text-center mb-4 text-white-50">
                            <div>
                                <div
                                onClick={() => navigate(-1)}
                                className="d-inline-block auth-logo"
                                style={{ cursor: 'pointer' }}
                                >
                                <img
                                    src={`${process.env.PUBLIC_URL}/images/logo2.png`}
                                    alt="APC logo"
                                    height="150"
                                />
                                </div>
                            </div>
                            </div>
                        </Col>
                        </Row>



                        {/* Alerts */}
                        {issuccess ? (
                            <>

                                <div className="page-content">

                                    <Container fluid>
                            
                                        <Row className="text-center justify-content-center">
                                        
                                                
                                            <Col lg={8}>

                                                <Card className="pricing-box ribbon-box right">

                                                <div className="text-center p-5">
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/lupuorrc.json"
                                                    trigger="loop"
                                                    colors="primary:#0ab39c,secondary:#405189"
                                                    style={{ width: "150px", height: "150px" }}
                                                ></lord-icon>
                                                </div>
                                                <h5>Congratulations!</h5>
                                                <p className="text-muted mb-4">
                                                Thank you for signing up! Click "Sign In" to access your dashboard. <br></br> 
                                                </p>

                                                <h5 className="mb-3 itv-padding hide">
                                                    <p className="text-muted mb-4">
                                                        In the meantime, please refer to the{" "}
                                                        <a href="/itvhowto" className="text-primary" style={{ textDecoration: "underline" }}>
                                                        How To Use
                                                        </a>{" "}
                                                        guide for detailed instructions on how to avail your products and benefits.
                                                    </p>
                                                </h5>

                                                <div className="hstack justify-content-center gap-2">
                                                <button
                                                    onClick={handleDoneClick}
                                                    type="button"
                                                    className="btn btn-ghost-success"
                                                    data-bs-dismiss="modal"
                                                >
                                                    SignIn{" "}
                                                </button>
                                                </div>
                                                <br></br>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>

                                {/* {toast("Your Redirect To Login Page...", { position: "top-right", hideProgressBar: false, className: 'bg-success text-white', progress: undefined, toastId: "" })}
                                <ToastContainer autoClose={2000} limit={1} />
                                <Alert color="success">
                                    Register User Successfully. Click Signin to login.
                                </Alert> */}
                            </>
                        ) : (
                            <div>
                                {showModal ? (
                                    <Row className="justify-content-center mt-4">
                                            <Col xxl={6} lg={8}>
                                                <Card className="pricing-box ribbon-box right" >
                                                    <CardBody className="bg-light ">

                                                        

                                                        <form onSubmit={handleSubmit}>
                                                            <div className="mb-3">
                                                                <Label htmlFor="amount" className="form-label secondary-color"><br /><h4>Please Enter Your Sponsor's Username Below.</h4></Label>
                                                            </div>
                                                            
                                                            <br></br>
                                                            <div className="mb-3">
                                                            {errorusername && <div className="alert alert-danger mb-xl-0 mb-15">{errorusername}</div>}
                                                                <Input
                                                                    type="text"
                                                                    className="form-control usernamefont"
                                                                    id="txtusername"
                                                                    placeholder="Sponsor's Username"
                                                                    value={username}
                                                                    onChange={handleUsernameChange}
                                                                    required
                                                                />
                                                            
                                                            </div>
                                                            <br></br><br></br>
                                                            <div className="text-center">
                                                                <Button 
                                                                    type="submit" 
                                                                    color="primary" 
                                                                    className = "btn btn-soft-warning waves-effect waves-light material-shadow-none w-100"
                                                                    disabled={isUsernameChecking}
                                                                >
                                                                    {isUsernameChecking ? (
                                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                                            <span className="sr-only">Loading...</span>
                                                                        </div>
                                                                    ) : (
                                                                        "Submit"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                    </Row>
                                ) : (
                                    <Row className="justify-content-center">
                                        <Col md={8} lg={6} xl={8}>
                                            <Card className="mt-4 register-form">
                                                <CardBody className="p-4">
                                                    <div className="text-center mt-2">
                                                    <h5 className="text-primary">Create New Account</h5>
                                                    </div>
                                                    <div className="p-2 mt-4">
                                                        <Form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                validation.handleSubmit();
                                                                return false;
                                                            }}
                                                            className="needs-validation" action="#">
                                                        
                                                        
                                                            <Row>


                                                                    {haserror && (
                                                                        <Alert color="danger">
                                                                            <div>{errorMessage}</div>
                                                                        </Alert>
                                                                    )}

                                                                <Col md={6}>

                                                            

                                                                    <div className="mb-3">
                                                                        <Label htmlFor="useremail" className="form-label">Email <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            id="email"
                                                                            name="email"
                                                                            className="form-control"
                                                                            placeholder="Enter email address"
                                                                            type="email"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.email || ""}
                                                                            invalid={
                                                                                validation.touched.email && validation.errors.email ? true : false
                                                                            }
                                                                        />
                                                                        {validation.touched.email && validation.errors.email ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.email}</div></FormFeedback>
                                                                        ) : null}

                                                                    </div>

                                                                    <div className="mb-3">
                                                                        <Label htmlFor="username" className="form-label">Username <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            name="username"
                                                                            type="text"
                                                                            placeholder="Enter username"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.username || ""}
                                                                            invalid={
                                                                                validation.touched.username && validation.errors.username ? true : false
                                                                            }
                                                                        />
                                                                        {validation.touched.username && validation.errors.username ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.username}</div></FormFeedback>
                                                                        ) : null}

                                                                    </div>

                                                                    <div className="mb-3">
                                                                        <Label htmlFor="firstname" className="form-label">Firstname <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            name="firstname"
                                                                            type="text"
                                                                            placeholder="Enter firstname"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.firstname || ""}
                                                                            invalid={
                                                                                validation.touched.firstname && validation.errors.firstname ? true : false
                                                                            }
                                                                        />
                                                                        {validation.touched.firstname && validation.errors.firstname ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.firstname}</div></FormFeedback>
                                                                        ) : null}

                                                                    </div>

                                                                    <div className="mb-3">
                                                                        <Label htmlFor="lastname" className="form-label">Lastname <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            name="lastname"
                                                                            type="text"
                                                                            placeholder="Enter Lastname"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.lastname || ""}
                                                                            invalid={
                                                                                validation.touched.lastname && validation.errors.lastname ? true : false
                                                                            }
                                                                        />
                                                                        {validation.touched.lastname && validation.errors.lastname ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.lastname}</div></FormFeedback>
                                                                        ) : null}

                                                                    </div>  
                                                                </Col>                   

                                                                <Col md={6}>

                                                                    <div className="mb-3">
                                                                        <Label htmlFor="phone" className="form-label">Phone <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            name="phone"
                                                                            type="text"
                                                                            placeholder="Enter Phone"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.phone || ""}
                                                                            invalid={
                                                                                validation.touched.phone && validation.errors.phone ? true : false
                                                                            }
                                                                        />
                                                                        {validation.touched.phone && validation.errors.phone ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.phone}</div></FormFeedback>
                                                                        ) : null}

                                                                    </div>   

                                                                    <div className="mb-3">
                                                                        <Label htmlFor="country" className="form-label">Country <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            type="select"
                                                                            name="country"
                                                                            id="country"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.country || ""}
                                                                            invalid={
                                                                                validation.touched.country && validation.errors.country ? true : false
                                                                            }
                                                                        >
                                                                            <option value="" label="Select country" />
                                                                            <option value="AF" label="Afghanistan" />
                                                                            <option value="AL" label="Albania" />
                                                                            <option value="DZ" label="Algeria" />
                                                                            <option value="AS" label="American Samoa" />
                                                                            <option value="AD" label="Andorra" />
                                                                            <option value="AO" label="Angola" />
                                                                            <option value="AI" label="Anguilla" />
                                                                            <option value="AQ" label="Antarctica" />
                                                                            <option value="AG" label="Antigua and Barbuda" />
                                                                            <option value="AR" label="Argentina" />
                                                                            <option value="AM" label="Armenia" />
                                                                            <option value="AW" label="Aruba" />
                                                                            <option value="AU" label="Australia" />
                                                                            <option value="AT" label="Austria" />
                                                                            <option value="AZ" label="Azerbaijan" />
                                                                            <option value="BS" label="Bahamas" />
                                                                            <option value="BH" label="Bahrain" />
                                                                            <option value="BD" label="Bangladesh" />
                                                                            <option value="BB" label="Barbados" />
                                                                            <option value="BY" label="Belarus" />
                                                                            <option value="BE" label="Belgium" />
                                                                            <option value="BZ" label="Belize" />
                                                                            <option value="BJ" label="Benin" />
                                                                            <option value="BM" label="Bermuda" />
                                                                            <option value="BT" label="Bhutan" />
                                                                            <option value="BO" label="Bolivia" />
                                                                            <option value="BA" label="Bosnia and Herzegovina" />
                                                                            <option value="BW" label="Botswana" />
                                                                            <option value="BV" label="Bouvet Island" />
                                                                            <option value="BR" label="Brazil" />
                                                                            <option value="IO" label="British Indian Ocean Territory" />
                                                                            <option value="BN" label="Brunei Darussalam" />
                                                                            <option value="BG" label="Bulgaria" />
                                                                            <option value="BF" label="Burkina Faso" />
                                                                            <option value="BI" label="Burundi" />
                                                                            <option value="KH" label="Cambodia" />
                                                                            <option value="CM" label="Cameroon" />
                                                                            <option value="CA" label="Canada" />
                                                                            <option value="CV" label="Cape Verde" />
                                                                            <option value="KY" label="Cayman Islands" />
                                                                            <option value="CF" label="Central African Republic" />
                                                                            <option value="TD" label="Chad" />
                                                                            <option value="CL" label="Chile" />
                                                                            <option value="CN" label="China" />
                                                                            <option value="CX" label="Christmas Island" />
                                                                            <option value="CC" label="Cocos (Keeling) Islands" />
                                                                            <option value="CO" label="Colombia" />
                                                                            <option value="KM" label="Comoros" />
                                                                            <option value="CG" label="Congo" />
                                                                            <option value="CD" label="Congo, The Democratic Republic of The" />
                                                                            <option value="CK" label="Cook Islands" />
                                                                            <option value="CR" label="Costa Rica" />
                                                                            <option value="CI" label="Cote D'Ivoire" />
                                                                            <option value="HR" label="Croatia" />
                                                                            <option value="CU" label="Cuba" />
                                                                            <option value="CY" label="Cyprus" />
                                                                            <option value="CZ" label="Czech Republic" />
                                                                            <option value="DK" label="Denmark" />
                                                                            <option value="DJ" label="Djibouti" />
                                                                            <option value="DM" label="Dominica" />
                                                                            <option value="DO" label="Dominican Republic" />
                                                                            <option value="EC" label="Ecuador" />
                                                                            <option value="EG" label="Egypt" />
                                                                            <option value="SV" label="El Salvador" />
                                                                            <option value="GQ" label="Equatorial Guinea" />
                                                                            <option value="ER" label="Eritrea" />
                                                                            <option value="EE" label="Estonia" />
                                                                            <option value="ET" label="Ethiopia" />
                                                                            <option value="FK" label="Falkland Islands (Malvinas)" />
                                                                            <option value="FO" label="Faroe Islands" />
                                                                            <option value="FJ" label="Fiji" />
                                                                            <option value="FI" label="Finland" />
                                                                            <option value="FR" label="France" />
                                                                            <option value="GF" label="French Guiana" />
                                                                            <option value="PF" label="French Polynesia" />
                                                                            <option value="TF" label="French Southern Territories" />
                                                                            <option value="GA" label="Gabon" />
                                                                            <option value="GM" label="Gambia" />
                                                                            <option value="GE" label="Georgia" />
                                                                            <option value="DE" label="Germany" />
                                                                            <option value="GH" label="Ghana" />
                                                                            <option value="GI" label="Gibraltar" />
                                                                            <option value="GR" label="Greece" />
                                                                            <option value="GL" label="Greenland" />
                                                                            <option value="GD" label="Grenada" />
                                                                            <option value="GP" label="Guadeloupe" />
                                                                            <option value="GU" label="Guam" />
                                                                            <option value="GT" label="Guatemala" />
                                                                            <option value="GG" label="Guernsey" />
                                                                            <option value="GN" label="Guinea" />
                                                                            <option value="GW" label="Guinea-Bissau" />
                                                                            <option value="GY" label="Guyana" />
                                                                            <option value="HT" label="Haiti" />
                                                                            <option value="HM" label="Heard Island and Mcdonald Islands" />
                                                                            <option value="VA" label="Holy See (Vatican City State)" />
                                                                            <option value="HN" label="Honduras" />
                                                                            <option value="HK" label="Hong Kong" />
                                                                            <option value="HU" label="Hungary" />
                                                                            <option value="IS" label="Iceland" />
                                                                            <option value="IN" label="India" />
                                                                            <option value="ID" label="Indonesia" />
                                                                            <option value="IR" label="Iran, Islamic Republic of" />
                                                                            <option value="IQ" label="Iraq" />
                                                                            <option value="IE" label="Ireland" />
                                                                            <option value="IM" label="Isle of Man" />
                                                                            <option value="IL" label="Israel" />
                                                                            <option value="IT" label="Italy" />
                                                                            <option value="JM" label="Jamaica" />
                                                                            <option value="JP" label="Japan" />
                                                                            <option value="JE" label="Jersey" />
                                                                            <option value="JO" label="Jordan" />
                                                                            <option value="KZ" label="Kazakhstan" />
                                                                            <option value="KE" label="Kenya" />
                                                                            <option value="KI" label="Kiribati" />
                                                                            <option value="KP" label="Korea, Democratic People's Republic of" />
                                                                            <option value="KR" label="Korea, Republic of" />
                                                                            <option value="KW" label="Kuwait" />
                                                                            <option value="KG" label="Kyrgyzstan" />
                                                                            <option value="LA" label="Lao People's Democratic Republic" />
                                                                            <option value="LV" label="Latvia" />
                                                                            <option value="LB" label="Lebanon" />
                                                                            <option value="LS" label="Lesotho" />
                                                                            <option value="LR" label="Liberia" />
                                                                            <option value="LY" label="Libyan Arab Jamahiriya" />
                                                                            <option value="LI" label="Liechtenstein" />
                                                                            <option value="LT" label="Lithuania" />
                                                                            <option value="LU" label="Luxembourg" />
                                                                            <option value="MO" label="Macao" />
                                                                            <option value="MK" label="Macedonia, The Former Yugoslav Republic of" />
                                                                            <option value="MG" label="Madagascar" />
                                                                            <option value="MW" label="Malawi" />
                                                                            <option value="MY" label="Malaysia" />
                                                                            <option value="MV" label="Maldives" />
                                                                            <option value="ML" label="Mali" />
                                                                            <option value="MT" label="Malta" />
                                                                            <option value="MH" label="Marshall Islands" />
                                                                            <option value="MQ" label="Martinique" />
                                                                            <option value="MR" label="Mauritania" />
                                                                            <option value="MU" label="Mauritius" />
                                                                            <option value="YT" label="Mayotte" />
                                                                            <option value="MX" label="Mexico" />
                                                                            <option value="FM" label="Micronesia, Federated States of" />
                                                                            <option value="MD" label="Moldova, Republic of" />
                                                                            <option value="MC" label="Monaco" />
                                                                            <option value="MN" label="Mongolia" />
                                                                            <option value="ME" label="Montenegro" />
                                                                            <option value="MS" label="Montserrat" />
                                                                            <option value="MA" label="Morocco" />
                                                                            <option value="MZ" label="Mozambique" />
                                                                            <option value="MM" label="Myanmar" />
                                                                            <option value="NA" label="Namibia" />
                                                                            <option value="NR" label="Nauru" />
                                                                            <option value="NP" label="Nepal" />
                                                                            <option value="NL" label="Netherlands" />
                                                                            <option value="AN" label="Netherlands Antilles" />
                                                                            <option value="NC" label="New Caledonia" />
                                                                            <option value="NZ" label="New Zealand" />
                                                                            <option value="NI" label="Nicaragua" />
                                                                            <option value="NE" label="Niger" />
                                                                            <option value="NG" label="Nigeria" />
                                                                            <option value="NU" label="Niue" />
                                                                            <option value="NF" label="Norfolk Island" />
                                                                            <option value="MP" label="Northern Mariana Islands" />
                                                                            <option value="NO" label="Norway" />
                                                                            <option value="OM" label="Oman" />
                                                                            <option value="PK" label="Pakistan" />
                                                                            <option value="PW" label="Palau" />
                                                                            <option value="PS" label="Palestinian Territory, Occupied" />
                                                                            <option value="PA" label="Panama" />
                                                                            <option value="PG" label="Papua New Guinea" />
                                                                            <option value="PY" label="Paraguay" />
                                                                            <option value="PE" label="Peru" />
                                                                            <option value="PH" label="Philippines" />
                                                                            <option value="PN" label="Pitcairn" />
                                                                            <option value="PL" label="Poland" />
                                                                            <option value="PT" label="Portugal" />
                                                                            <option value="PR" label="Puerto Rico" />
                                                                            <option value="QA" label="Qatar" />
                                                                            <option value="RE" label="Reunion" />
                                                                            <option value="RO" label="Romania" />
                                                                            <option value="RU" label="Russian Federation" />
                                                                            <option value="RW" label="Rwanda" />
                                                                            <option value="SH" label="Saint Helena" />
                                                                            <option value="KN" label="Saint Kitts and Nevis" />
                                                                            <option value="LC" label="Saint Lucia" />
                                                                            <option value="PM" label="Saint Pierre and Miquelon" />
                                                                            <option value="VC" label="Saint Vincent and The Grenadines" />
                                                                            <option value="WS" label="Samoa" />
                                                                            <option value="SM" label="San Marino" />
                                                                            <option value="ST" label="Sao Tome and Principe" />
                                                                            <option value="SA" label="Saudi Arabia" />
                                                                            <option value="SN" label="Senegal" />
                                                                            <option value="RS" label="Serbia" />
                                                                            <option value="SC" label="Seychelles" />
                                                                            <option value="SL" label="Sierra Leone" />
                                                                            <option value="SG" label="Singapore" />
                                                                            <option value="SK" label="Slovakia" />
                                                                            <option value="SI" label="Slovenia" />
                                                                            <option value="SB" label="Solomon Islands" />
                                                                            <option value="SO" label="Somalia" />
                                                                            <option value="ZA" label="South Africa" />
                                                                            <option value="GS" label="South Georgia and The South Sandwich Islands" />
                                                                            <option value="ES" label="Spain" />
                                                                            <option value="LK" label="Sri Lanka" />
                                                                            <option value="SD" label="Sudan" />
                                                                            <option value="SR" label="Suriname" />
                                                                            <option value="SJ" label="Svalbard and Jan Mayen" />
                                                                            <option value="SZ" label="Swaziland" />
                                                                            <option value="SE" label="Sweden" />
                                                                            <option value="CH" label="Switzerland" />
                                                                            <option value="SY" label="Syrian Arab Republic" />
                                                                            <option value="TW" label="Taiwan, Province of China" />
                                                                            <option value="TJ" label="Tajikistan" />
                                                                            <option value="TZ" label="Tanzania, United Republic of" />
                                                                            <option value="TH" label="Thailand" />
                                                                            <option value="TL" label="Timor-Leste" />
                                                                            <option value="TG" label="Togo" />
                                                                            <option value="TK" label="Tokelau" />
                                                                            <option value="TO" label="Tonga" />
                                                                            <option value="TT" label="Trinidad and Tobago" />
                                                                            <option value="TN" label="Tunisia" />
                                                                            <option value="TR" label="Turkey" />
                                                                            <option value="TM" label="Turkmenistan" />
                                                                            <option value="TC" label="Turks and Caicos Islands" />
                                                                            <option value="TV" label="Tuvalu" />
                                                                            <option value="UG" label="Uganda" />
                                                                            <option value="UA" label="Ukraine" />
                                                                            <option value="AE" label="United Arab Emirates" />
                                                                            <option value="GB" label="United Kingdom" />
                                                                            <option value="US" label="United States" />
                                                                            <option value="UM" label="United States Minor Outlying Islands" />
                                                                            <option value="UY" label="Uruguay" />
                                                                            <option value="UZ" label="Uzbekistan" />
                                                                            <option value="VU" label="Vanuatu" />
                                                                            <option value="VE" label="Venezuela" />
                                                                            <option value="VN" label="Viet Nam" />
                                                                            <option value="VG" label="Virgin Islands, British" />
                                                                            <option value="VI" label="Virgin Islands, U.S." />
                                                                            <option value="WF" label="Wallis and Futuna" />
                                                                            <option value="EH" label="Western Sahara" />
                                                                            <option value="YE" label="Yemen" />
                                                                            <option value="ZM" label="Zambia" />
                                                                            <option value="ZW" label="Zimbabwe" />
                                                                        </Input>
                                                                        {validation.touched.country && validation.errors.country ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.country}</div></FormFeedback>
                                                                        ) : null}
                                                                    </div>

                                                                    <div className="mb-3">
                                                                        <Label htmlFor="userpassword" className="form-label">Password <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            name="password"
                                                                            type="password"
                                                                            placeholder="Enter Password"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.password || ""}
                                                                            invalid={
                                                                                validation.touched.password && validation.errors.password ? true : false
                                                                            }
                                                                        />
                                                                        {validation.touched.password && validation.errors.password ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.password}</div></FormFeedback>
                                                                        ) : null}

                                                                    </div>

                                                                    <div className="mb-2">
                                                                        <Label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></Label>
                                                                        <Input
                                                                            name="confirm_password"
                                                                            type="password"
                                                                            placeholder="Confirm Password"
                                                                            onChange={validation.handleChange}
                                                                            onBlur={validation.handleBlur}
                                                                            value={validation.values.confirm_password || ""}
                                                                            invalid={
                                                                                validation.touched.confirm_password && validation.errors.confirm_password ? true : false
                                                                            }
                                                                        />
                                                                        {validation.touched.confirm_password && validation.errors.confirm_password ? (
                                                                            <FormFeedback type="invalid"><div>{validation.errors.confirm_password}</div></FormFeedback>
                                                                        ) : null}

                                                                    </div>

                                                                    <div className="mb-4">
                                                                        <p className="mb-0 fs-12 text-muted fst-italic">
                                                                        </p>
                                                                    </div>
                                                                </Col>     
                                                            </Row>
                                                            
                                                            <Row className="justify-content-center"> 
                                                                <Col md={6} className="d-flex flex-column align-items-center">
                                                                <div className="mb-3">
                                                                {/* <ReCAPTCHA
                                                                    sitekey="6Ld1ux4qAAAAAGS83JnFQ7BONUgY2qI3mZojzoP8"
                                                                    onChange={setCaptchaValue}
                                                                    theme="dark"  
                                                                /> */}
                                                            </div>

                                                                    <br></br>

                                                                <button className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250" type="submit" disabled={loading}>
                                                                    {loading ? <Spinner size="sm" /> : "Sign Up"}
                                                                </button>
                                                                </Col>
                                                            </Row>

                                                            
                                                    
                                                            <div className="mt-4 text-center hide">
                                                                <div className="signin-other-title">
                                                                    <h5 className="fs-13 mb-4 title text-muted">Create account with</h5>
                                                                </div>

                                                                <div>
                                                                    <button type="button" className="btn btn-primary btn-icon waves-effect waves-light"><i className="ri-facebook-fill fs-16"></i></button>{" "}
                                                                    <button type="button" className="btn btn-danger btn-icon waves-effect waves-light"><i className="ri-google-fill fs-16"></i></button>{" "}
                                                                    <button type="button" className="btn btn-dark btn-icon waves-effect waves-light"><i className="ri-github-fill fs-16"></i></button>{" "}
                                                                    <button type="button" className="btn btn-info btn-icon waves-effect waves-light"><i className="ri-twitter-fill fs-16"></i></button>
                                                                </div>
                                                            </div>
                                                        </Form>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                            <div className="mt-4 mb-20 text-center">
                                                <p className="mb-0">Already have an account? <Link to="/login" className="fw-semibold text-primary text-decoration-underline"> Signin </Link> </p>
                                            </div>


                                        </Col>
                                    </Row>
                                )}
                            </div>
                         )}

                    </Container>
                )}                    

                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
}

export default Register;
