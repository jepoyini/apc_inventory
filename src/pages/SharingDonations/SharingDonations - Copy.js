import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Container, CardHeader,
  Row, ListGroup, ListGroupItem, Modal, ModalBody
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const PurchaseForm = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  document.title = "Purchase | SHARING University Donation";
  const [pageloading, setPageLoading] = useState(true);
  const api = new APIClient();

  const [purchasedPlans, setPurchasedPlans] = useState([]);
  const [modal_successMessage, setModalSuccessMessage] = useState(false);
  const tog_successMessage = () => setModalSuccessMessage(!modal_successMessage);
  
  const getStartingAmount = () => {
    switch (type) {
      case 'university': return 50;
      case 'financial': return 500;
      case 'studio':
      default: return 5;
    }
  };

  useEffect(() => {
    const fetchPurchasedPlans = async () => {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      
      setPageLoading(true);
      const response = await api.post("/getpurchasedplans", { uid: obj.id });
      setPageLoading(false);

      if (response.success) {
        const filtered = response.data
          .filter(p => p.plan_type === type)
          .map(p => Number(p.level))
          .sort((a, b) => a - b);
        setPurchasedPlans(filtered);
      }
    };
    
    fetchPurchasedPlans();
  }, [type]);

  useEffect(() => {
    if (!modal_successMessage) {
      document.body.style.overflow = 'auto';
    }
  }, [modal_successMessage]);

  const startingAmount = getStartingAmount();

  const pricingData = Array.from({ length: 11 }, (_, i) => {
    const level = i + 1;
    const priceValue = startingAmount * Math.pow(2, i);
    const rewardCap = priceValue;
    const expenseCap = priceValue * Math.pow(5, level);
    
    const isAvailable = level === 1 ? true : 
                       purchasedPlans.includes(level - 1) && !purchasedPlans.includes(level);
    
    return {
      plan_id: level,
      title: `Level ${level}`,
      price: `$${priceValue}`,
      description: `$${priceValue} Sharing ${type?.charAt(0).toUpperCase() + type?.slice(1) || 'University'} Donation`,
      features: level <= 5 ? [
        `Reward Points Cap will raise $${rewardCap} per month`,
        `Expense Account Cap will raise $${expenseCap}`
      ] : [
        "Profit Sharing Level"
      ],
      popular: level === 0,
      alreadyPurchased: purchasedPlans.includes(level),
      available: isAvailable ? 1 : 0
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
      const payload = { uid: obj.id, amount, plan_id: plan_id, plan_type: type };

      Swal.fire({
        title: 'Please wait...',
        text: 'We are processing your purchase. This may take a moment.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await api.post("/purchaseitem", payload);
      Swal.close();

      if (response.success) {
        setPurchasedPlans(prev => [...prev, plan_id].sort((a, b) => a - b));
        tog_successMessage();
      } else {
        Swal.fire({
          icon: "error",
          title: "Purchase Failed",
          text: response.message,
          confirmButtonText: "OK"
        });      
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error.message || "An error occurred during the purchase!",
        confirmButtonText: "OK"
      });
    }
  };

  const PricingCard = ({ plan_id, title, price, description, features, popular, alreadyPurchased, available }) => {
    const isAvailable = available === 1;
    const isDisabled = alreadyPurchased || !isAvailable;
    const buttonLabel = alreadyPurchased ? 'Already Purchased' : 
                       isAvailable ? 'Purchase Now' : 
                       purchasedPlans.includes(plan_id - 1) ? 'Complete Previous Level First' : 'Unavailable';
  
    return (
      <Card className="pricing-box ribbon-box right">
        {popular && <div className="ribbon-two ribbon-two-danger"><span>Popular</span></div>}
        {alreadyPurchased && <div className="ribbon-two ribbon-two-danger"><span>Purchased</span></div>}
  
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
  
          {features.length > 0 && (
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
          )}
  
          <div className="mt-4">
            <button
              className={`btn  waves-effect waves-light material-shadow-none w-100 mw-250 ${
                alreadyPurchased ? 'btn-soft-warning' : 
                isAvailable ? 'btn-soft-warning' : ''
              }`}
              onClick={() => handlePurchase(plan_id, title, price.split('$')[1])}
              disabled={isDisabled}
            >
              {buttonLabel}
            </button>
          </div>
        </CardBody>
      </Card>
    );
  };

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

  const openInviteFriendsDialog = () => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const referralLink = `https://ibopro.com/${obj.username}`;
  
    Swal.fire({
      title: 'Invite a Friend to Join APC Inventory',
      html: `
        <div class="container-fluid px-0" style="text-align: left; width: 100%;">
          <div class="row mb-3">
            <div class="col-12">
              <label for="invite_name" class="form-label fw-semibold">Friend's Name</label>
              <input type="text" id="invite_name" class="form-control" placeholder="Enter your friend's full name">
            </div>
          </div>
  
          <div class="row mb-3">
            <div class="col-12">
              <label for="invite_email" class="form-label fw-semibold">Friend's Email</label>
              <input type="email" id="invite_email" class="form-control" placeholder="Enter their email address">
            </div>
          </div>
  
          <div class="row">
            <div class="col-12">
              <label for="referral_link" class="form-label fw-semibold">Your Referral Link</label>
              <input type="text" id="referral_link" class="form-control" value="${referralLink}" readonly>
            </div>
          </div>
  
          <div id="invite_success" class="text-success mt-3 fw-semibold" style="display:none;">
            ✅ Invitation sent successfully!
          </div>
        </div>
      `,
      confirmButtonText: '<span id="sendText">Send Invitation</span>',
      showCancelButton: true,
      focusConfirm: false,
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-secondary ms-2'
      },
      buttonsStyling: false,
  
      didOpen: () => {
        Swal.getPopup().addEventListener('input', () => {
          Swal.resetValidationMessage();
        });
      },
  
      preConfirm: async () => {
        const nameInput = document.getElementById('invite_name');
        const emailInput = document.getElementById('invite_email');
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
  
        if (!name || !email) {
          Swal.showValidationMessage('Please enter both the name and email address.');
          return false;
        }
  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Please enter a valid email address.');
          return false;
        }
  
        const confirmBtn = Swal.getConfirmButton();
        const sendText = document.getElementById('sendText');
        confirmBtn.disabled = true;
        sendText.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...';
  
        const payload = {
          uid: obj.id,
          from_name: obj.firstname + ' ' + obj.lastname,
          from_email: obj.email,
          to_name: name,
          to_email: email,
          referral_link: referralLink
        };
  
        try {
          const response = await api.post('/sendinvite', payload);
  
          confirmBtn.disabled = false;
          sendText.innerHTML = 'Send Invitation';
  
          if (response.status === 'success') {
            const successMsg = document.getElementById('invite_success');
            if (successMsg) {
              successMsg.style.display = 'block';
            }
  
            nameInput.value = '';
            emailInput.value = '';
  
            setTimeout(() => {
              if (successMsg) successMsg.style.display = 'none';
              nameInput.focus();
            }, 2500);
          } else {
            Swal.showValidationMessage(response.message || 'An error occurred while sending the invitation.');
          }
        } catch (err) {
          confirmBtn.disabled = false;
          sendText.innerHTML = 'Send Invitation';
          Swal.showValidationMessage(err.message || 'A network error occurred.');
        }
  
        return false;
      }
    });
  };

  return (
    <React.Fragment>
 
      {pageloading ? (
        <Container>
          <Row>
            <div id="status">
              <div className="spinner-border text-primary avatar-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Row>
        </Container>
      ) : (  
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title={`SHARING ${type?.charAt(0).toUpperCase() + type?.slice(1) || 'University'} Donation`} pageTitle="Dashboard" url="/dashboard/home" />

            <Row>
              <Col lg={12}>
                <Row className="justify-content-center mt-5">
                  <Col lg={10}>
                    <div className="text-center mb-4 pb-2">
                      <h4 className="fw-semibold fs-23">Choose the SHARING {type?.charAt(0).toUpperCase() + type?.slice(1) || 'University'} Donation level that you want to avail</h4>
                      <p className="text-muted mb-4 fs-15">Select a package to grow your network</p>
                    </div>
                  </Col>
                </Row>

                <Row className="justify-content-center">
                  <Col xl={12}>
                    <Row>
                      {pricingData.map((pricing, index) => (
                        <Col lg={3} key={index}>
                          <PricingCard {...pricing} />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>

                <Row className="justify-content-center mt-5 hide">
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

          <Modal id="success-Payment" tabIndex="-1" isOpen={modal_successMessage} toggle={() => { tog_successMessage(); }} centered>
            <ModalBody className='text-center p-5'>
              <div className="text-end">
                <button
                  type="button"
                  onClick={() => { tog_successMessage(); }}
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
                  Your SHARING Donation has been successfully processed. This unlocks exclusive features and exciting earning opportunities through your referral network.
                </p>

                <div className="hstack gap-2 justify-content-center">
                  <button
                    className="btn btn-outline-warning"
                    style={{fontSize:"12px"}}
                    onClick={() => {
                      tog_successMessage();
                    }}
                  >
                    Purchase Again
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/referrals")}
                    style={{fontSize:"12px"}}
                  >
                    View My Referrals
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/orderhistory")}
                    style={{fontSize:"12px"}}
                  >
                    Order History
                  </button>
                </div>
              </div>
            </ModalBody>

            <div className="modal-footer bg-light p-3 justify-content-center">
              <p className="mb-0 text-muted">
                Want to earn more?{" "}
                <span onClick={openInviteFriendsDialog} style={{ cursor: 'pointer' }} className="link-secondary fw-semibold">
                  Invite Friends
                </span>
              </p>
            </div>
          </Modal>
        </div>
      )}  
    </React.Fragment>
  );
};

export default PurchaseForm;