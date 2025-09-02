import React, { useState, useEffect  } from "react"; 
import { Card, CardBody, Col, Row } from 'reactstrap';
import CountUp from "react-countup";
import axios from 'axios';
import FeatherIcon from "feather-icons-react";
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,  
    Table,
    Button
  } from "reactstrap";

const Widget = ({ Maindata }) => {
    const [userscount, setUserscount] = useState(0);

    const [ApprovallogsModal, setApprovalLogsModal] = useState(false);
    const [ApprovallogsData, setApprovalLogsData] = useState([]);

    const handleApprovalLinkClick = async (e) => {
        e.preventDefault(); // Prevent the default Link behavior
        await fetchUSDTApprovalLogs();
    };

      const fetchUSDTApprovalLogs = async () => {
      try {
        debugger; 
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const url = "/getusdtapprovallogs.php";
        const data = { csrf_token: obj.csrf_token, uid: obj.id };
        const response = await axios.post(url, data);
        if (response.rows) {
          setApprovalLogsData(response.rows);
          setApprovalLogsModal(true); // Show the modal after fetching data
        } else {
          toast.error("Error fetching logs");
        }
      } catch (error) {
        toast.error("Error fetching logs");
      }
    };


    return (
        <React.Fragment>
            <Row>

                {/* Total Expense Account Balance */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Expense Account Balance</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_wallet_balance}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/alltransactions" className="text-decoration-underline text-muted">View Records</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                             <FeatherIcon
                                                icon="dollar-sign"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                {/* Deposits Today */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Deposits Today</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.today_deposits}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/managedeposits" className="text-decoration-underline text-muted">View All Deposits</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="dollar-sign"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                {/* Total Deposits */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Deposits</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_deposits}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/managedeposits" className="text-decoration-underline text-muted">View All Deposits</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="dollar-sign"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
             </Row>

            <Row>
                {/* Total Purchases */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Donations</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_donations}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/alltransactions" className="text-decoration-underline text-muted">View Records</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="shopping-cart"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Total Commissions Given */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Commissions Given</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_commissions}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/alltransactions" className="text-decoration-underline text-muted">View Records</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="user-plus"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/*  Total Rewards */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Rewards</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_rewards}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/alltransactions" className="text-decoration-underline text-muted">View Records</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="gift"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>


            <Row>

                {/* Total Withdrawn */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Withdrawn</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_withdrawn}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/alltransactions" className="text-decoration-underline text-muted">View Records</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="arrow-down-circle"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Pending Withdrawals */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Pending Withdrawals</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                 start={0}
                                                end={Maindata.pending_withdrawal}
                                                decimals={2}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">

                                        <a href="#" onClick={handleApprovalLinkClick} className="text-decoration-underline text-muted">
                                            View Records
                                        </a>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="arrow-down-circle"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Total Users */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Users</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_users}
                                                decimals={0}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/manageusers" className="text-decoration-underline text-muted">View All Users</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="users"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Total Holding */}
                <Col md={4}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-medium text-muted mb-0">Total Holding</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={Maindata.total_holding}
                                                decimals={0}
                                                duration={4}
                                            />
                                            </span></h2>
                                    <p className="mb-0 text-muted">
                                        <Link to="/manageusers" className="text-decoration-underline text-muted">View All Users</Link>
                                   </p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="users"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>                
            </Row>
 
            <Modal className="mw-1650" isOpen={ApprovallogsModal} toggle={() => setApprovalLogsModal(false)} centered>
                        <ModalHeader className="bg-light p-3 mw-1650" toggle={() => setApprovalLogsModal(false)}>
                          USDT Approval Logs
                        </ModalHeader>
                        <ModalBody className="mw-1650" >
                          <Table bordered>
                            <thead>
                              <tr>
                              <th>ID</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Withdrawal ID</th>
                                <th>Amount</th>
                                <th>Running Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ApprovallogsData.map((log, index) => (
                                <tr key={index}>
                                  <td>{log.id}</td>
                                  <td>{log.date_created}</td>
                                  <td>{log.type}</td>
                                  <td>{log.withdrawal_id}</td>
                                  <td>{log.amount}</td>
                                  <td>{log.running_total}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="secondary" onClick={() => setApprovalLogsModal(false)}>
                            Close
                          </Button>
                        </ModalFooter>
            </Modal>


        </React.Fragment>
    );
};

export default Widget;