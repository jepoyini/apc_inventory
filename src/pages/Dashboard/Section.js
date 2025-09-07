import React, { useEffect, useState } from 'react';
import { Alert,Col, Row } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
//Import Icons
import FeatherIcon from "feather-icons-react";
//import images
import illustarator from "../../assets/images/widget-img.png";

const Section = (props) => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/package');
    };

    const [userName, setUserName] = useState("");
    const [sponsor, setSponsor] = useState("");
    const [rank, setRank] = useState("");
    const [replicatedLink, setReplicatedLink] = useState("");
    const [greeting, setGreeting] = useState("");
    const [verified, setVerified] = useState(0);

    useEffect(() => {
        const getGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) {
                return "Good Morning";
            } else if (currentHour < 18) {
                return "Good Afternoon";
            } else {
                return "Good Evening";
            }
        };

        setGreeting(getGreeting());
        if (sessionStorage.getItem("authUser")) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            setUserName(obj.firstname + ' ' + obj.lastname);
            setSponsor(obj.sponsor_name)
            setReplicatedLink(obj.username);
            setRank(obj.rank)
            setVerified(obj.verified);
        }
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
    
    return (
        <React.Fragment>
            <Row className="mb-3 pb-1">
                <Col xl={8} md={8} >


                                <Row className="align-items-center"> {/* Change align-items-end to align-items-center */}
                                    <Col sm={12}>
                                        <div className="">
                                            <h2>Dashboard</h2>
                                            <p className=" mb-0">
                                                <div className="flex-grow-1 text-truncate">
                                                    <span className="fs-16 mb-1 fb"><b>{greeting}, {userName} </b></span> 
                                                </div>
                                            </p>
                                            <p className=" mb-0">
                                                <div className="flex-grow-1 text-truncate">
                                                    <span className="fs-16 mb-1 fb">Welcome to American Plaque Inventory Management System</span> 
                                                </div>
                                            </p>

                                           
                                         
                                         
                                            <p>
                                            {/* <div className="center-badge flex-shrink-0"> */}
                                                {/* <span className={`badge ${verified === '1' ? 'bg-success' : 'bg-danger'}`} style={{ marginRight: '10px' }}>
                                                    {verified === 1 ? 'Verified Member' : 'Not Verified'}
                                                </span> */}

                                                {/* Show "Verify your account" link only if NOT verified */}
                                                {/* {verified !== '1' && (
                                                    <Link to="/kycverification" className="alert-danger text-reset text-decoration-underline">
                                                        Verify your account
                                                    </Link>
                                                )} */}
                                            {/* </div> */}

                                            </p>
                                            {/* <div className="mt-5 center-badge ">
                                                <Link to="/travelvoucher" className="btn btn-secondary">Purchase Sharing-AI</Link>
                                            </div>      */}
                                        </div>
                                    </Col>
                                    
                                    <Col sm={4} className="d-flex justify-content-center align-items-center"> {/* Centers image vertically */}
                                        {/* <div className="px-3">
                                            <img src={illustarator} className="img-fluid illustarator-img" alt="" />
                                        </div> */}
                                    </Col>
                                </Row>

                </Col>

                
            </Row>


        </React.Fragment>
    );
};

export default Section;
