import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Container, Form, Input, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import classnames from "classnames";
import axios from 'axios';
import Swal from 'sweetalert2';
import avatar from "../../assets/images/users/user-dummy-img.jpg";
import { APIClient } from "../../helpers/api_helper";
const Settings = () => {

    const api = new APIClient();
    const [pageloading, setPageLoading] = useState(true);

    // const [user, setuser] = useState({
    //     avatar: avatar, // Placeholder avatar
    //     userName: "Admin",
    //     email: "admin@example.com",
    //     idx: "12345",
    //     replink: "https://ibopro.com/admin",
    //     sponsor: "John Doe",
    //     date_joined: "2025-03-15",
    //     status: "Active",
    //     id: "", 
    //     firstname: "", 
    //     lastname: "", 
    //     email: "", 
    //     phone: "",
    //     address: "", 
    //     city: "", 
    //     country: "", 
    //     enable_2fa: ""
    //   });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("1");
    const [googleauthmodal, setGoogleauthmodal] = useState(false);
    const [google_key, setGooglekey] = useState('');
    const [google_qrcodeurl, setGoogleqrcodeurl] = useState('');
    const [g2facode, setG2facode] = useState('');
    
    const [user, setUser] = useState({
        avatar: avatar, 
        userName: "Admin",
        email: "admin@example.com",
        idx: "12345",
        replink: "https://ibopro.com/admin",
        sponsor: "John Doe",
        date_joined: "2025-03-15",
        status: "Active",
        uid: "", 
        firstname: "", 
        lastname: "", 
        email: "", 
        phone: "",
        address: "", 
        city: "", 
        country: "", 
        enable_2fa: ""
    });
    const countryList = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
        "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
        "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
        "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (Swaziland)", "Ethiopia", "Fiji", "Finland", "France",
        "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
        "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
        "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
        "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
        "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
        "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal",
        "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
        "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
        "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
        "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
        "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
        "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
        "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
        "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
      ];

    const fetchUser = async () => {
        try {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));

            const response = await api.post('/getuser', { uid: obj.id });
    
            // Add fullname manually after setting user
            const updatedUser = {
                ...response.data,
                fullname:`${response.data.firstname} ${response.data.lastname}`,
                replink:  `https://ibopro.com/?sharing=${response.data.username}`,
            };
            setPageLoading(false)
            setUser(updatedUser);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };
    
    useEffect(() => {
        fetchUser();
    }, []);


    const copyToClipboard = () => {

        const repLinkElement = document.getElementById('rep_link');
        const urlText = repLinkElement.innerText;

        const tempInput = document.createElement('input');
        tempInput.value = urlText;
        document.body.appendChild(tempInput);
    
        tempInput.select();
        document.execCommand('copy');
    
        document.body.removeChild(tempInput);
    
        alert('URL copied to clipboard!');
      };

    // const GetData = async () => {
    //     debugger; 
    //     const obj = JSON.parse(sessionStorage.getItem("authUser"));

    //     const response = await api.post('/getuser', {uid:obj.id});
    //     if (response.status === "success") {
    //         setuser({
    //             avatar: avatar, // Placeholder avatar
    //             fullname:`${obj.firstname} ${obj.lastname}`,
    //             userName: obj.username,
    //             email: obj.email,
    //             idx: obj.id,
    //             replink:  `https://ibopro.com/${obj.username}`,
    //             sponsor: obj.sponsor_id ? `${obj.sponsor_name} #${obj.sponsor_id}` : obj.sponsor_name, 
    //             date_joined: obj.date_created,
    //             status: obj.status,
    //           });
    //     }

        
    // };

    // useEffect(() => { GetData(); }, []);

    const updatePassword = async () => {
        try {
            debugger; 
            const response = await api.post('/changepass', user);
            setLoading(false);

            if (response.success)
            {

                console.log(response.message);
                // Show success message using SweetAlert2
                Swal.fire({
                    icon: 'success',
                    title: '',
                    text: response.message,
                    confirmButtonText: 'OK'
                });      
                // debugger; 
                // sessionStorage.setItem("authUser", JSON.stringify(user));          
            }
            else
            {
                console.log(response.message);
                Swal.fire({
                    icon: 'error',
                    title: '',
                    text: response.message,
                    confirmButtonText: 'OK'
                }); 
            }
            // Optionally, handle success feedback to the user (e.g., show a success message)
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert("Error while saving!");
            // Optionally, handle error feedback to the user (e.g., show an error message)
        }
    };
    const updateProfile = async () => {

        setLoading(true);
        try {
            const response = await api.post('/updateuser', user);
            Swal.fire({
                icon: response.success ? 'success' : 'error',
                text: response.message,
                confirmButtonText: 'OK'
            });
            //if (response.success) sessionStorage.setItem("authUser", JSON.stringify(user));
        } catch (error) {
            Swal.fire({ icon: 'error', text: "Error while saving!", confirmButtonText: 'OK' });
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prevUser => ({ ...prevUser, [name]: value }));
    };

    const togglegoogleauthModal = () => setGoogleauthmodal(!googleauthmodal);
    
    const handle2Gaconfirm = async () => {
        try {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const response = await axios.post("/verifyg2a.php", { id: obj.id, otp_code: g2facode, csrf_token: obj.csrf_token });
            if (response.success) {
                setUser(prevUser => ({ ...prevUser, enable_2fa: "1" }));
                Swal.fire({ icon: 'success', text: "Google Authentication is now setup.", confirmButtonText: 'OK' });
                togglegoogleauthModal();
            } else {
                Swal.fire({ icon: 'error', text: response.message, confirmButtonText: 'OK' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', text: "Error setting up Google Authenticator.", confirmButtonText: 'OK' });
        }
    };

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputPasswordChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [id]: value
        }));
    };
    const validatePasswords = () => {
        const { oldPassword, newPassword, confirmPassword } = formData;

        if (!oldPassword || !newPassword || !confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'All fields are required.',
                confirmButtonText: 'OK'
            });
            return false;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'New password and confirm password do not match.',
                confirmButtonText: 'OK'
            });
            return false;
        }

        user.pwd=oldPassword; 
        user.newpwd=newPassword; 

        updatePassword();
        
    };

    const tabChange = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    return (


        <React.Fragment>
            <div className="page-content">
            {pageloading ? (
                <Container fluid>
                    <div id="status">
                        <div className="spinner-border text-primary avatar-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </Container>
            ) : (  
                <Container fluid>

                    <div className="position-relative mx-n4 mt-n4">
                        <div className="profile-wid-bg profile-setting-img">
                          
   
                        </div>
                    </div>


                    <Row>
                        <Col lg="9">
                            <Card>
                            <CardBody>
                                <Row>
                                {/* First Column - Existing Contents */}
                                <Col md="5">
                                    <div className="d-flex">
                                    <div className="mx-3">
                                        <img
                                        src={user.avatar 
                                            ? `${process.env.PUBLIC_URL}/images/users/${user.avatar}` 
                                            : `${process.env.PUBLIC_URL}/images/users/user-dummy-img.jpg`}
                                        alt="User Avatar"
                                        className="avatar-md rounded-circle img-thumbnail"
                                        />
                                    </div>
                                    <div className="flex-grow-1 align-self-center">
                                    <div className="d-flex align-items-center">
                                        <span className="profile-name mb-0">
                                          {user.fullname}
                                        </span>
                                       
                                        </div>
                                        
                                        <p className="mb-1">
                                        <strong>Username:</strong> <span className="text-muted">{user.username}</span> <span className={`badge ms-2 ${user.status.toLowerCase() === "active" ? "bg-success" : "bg-danger"}`}>
                                        {user.status}
                                        </span>

                                        
                                        </p>
                                        <p className="mb-1">
                                        <strong>User ID #:</strong> <span className="text-muted">{user.uid}</span>
                                        </p>
                                    </div>
                                    </div>
                                </Col>

                                {/* Second Column - Replicated Link, Email, Sponsor */}
                                <Col md="7">
                                    <p className="mb-1">
                                    <strong>Replicated Link:</strong> <span className="text-muted" translate="no" id="rep_link">{user.replink}</span>{" "}
                                    <i
                                        className="far fa-copy copy-icon"
                                        title="Copy to clipboard"
                                        onClick={copyToClipboard}
                                        style={{ cursor: "pointer", marginLeft: "10px", color: "#007bff" }}
                                    ></i>
                                    </p>
                                    <p className="mb-1">
                                    <strong>Date Joined:</strong> <span className="text-muted">{user.date_created}</span>
                                    </p>
                                    <p className="mb-1">
                                    <strong>Sponsor:</strong> <span className="text-muted">{user.sponsor_name || "N/A"}</span>
                                    </p>
                                </Col>

                                {/* Third Column - Date Joined, Status with Badge */}
                                <Col md="4">
                                  
                                </Col>
                                </Row>
                            </CardBody>
                            </Card>
                        </Col>
                    </Row>



                    <Row>


                        <Col xxl={9}>
                            <Card className="">
                                <CardHeader>
                                    <Nav className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
                                        role="tablist">
                                       
                                        <NavItem>
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "1" })}
                                                onClick={() => {
                                                    tabChange("1");
                                                }}
                                                type="button">
                                              
                                                 Account Details
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "2" })}
                                                onClick={() => {
                                                    tabChange("2");
                                                }}
                                                type="button">
                                            
                                                Change Password
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className="hide" >
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "3" })}
                                                onClick={() => {
                                                    tabChange("3");
                                                }}
                                                type="button">
                                                Payment
                                            </NavLink>
                                        </NavItem>
                                        {/* <NavItem>
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "4" })}
                                                onClick={() => {
                                                    tabChange("4");
                                                }}
                                                type="button">
                                                Security
                                            </NavLink>
                                        </NavItem> */}
                                    </Nav>
                                </CardHeader>
                                <CardBody className="p-4">
                                    <TabContent activeTab={activeTab}>

                                        <TabPane tabId="1">
                                            <Form>
                                                <Row>
                                                                                             
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="firstnameInput" className="form-label">First
                                                                Name</Label>
                                                            <Input type="text" className="form-control" id="firstnameInput" name="firstname" 
                                                                placeholder="Enter your firstname" Value={user.firstname}  onChange={handleInputChange} />
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="lastnameInput" className="form-label">Last
                                                                Name</Label>
                                                            <Input type="text" className="form-control" id="lastnameInput" name="lastname" 
                                                                placeholder="Enter your lastname"  Value={user.lastname}  onChange={handleInputChange}/>
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="phonenumberInput" className="form-label">Phone
                                                                Number</Label>
                                                            <Input type="text" className="form-control"
                                                                id="phonenumberInput"
                                                                name="phone" 
                                                                placeholder="Enter your phone number"
                                                                Value={user.phone}  onChange={handleInputChange} />
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="emailInput" className="form-label">Email
                                                                Address</Label>
                                                            <Input type="email" className="form-control" id="emailInput"
                                                                name="email" 
                                                                placeholder="Enter your email"
                                                                Value={user.email}  onChange={handleInputChange} />
                                                        </div>
                                                    </Col>
                                                    <Col lg={12}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="Address1"
                                                                className="form-label">Address</Label>
                                                            <Input type="text" className="form-control" id="addressInput"
                                                                placeholder="" 
                                                                name="address"
                                                                Value={user.address}  onChange={handleInputChange}  />
                                                        </div>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="cityInput" className="form-label">City</Label>
                                                            <Input type="text" className="form-control" id="cityInput"
                                                                placeholder="City" 
                                                                name="city"
                                                                Value={user.city}  onChange={handleInputChange}  />
                                                        </div>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="countryInput" className="form-label">Country</Label>
                                                            <Input
                                                                type="select"
                                                                className="form-control"
                                                                id="countryInput"
                                                                name="country"
                                                                value={user.country || ""}
                                                                onChange={handleInputChange}
                                                                >
                                                                <option value="">Select Country</option>
                                                                {countryList.map((country, index) => (
                                                                    <option key={index} value={country}>
                                                                    {country}
                                                                    </option>
                                                                ))}
                                                                </Input>
                                                        </div>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="zipcodeInput" className="form-label">Zip
                                                                Code</Label>
                                                            <Input type="text" className="form-control" minLength="5"
                                                                maxLength="6" id="zipcodeInput"
                                                                placeholder="Enter zipcode" 
                                                                name="zip"
                                                                Value={user.zip}  onChange={handleInputChange}  /> 
                                                        </div>
                                                    </Col>
                                                    <Col lg={12}>
                                                        <div className="hstack gap-2 justify-content">

                                                            <Button className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250 w-150px" type="button" onClick={updateProfile}>
                                                                {loading ? <Spinner size="sm" />   : "Update"}
                                                            </Button>

                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </TabPane>

                                        <TabPane tabId="2">
                                            <Form>
                                                <Row className="g-2">
                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="oldpasswordInput" className="form-label">Old
                                                                Password*</Label>
                                                            <Input type="password" className="form-control"
                                                                id="oldPassword"
                                                                placeholder="Enter current password" 
                                                                onChange={handleInputPasswordChange}
                                                                />
                                                        </div>
                                                    </Col>

                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="newpasswordInput" className="form-label">New
                                                                Password*</Label>
                                                            <Input type="password" className="form-control"
                                                                id="newPassword" 
                                                                placeholder="Enter new password"
                                                                onChange={handleInputPasswordChange}
                                                                 />
                                                        </div>
                                                    </Col>

                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="confirmpasswordInput" className="form-label">Confirm
                                                                Password*</Label>
                                                            <Input type="password" className="form-control"
                                                                id="confirmPassword"
                                                                placeholder="Confirm password"
                                                                onChange={handleInputPasswordChange}
                                                               />
                                                                  
                                                        </div>
                                                    </Col>
                                                    <Col lg={12}>
                                                      
                                                </Col>
                                                    <Col lg={12}>
                                                            <Button className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250 w-150px" type="button" onClick={validatePasswords}>
                                                                {loading ? <Spinner size="sm" />   : "Update"}
                                                            </Button>
                                                </Col>

                                             

                                                </Row>

                                            </Form>
                                            
                                        </TabPane>

                                        <TabPane tabId="3">
                                            <form>
                                                <div id="newlink">
                                                    <div id="1">
                                                        <Row>
                                                            <Col lg={6}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="payment_wallet_address" className="form-label">Security</Label>
                                                                    
                                                                    <Input type="text" className="form-control" id="payment_wallet_addressInput" name="payment_wallet_address" 
                                                                placeholder="nter your firstname" Value={user.payment_wallet_address}  onChange={handleInputChange} />
                                                                </div>
                                                            </Col>

                                                            <Col lg={6}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="payment_current_password" className="form-label">Payment Current Password</Label>
                                                                    <Input type="text" className="form-control"
                                                                        id="payment_current_password" placeholder=""
                                                                        name="payment_current_password"
                                                                        Value={user.payment_current_password}  onChange={handleInputChange}  /> 
                                                                </div>
                                                            </Col>

                                                            <Col lg={6}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="withdrawal_wallet_address" className="form-label">Withdrawal Wallet Address</Label>
                                                                    <Input type="text" className="form-control"
                                                                        id="withdrawal_wallet_address" placeholder=""
                                                                        name="withdrawal_wallet_address"
                                                                        Value={user.withdrawal_wallet_address}  onChange={handleInputChange}  /> 
                                                                </div>
                                                            </Col>

                                                            <Col lg={6}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="withdrawal_current_password" className="form-label">Withdrawal Current Password</Label>
                                                                    <Input type="text" className="form-control"
                                                                        id="withdrawal_current_password" placeholder=""
                                                                        name="withdrawal_current_password"
                                                                        Value={user.withdrawal_current_password}  onChange={handleInputChange}  /> 
                                                                </div>
                                                            </Col>
                                                            <Col lg={6}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="coinbase_wallet" className="form-label">Coinbase Wallet</Label>
                                                                    <Input type="text" className="form-control"
                                                                        id="coinbase_wallet" placeholder=""
                                                                        name="coinbase_wallet"
                                                                        Value={user.coinbase_wallet}  onChange={handleInputChange}  /> 
                                                                </div>
                                                            </Col>


                                                        </Row>
                                                    </div>
                                                </div>
                                                <div id="newForm" style={{ "display": "none" }}>
                                                </div>

                                                <Col lg={12}>
                                                            <Button className="btn btn-primary w-150px" type="button" onClick={updateProfile}>
                                                                {loading ? <Spinner size="sm" />   : "Update"}
                                                            </Button>
                                                </Col>
                                            </form>
                                        </TabPane>

                                        <TabPane tabId="4">
  
                                        <div className="mb-4 pb-2">

                                                <div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
                                                    <div className="flex-grow-1">
                                                        <h6 className="fs-15 mb-1">Google Authentication</h6>
                                                        <p className="text-muted">Google authentication is an advanced security feature that will be utilized for identity verification during login, withdrawals, and transfers.</p>
                                                    </div>
                                                    <div className="flex-shrink-0 ms-sm-3">
                                                    {/* {google_authenticator  === "1"  ? (
                                                        <Button color="danger" onClick={handleDisableG2a}>
                                                            Disable
                                                        </Button>
                                                    ) : (
                                                    <Button color="primary" onClick={handleModalSubmit}>
                                                        Enable
                                                    </Button>
                                                    )} */}
                                                    </div>
                                                </div>
                                         
                                               
                                            </div>

                                            <div className="mb-3 hide">
                                                <h5 className="card-title text-decoration-underline mb-3">Application Notifications:</h5>
                                                <ul className="list-unstyled mb-0">
                                                    <li className="d-flex mt-2">
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                              
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className="d-flex mt-2">
                                                        <div className="flex-grow-1">
                                                            <Label className="form-check-label fs-14"
                                                                htmlFor="emailNotification">
                                                                Show email notifications
                                                            </Label>
                                                            <p className="text-muted"> Received email updates on any transaction movements of your account. </p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                            <Input type="text" className="form-control"
                                                                        id="email_notification" placeholder=""
                                                                        name="email_notification"
                                                                        Value={user.email_notification}  onChange={handleInputChange}  /> 
                                                            <Input type="checkbox" className="form-control"
                                                                        id="email_notification_check" placeholder=""
                                                                        name="email_notification_check"
                                                                        checked={user.email_notification} /> 
                                                            </div>
                                                        </div>
                                                    </li>
                                                   
                                                    <li className="d-flex mt-2">
                                                        <div className="flex-grow-1">
                                                            <Label className="form-check-label fs-14"
                                                                htmlFor="purchaesNotification">
                                                                Show commission notifications
                                                            </Label>
                                                            <p className="text-muted">Get real-time commission alerts from your downlines purchases.</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                            <Input type="text" className="form-control"
                                                                        id="comm_notification" placeholder=""
                                                                        name="comm_notification"
                                                                        Value={user.comm_notification}  onChange={handleInputChange}  /> 
                                                            </div>
                                                         
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                              
                                        </TabPane>

                                    </TabContent>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>


                    <Modal isOpen={googleauthmodal} toggle={togglegoogleauthModal} centered>
                        <ModalHeader toggle={togglegoogleauthModal}>Set Up Google Authentication</ModalHeader>
                        <ModalBody>
                            <p>Scan the QR code using Google Authenticator.</p>
                            <img src={google_qrcodeurl} alt="QR Code" className="w-100" />
                            <Label>Enter Google 2FA Code</Label>
                            <Input type="text" value={g2facode} onChange={(e) => setG2facode(e.target.value)} />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={handle2Gaconfirm}>Confirm</Button>
                        </ModalFooter>
                    </Modal>

                </Container>
             )}  
            </div>
        </React.Fragment>
        

    );
};

export default Settings;
