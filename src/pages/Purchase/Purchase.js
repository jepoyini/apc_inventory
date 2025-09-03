import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, CardHeader, Row, ListGroup, ListGroupItem,Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import PreviewCardHeader from '../../Components/Common/PreviewCardHeader';
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { Title } from 'chart.js';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const PurchaseForm = () => {
  const navigate = useNavigate();
  document.title = "Purchase | APC Inventory";
  const api = new APIClient();

  const [modal_successMessage, setModalSuccessMessage] = useState(false);
  const tog_successMessage = () => {
    setModalSuccessMessage(!modal_successMessage);
  };

  // Pricing data
  const pricingData = [
    {
      title: "Basic Donation",
      price: "$25",
      description: "$25 Startup Donation",
      features: [
        "Entry into the 1x5 Basic Matrix",
        "Standard commission earnings",
        "Basic referral tracking",
        "Standard email support",
        "Can upgrade to higher matrix levels manually",
        "Exclusive Bonuses"
      ],
      popular: false
    },
    {
      title: "Level-up Donation",
      price: "$100",
      description: "$100 Advance Donation",
      features: [
        "Entry into the 1x5 Premium Matrix (priority placement)",
        "Higher commission rates & bonuses",
        "Priority placement for faster network growth",
        "Priority support (faster response time)",
        "Automatic eligibility for premium benefits",
        "Exclusive access to webinars, training, or VIP content"
      ],
      popular: true
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Purchase a Matrix",
      description: "Choose between the Basic ($25) or Premium ($100) matrix options."
    },
    {
      step: 2,
      title: "Refer Others",
      description: "Share your referral link with others to join your network."
    },
    {
      step: 3,
      title: "Build Your Network",
      description: "As your 1x5 matrix fills, your earnings potential increases."
    },
    {
      step: 4,
      title: "Earn Commissions",
      description: "Receive commissions from your direct referrals and network growth."
    }
  ];

  const benefits = [
    {
      title: "Unlimited Earning Potential",
      description: "Your income grows as your network expands with no ceiling."
    },
    {
      title: "Simple Structure",
      description: "Easy-to-understand 1x5 matrix with clear visualization."
    },
    {
      title: "Reliable Payouts",
      description: "Regular commission payments directly to your account."
    },
    {
      title: "Detailed Analytics",
      description: "Track your performance and network growth in real-time."
    }
  ];

  const handlePurchase = async (title, amount) => {
    try {

        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const payload = {
            uid: obj.id,
            amount: amount,
            title: title
        };

        // Show SweetAlert loading modal
        Swal.fire({
          title: 'Please wait...',
          text: 'We are processing your purchase. This may take a moment.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        debugger; 
        const response = await api.post("/purchaseitem", payload);

        // Close the modal after loading
        Swal.close();          

        tog_successMessage()
        // Swal.fire({
        //     icon: response.success ? "success" : "error",
        //     text: response.message,
        //     confirmButtonText: "OK",
        // });

        return response.success;
    } catch (error) {
        Swal.fire({
            icon: "error",
            text: "An error occurred during the purchase!",
            confirmButtonText: "OK",
        });
        return false;
    }
};


  // Pricing Card Component
  const PricingCard = ({ title, price, description, features, popular }) => {
    return (
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
            <h2><sup><small>$ </small></sup>{price.split('$')[1]}<span className="fs-13 text-muted"> per donation</span></h2>
          </div>
          
          <hr className="my-4 text-muted" />
          
          <div>
            <ul className="list-unstyled text-muted vstack gap-3">
              {features.map((feature, index) => (
                <li key={index}>
                  <div className="d-flex">
                    <div className={`flex-shrink-0 ${index < 4 ? 'text-success' : 'text-danger'} me-1`}>
                      <i className={`${index < 4 ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'} fs-15 align-middle`}></i>
                    </div>
                    <div className="flex-grow-1">{feature}</div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="mt-4">
            <button
                className="btn btn-soft-primary w-100"
                onClick={() => handlePurchase(title,price.split('$')[1])}
                >
                Purchase Now
                </button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  // Step Component
  const StepItem = ({ step, title, description }) => (
    <ListGroupItem className="d-flex">
      <div className="me-3">{step}.</div>
      <div>
        {title}<br />
        <small className="text-muted">{description}</small>
      </div>
    </ListGroupItem>
  );

  // Benefit Component
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
              <label for="invite_name" class="form-label fw-semibold">Friend’s Name</label>
              <input type="text" id="invite_name" class="form-control" placeholder="Enter your friend's full name">
            </div>
          </div>
  
          <div class="row mb-3">
            <div class="col-12">
              <label for="invite_email" class="form-label fw-semibold">Friend’s Email</label>
              <input type="email" id="invite_email" class="form-control" placeholder="Enter their email address">
            </div>
          </div>
  
          <div class="row">
            <div class="col-12">
              <label for="referral_link" class="form-label fw-semibold">Your Referral Link</label>
              <input type="text" id="referral_link" class="form-control" value="${referralLink}" readonly >
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
        // 🧽 Reset validation when typing
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
        sendText.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...`;
  
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
            // ✅ Show success message temporarily
            const successMsg = document.getElementById('invite_success');
            if (successMsg) {
              successMsg.style.display = 'block';
            }
  
            // Reset input fields
            nameInput.value = '';
            emailInput.value = '';
  
            // Focus back on the name field for next invite
            setTimeout(() => {
              successMsg.style.display = 'none';
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
  
        // Return false to prevent modal from closing
        return false;
      }
    });
  };
  
  


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="IBO Pro" pageTitle="Dashboard" url="/dashboard/home" />

          <Row>
            <Col lg={12}>
              {/* Pricing Header */}
              <Row className="justify-content-center mt-5">
                <Col lg={5}>
                  <div className="text-center mb-4 pb-2">
                    <h4 className="fw-semibold fs-23">Choose the APC Inventory Donation level that you want to avail</h4>
                    <p className="text-muted mb-4 fs-15">Select a package to grow your network</p>
                  </div>
                </Col>
              </Row>

              {/* Pricing Cards */}
              <Row className="justify-content-center">
                <Col xl={9}>
                  <Row>
                    {pricingData.map((pricing, index) => (
                      <Col lg={6} key={index}>
                        <PricingCard {...pricing} />
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>

              {/* How It Works & Benefits */}
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
                You've successfully activated your Unilevel plan product. Your purchase not only gives you access to exclusive features, it also unlocks exciting earning opportunities through your referral network.
              </p>

              <div className="hstack gap-2 justify-content-center">

              <button
                className="btn btn-outline-warning"
                style={{fontSize:"12px"}}
                onClick={() => {
                  tog_successMessage(); // Close the modal
                  // Optionally reopen the purchase dialog or route to the purchase page
                  navigate("/purchase"); // Replace with your actual purchase page route
                  
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
                {/* <button
                  className="btn btn-soft-success"
                  onClick={() => {
                    const obj = JSON.parse(sessionStorage.getItem("authUser"));
                    const referralLink = `https://ibopro.com/${obj.username}`;
                    navigator.clipboard.writeText(referralLink);
                    toast.success("Referral link copied!");
                  }}
                >
                  <i className="ri-links-line align-bottom"></i> Copy Referral Link
                </button> */}
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
    </React.Fragment>
  );
};

export default PurchaseForm;