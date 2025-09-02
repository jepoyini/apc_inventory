import React from 'react';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
// import Vector from './VectorMap';
import { VectorMap } from '@south-paw/react-vector-maps'
import world from '../../common/world.svg.json';

const SalesByLocations =  ({ Userbalance })  => {
    return (
        <React.Fragment>
            <Col xl={4}>
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Account Overview</h4>
                        <div className="flex-shrink-0">
                        </div>
                    </CardHeader>

                    <CardBody>

                        <div className="px-2 py-2 mt-1">
                            <p className="mt-3 mb-1">Today Earnings<span className="float-end">{Userbalance.todays_earnings}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>
                            <p className="mt-3 mb-1">Total Earnings <span className="float-end">{Userbalance.total_earnings}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>
                            <p className="mt-3 mb-1">Onhold Earnings <span className="float-end">{Userbalance.onhold_earnings}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>
                            <p className="mt-3 mb-1">Wallet Balance <span className="float-end">{Userbalance.wallet_balance}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>
                            <p className="mt-3 mb-1">Available to Withdraw <span className="float-end">{Userbalance.total_withdrawed}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>                            
                            <p className="mt-3 mb-1">Total Coded Downlines <span className="float-end">{Userbalance.coded_downlines}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>
                            <p className="mt-3 mb-1">Total Plan Purchased <span className="float-end">{Userbalance.purchased_plans}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mt-3 mb-1">Total Downline Members <span className="float-end">{Userbalance.total_downline_members}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mt-3 mb-1">Total Personally Sponsored:<span className="float-end">{Userbalance.total_personaly_sponsored}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                        </div>

                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default SalesByLocations;