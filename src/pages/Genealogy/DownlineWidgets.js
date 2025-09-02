import React from 'react';
import CountUp from "react-countup";
import { Link } from 'react-router-dom';
import { Card, CardBody, Col } from 'reactstrap';
import { EarningWidgets } from "../../common/data";

const Widgets = ({ Userbalance }) => {
    return (
        <React.Fragment>
                <Col xl={3} md={6} >
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1 overflow-hidden">
                                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Total Downlines</p>
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
                                            end={Userbalance.total_downlines}
                                            decimals="0"
                                            duration="4"
                                        />
                                    </span></h4>
                                  
                                </div>
                                <div className="avatar-sm flex-shrink-0">
                                <span className={`avatar-title rounded fs-3 bg-success-subtle`}>
                                <i className={`text-success bx bx-user-circle`}></i>
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
          
        </React.Fragment>
    );
};

export default Widgets;