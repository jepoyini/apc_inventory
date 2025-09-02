


import React, { useState, useEffect  } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,  FormGroup,Spinner, Card, Button,CardBody, CardHeader, Col, Container, Form, Input, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane,Table } from 'reactstrap';

import classnames from "classnames";
import Flatpickr from "react-flatpickr";
import axios from 'axios';
//import images
import progileBg from '../../assets/images/profile-bg.jpg';
// Import Content
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.min.css';
import avatar from "../../assets/images/users/user-dummy-img.jpg";
const Settings = () => {
    const [userInfo, setUserInfo] = useState({
        avatar: avatar, // Placeholder avatar
        userName: "Admin",
        email: "admin@example.com",
        idx: "12345",
        replink: "https://ibopro.com/admin",
        sponsor: "John Doe",
        date_joined: "2025-03-15",
        status: "Active",
      });
  const [userName, setUserName] = useState("Admin");
  const [email, setemail] = useState("admin@gmail.com");
  const [idx, setidx] = useState("1");
    const [loading, setLoading] = useState(false);
    // Custom Modals Example
    const [modal_successMessage, setmodal_successMessage] = useState(false);
    function tog_successMessage() {
        setmodal_successMessage(!modal_successMessage);
    }
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
      
    const [google_key, setGooglekey] = useState(''); 
    const [google_qrcodeurl, setGoogleqrcodeurl] = useState(''); 
    const [google_authenticator, setGoogleAuthenticator] = useState(''); 
    
    const [g2facode, setG2facode] = useState('');
    const [googleauthmodal, setGoogleauthmodal] = useState(false);
    const [user, setUser] = useState({
        id: "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        zip: "",
        username: "",
        avatar: "",
        date_created: "",
        sponsor_id: "",
        sponsor_name: "",
        status: "",
        replicated_link: "",
        payment_wallet_address: "",
        payment_current_password: "",
        withdrawal_wallet_address: "",
        withdrawal_current_password: "",
        coinbase_wallet: "",
        enable_2fa: "",
        email_notification: "",
        comm_notification: "",
        deleted: "",
        pwd: "",
        newpwd:"",
        csrf_token: "",
        verified: ""
    });

    async function GetData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const csrf_token = obj.csrf_token;
        const formData = new FormData();
        formData.append("uid", uid);
        formData.append("csrf_token", obj.csrf_token);        
        
        const response =  await axios.post('/getuser.php', formData);
        if (response.status === "success")
        {
            if (response.data) {
                const obj = response.data;
                setUser({
                    id: obj.id || "",
                    firstname: obj.firstname || "",
                    lastname: obj.lastname || "",
                    username: obj.username || "",
                    email: obj.email || "",
                    phone: obj.phone || "",
                    address: obj.address || "",
                    city: obj.city || "",
                    country: obj.country || "",
                    zip: obj.zip || "",
                    avatar: obj.avatar,
                    date_created: obj.date_created,
                    sponsor_id: obj.sponsor_id,
                    sponsor_name: obj.sponsor_name,
                    status: obj.status,
                    replicated_link: obj.replicated_link,
                    payment_wallet_address: obj.payment_wallet_address,
                    payment_current_password: obj.payment_current_password,
                    withdrawal_wallet_address: obj.withdrawal_wallet_address,
                    withdrawal_current_password: obj.withdrawal_current_password,
                    coinbase_wallet: obj.coinbase_wallet,
                    enable_2fa: obj.enable_2fa,
                    email_notification: obj.email_notification,
                    comm_notification: obj.comm_notification,
                    deleted: obj.deleted,
                    pwd: "",
                    newpwd: "",
                    google_usersecret: obj.google_usersecret,
                    google_qrcodeurl: obj.google_qrcodeurl,
                    google_authenticator: obj.google_authenticator,
                    csrf_token: csrf_token,
                    verified: obj.verified
                });
                debugger; 
                setGooglekey(obj.google_usersecret);
                setGoogleqrcodeurl(obj.google_qrcodeurl);
                setGoogleAuthenticator(obj.google_authenticator);
             //  setAvatarPreview(`/images/users/${obj.avatar || "user-default.jpg"}`);
             setAvatarPreview(`/images/users/user-default.jpg`);
            }
        } else {
            window.location.href = "/login";
        };
    }

    useEffect(() => {
        GetData(); 
     }, []);

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

    const [avatarPreview, setAvatarPreview] = useState('');

    const updatePassword = async () => {
        try {
            
            const response = await axios.post('/changepass.php', user);
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
        try {
            console.log(user);
            const response = await axios.post('/update-profile.php', user);
            setLoading(false);

            if (response.success)
            {
                sessionStorage.setItem("authUser", JSON.stringify(user));
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

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload the file to the server
            const formData = new FormData();

            const prefixedFileName = `${user.id}_profile_${file.name}`; // Prefix the filename
            formData.append('avatar', file, prefixedFileName);

            try {
                const response = await axios.post('/upload-avatar.php', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.success) {
                    // Update avatar with the uploaded file URL
                    setUser((prevUser) => ({
                        ...prevUser,
                        avatar: prefixedFileName // Assuming server returns the file path
                    }));
                    // setAvatarPreview(`/images/users/${response.filePath}`);
                    console.log('Upload avatar to server successfull!');
                } else {
                    // Handle upload failure
                    console.error('Upload avatar failed');
                }
            } catch (error) {
                console.error('Error uploading avatar file', error);
            }
        }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;

        setUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUser(prevUser => ({
            ...prevUser,
            [name]: type === 'checkbox' ? checked : value
        }));
    };    

    const [activeTab, setActiveTab] = useState("1");

    const tabChange = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    const togglegoogleauthModal = () => {

        setGoogleauthmodal(!googleauthmodal);
      };
    
      
    const handle2Gaconfirm = async () => {
        try {
            debugger; 
            const url = "/verifyg2a.php";
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const uid = obj.id;      
            const data = { id:uid, otp_code: g2facode, csrf_token: obj.csrf_token };
            const response =  await axios.post(url, data);
            debugger; 
            if (response.success) {
                setGoogleAuthenticator('1');
                Swal.fire({
                    icon: 'success',
                    title: 'Successful!',
                    text: "Your Google Authentication is now setup.",
                    confirmButtonText: 'OK'
                });
                togglegoogleauthModal(); 
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonText: 'OK'
                });
            }
          } catch (error) {
            toast.error("Error encountered while getting authenticator qr code.");
          }

           
    };

    const handleModalSubmit = async () => {
        try {
            setG2facode("");
            const url = "/enableg2a.php";
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const uid = obj.id;      
            const data = { id:uid, csrf_token: obj.csrf_token };
            const response =  await axios.post(url, data);
            if (response.success) {
                setGooglekey(response.google_key);
                setGoogleqrcodeurl(response.google_qrcodeurl);
                togglegoogleauthModal(); 
            } else {
              toast.error("Error encountered while getting authenticator qr code.");
            }
          } catch (error) {
            toast.error("Error encountered while getting authenticator qr code.");
          }

           
    };
     
    const handleDisableG2a = async () => {
        Swal.fire({
            title: 'Are you sure you want to disable google authenticator?',
            text: "",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed!',
            cancelButtonText: 'No, cancel'
  
          }).then(async (result) =>  {
                if (result.isConfirmed) {
                    try {
                        debugger; 
                      const url = "/disableg2a.php";
                      const obj = JSON.parse(sessionStorage.getItem("authUser"));
                      const uid = obj.id;      
                      const data = { id:uid, csrf_token: obj.csrf_token };
                      const response =  await axios.post(url, data);
                      if (response.success) {
                        setGoogleAuthenticator('0');
                        toast.success(`Goggle Authenticator disabled successfully`);
                      } else {
                        toast.error("Error updating row.");
                      }
                    } catch (error) {
                      toast.error("Error updating row.");
                    }
          
                }
          });
    };

    const handleg2facodeChange = (e) => {
        setG2facode(g2facode);
    };   

    document.title = "Profile Settings | IBO Mastermind";

    return (
        <React.Fragment>
            <div className="page-content">
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
                                <Col md="4">
                                    <div className="d-flex">
                                    <div className="mx-3">
                                        <img
                                        src={userInfo.avatar}
                                        alt="User Avatar"
                                        className="avatar-md rounded-circle img-thumbnail"
                                        />
                                    </div>
                                    <div className="flex-grow-1 align-self-center">
                                    <div className="d-flex align-items-center">
                                        <span className="profile-name mb-0">
                                          {userInfo.userName}
                                        </span>
                                        <span className="badge bg-success ms-2">Active</span>
                                        </div>
                                        
                                        <p className="mb-1">
                                        <strong>Username:</strong> <span className="text-muted">{userInfo.userName}</span>
                                        
                                        </p>
                                        <p className="mb-0">
                                        <strong>User ID #:</strong> <span className="text-muted">{userInfo.idx}</span>
                                        </p>
                                    </div>
                                    </div>
                                </Col>

                                {/* Second Column - Replicated Link, Email, Sponsor */}
                                <Col md="4">
                                    <p className="mb-1">
                                    <strong>Replicated Link:</strong> <span className="text-muted" id="rep_link">{userInfo.replink}</span>{" "}
                                    <i
                                        className="far fa-copy copy-icon"
                                        title="Copy to clipboard"
                                        onClick={copyToClipboard}
                                        style={{ cursor: "pointer", marginLeft: "10px", color: "#007bff" }}
                                    ></i>
                                    </p>
                                    <p className="mb-1">
                                    <strong>Date Joined:</strong> <span className="text-muted">{userInfo.date_joined}</span>
                                    </p>
                                    <p className="mb-0">
                                    <strong>Sponsor:</strong> <span className="text-muted">{userInfo.sponsor}</span>
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
                                                            <Input type="text" className="form-control" id="countryInput"
                                                                placeholder="Country" 
                                                                name="country"
                                                                Value={user.country}  onChange={handleInputChange}  />
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
                                                        <div className="hstack gap-2 justify-content-end">

                                                            <Button className="btn btn-primary w-150px" type="button" onClick={updateProfile}>
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
                                                            <Button className="btn btn-primary w-150px" type="button" onClick={validatePasswords}>
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
                                                    {google_authenticator  === "1"  ? (
                                                        <Button color="danger" onClick={handleDisableG2a}>
                                                            Disable
                                                        </Button>
                                                    ) : (
                                                    <Button color="primary" onClick={handleModalSubmit}>
                                                        Enable
                                                    </Button>
                                                    )}
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
                </Container>


                <Modal isOpen={googleauthmodal} toggle={togglegoogleauthModal} centered>
                    <ModalHeader className="bg-light p-3" toggle={togglegoogleauthModal}>Set Up Google Authentication</ModalHeader>
                    <ModalBody>
                    <span>Download the free Google Authenticator app from the app store. In the app, select setup account. Choose, scan a barcode.</span>
                    <br></br>
                    <div className="m-40 text-center">
                        <img
                            src={google_qrcodeurl}
                            alt="Google Authenticator QR Code"
                        />
                    </div>
                    <div className="secret">
                        <div class="secret-label">Or enter your setup key manually :</div>
                        <div class="secret-key">{google_key}</div>
                    </div>

                    <br></br>
                    <FormGroup>
                        <Label for="transactionID">Enter Google 2FA Code</Label>
                        <Input
                        type="text"
                        id="g2facode"
                        value= {g2facode}
                        onChange={(e) => setG2facode(e.target.value)}
                        />
                    </FormGroup>

                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={handle2Gaconfirm}>Confirm</Button>{' '}
                    <Button color="secondary" onClick={togglegoogleauthModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>  

            </div>
        </React.Fragment>
    );
};

export default Settings;