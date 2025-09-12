import React, { useState } from 'react';
import {
  Card, CardBody, Col, Container, CardHeader,
  Row, ListGroup, ListGroupItem, Modal, ModalBody
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const PurchaseForm = () => {
  const navigate = useNavigate();
  document.title = "Purchase | SHARING University Donation";
  const api = new APIClient();

  const [modal_successMessage, setModalSuccessMessage] = useState(false);
  const tog_successMessage = () => setModalSuccessMessage(!modal_successMessage);

  const pricingData = Array.from({ length: 11 }, (_, i) => {
    const level = i + 1;
    const priceValue = 5 * Math.pow(2, i);
    const rewardCap = level * 5;
    const expenseCap = level * 25;

    return {
      plan_id: level,
      title: `Level ${level}`,
      price: `$${priceValue}`,
      description: `$${priceValue} Sharing University Donation`,
      features: [
        `Reward Points Cap will raise $${rewardCap} per month`,
        `Expense Account Cap will raise $${expenseCap}`
      ],
      popular: level === 2
    };
  });

  const howItWorks = [
    { step: 1, title: "Purchase a Matrix", description: "Choose between the Basic ($25) or Premium ($100) matrix options." },
    { step: 2, title: "Refer Others", description: "Share your referral link with others to join your network." },
    { step: 3, title: "Build Your Network", description: "As your 1x5 matrix fills, your earnings potential increases." },
    { step: 4, title: "Earn Commissions", description: "Receive commissions from your direct referrals and network growth." }
  ];

  const benefits = [
    { title: "Unlimited Earning Potential", description: "Your income grows as your network expands with no ceiling." },
    { title: "Simple Structure", description: "Easy-to-understand 1x5 matrix with clear visualization." },
    { title: "Reliable Payouts", description: "Regular commission payments directly to your account." },
    { title: "Detailed Analytics", description: "Track your performance and network growth in real-time." }
  ];

  const handlePurchase = async (plan_id, title, amount) => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const payload = { uid: obj.id, amount, title, plan_id };

      Swal.fire({
        title: 'Please wait...',
        text: 'We are processing your purchase. This may take a moment.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await api.post("/purchaseitem", payload);
      Swal.close();
      tog_successMessage();
      return response.success;
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "An error occurred during the purchase!",
        confirmButtonText: "OK"
      });
      return false;
    }
  };

  const PricingCard = ({ plan_id, title, price, description, features, popular }) => (
    <Card className="pricing-box ribbon-box right">
      {popular && <div className="ribbon-two ribbon-two-danger"><span>Popular</span></div>}
      <CardBody className="p-4 m-2">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h5 className="mb-1 fw-semibold">{title}</h5>
            <p className="text-muted mb-0">{description}</p>
          </div>
          <div className="avatar-sm">
            <div className="avatar-title bg-light rounded-circle text-primary">
              <i className="fs-20 ri-book-mark-line"></i>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h2>
            <sup><small>$</small></sup>
            {price.split('$')[1]}
            <span className="fs-13 text-muted"> per donation</span>
          </h2>
        </div>

        <hr className="my-4 text-muted" />

        <ul className="list-unstyled text-muted vstack gap-3">
          {features.map((feature, index) => (
            <li key={index}>
              <div className="d-flex">
                <div className="flex-shrink-0 text-success me-1">
                  <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                </div>
                <div className="flex-grow-1">{feature}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <button
            className="btn btn-soft-primary w-100"
            onClick={() => handlePurchase(plan_id, title, price.split('$')[1])}
          >
            Purchase Now
          </button>
        </div>
      </CardBody>
    </Card>
  );

  const StepItem = ({ step, title, description }) => (
    <ListGroupItem className="d-flex">
      <div className="me-3">{step}.</div>
      <div>
        {title}<br />
        <small className="text-muted">{description}</small>
      </div>
    </ListGroupItem>
  );

  const BenefitItem = ({ title, description }) => (
    <ListGroupItem className="d-flex">
      <i className="mdi mdi-check-bold align-middle lh-1 me-2"></i>
      <div>
        {title}<br />
        <small className="text-muted">{description}</small>
      </div>
    </ListGroupItem>
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="SHARING University Donation" pageTitle="Dashboard" url="/dashboard/home" />

          <Row>
            <Col lg={12}>
              <Row className="justify-content-center mt-5">
                <Col lg={8}>
                  <div className="text-center mb-4 pb-2">
                    <h4 className="fw-semibold fs-23">Choose the SHARING University Donation level that you want to avail</h4>
                    <p className="text-muted mb-4 fs-15">Select a package to grow your network</p>
                  </div>
                </Col>
              </Row>

              <Row className="justify-content-center">
                <Col xl={11}>
                  <Row>
                    {pricingData.map((pricing, index) => (
                      <Col lg={3} key={index}>
                        <PricingCard {...pricing} />
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>

              <Row className="justify-content-center mt-5">
                <Col lg={5}>
                  <Card>
                    <CardHeader className="align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">How it works</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-muted">Understanding the matrix pay system.</p>
                      <ListGroup>
                        {howItWorks.map((item, index) => (
                          <StepItem key={index} {...item} />
                        ))}
                      </ListGroup>
                    </CardBody>
                  </Card>
                </Col>

                <Col lg={5}>
                  <Card>
                    <CardHeader className="align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">Benefits</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-muted">Why join our matrix program.</p>
                      <ListGroup>
                        {benefits.map((benefit, index) => (
                          <BenefitItem key={index} {...benefit} />
                        ))}
                      </ListGroup>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>

        <Modal id="success-Payment" tabIndex="-1" isOpen={modal_successMessage} toggle={tog_successMessage} centered>
          <ModalBody className='text-center p-5'>
            <div className="text-end">
              <button
                type="button"
                onClick={tog_successMessage}
                className="btn-close text-end"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="mt-2">
              <lord-icon
                src="https://cdn.lordicon.com/tqywkdcz.json"
                trigger="loop"
                delay="1000"
                colors="primary:#0ab39c,secondary:#405189"
                style={{ width: "150px", height: "150px" }}
              ></lord-icon>

              <h4 className="mb-3 mt-4">Thank You for Your Purchase!</h4>
              <p className="text-muted fs-15 mb-4">
                You've successfully activated your Unilevel plan product. Your purchase not only gives you access to exclusive features, it also unlocks exciting earning opportunities through your referral network.
              </p>

              <div className="hstack gap-2 justify-content-center">
                <button
                  className="btn btn-outline-warning"
                  style={{ fontSize: "12px" }}
                  onClick={() => {
                    tog_successMessage();
                    navigate("/purchase");
                  }}
                >
                  Purchase Again
                </button>
                <button className="btn btn-primary" onClick={() => navigate("/referrals")} style={{ fontSize: "12px" }}>
                  View My Referrals
                </button>
                <button className="btn btn-primary" onClick={() => navigate("/orderhistory")} style={{ fontSize: "12px" }}>
                  Order History
                </button>
              </div>
            </div>
          </ModalBody>
          <div className="modal-footer bg-light p-3 justify-content-center">
            <p className="mb-0 text-muted">
              Want to earn more?{' '}
              <span onClick={() => {}} style={{ cursor: 'pointer' }} className="link-secondary fw-semibold">
                Invite Friends
              </span>
            </p>
          </div>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default PurchaseForm;