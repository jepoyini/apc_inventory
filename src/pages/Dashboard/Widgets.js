import React, { useState, useEffect  } from 'react';
import CountUp from "react-countup";
import { Link } from 'react-router-dom';
import { Card, CardBody, Col } from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Alert, Row } from 'reactstrap';

//Import Icons
import FeatherIcon from "feather-icons-react";

//import images
import illustarator from "../../assets/images/user-illustarator-2.png";


const Widgets = ({ Userbalance })  => {


    return (
        <React.Fragment>
            <Row>
                <Col xl={3} md={4} >
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Total Items</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <h5 className="fs-14 mb-0 text-muted" >
                                        </h5>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="">
                                            <CountUp
                                                start="0"
                                                prefix=""
                                                suffix=""
                                                separator=""
                                                end={Userbalance.total_personaly_sponsored}
                                                decimals="0"
                                                duration="4"
                                            />
                                        </span></h4>

                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                    <span className={`avatar-title rounded fs-3 bg-primary-subtle`}>
                                    <i className={`text-primary bx ri-box-3-line`}></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                </Col>  

                <Col xl={3} md={4} >
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <p className="text-uppercase fw-medium text-muted text-truncate mb-0">In Transit</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <h5 className="fs-14 mb-0 text-muted" >
                                        </h5>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="">
                                            <CountUp
                                                start="0"
                                                prefix=""
                                                suffix=""
                                                separator=""
                                                end={Userbalance.total_earnings}
                                                decimals="0"
                                                duration="4"
                                            />
                                        </span></h4>

                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                    <span className={`avatar-title rounded fs-3 bg-primary-subtle`}>
                                    <i className={`text-primary bx ri-truck-line`}></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                </Col> 

                <Col xl={3} md={4} >
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Total Received</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <h5 className="fs-14 mb-0 text-muted" >
                                           
                                        </h5>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="">
                                            <CountUp
                                                start="0"
                                                prefix=""
                                                suffix=""
                                                separator=""
                                                end={Userbalance.expense_wallet}
                                                decimals="0"
                                                duration="4"
                                            />
                                        </span></h4>
                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                    <span className={`avatar-title rounded fs-3 bg-primary-subtle`}>
                                    <i className={`text-primary bx ri-inbox-archive-line`}></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                </Col>    

                <Col xl={3} md={4} >
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Low Stock</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <h5 className="fs-14 mb-0 text-muted" >
                                        </h5>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="">
                                            <CountUp
                                                start="0"
                                                prefix=""
                                                suffix=""
                                                separator=""
                                                end={Userbalance.reward_wallet}
                                                decimals="0"
                                                duration="4"
                                            />
                                        </span></h4>
                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                    <span className={`avatar-title rounded fs-3 bg-primary-subtle`}>
                                    <i className={`text-primary bx ri-error-warning-line`}></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                </Col>   
            </Row>
        </React.Fragment>
    );
};

export default Widgets;