import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Container, CardHeader,
  Row, ListGroup, ListGroupItem, Modal, ModalBody
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import SHA256 from 'crypto-js/sha256';
import maintenanceImg from '../../assets/images/coming-soon-img.png';

const VideosForm = () => {
  const navigate = useNavigate();
  const { videoname } = useParams();
  document.title = videoname;
  const [pageloading, setPageLoading] = useState(true); // Start loading = true
  const api = new APIClient();

  const [purchasedPlans, setPurchasedPlans] = useState([]);
  const [modal_successMessage, setModalSuccessMessage] = useState(false);
  const tog_successMessage = () => setModalSuccessMessage(!modal_successMessage);
  const sharedSecret = 'bG9K2g7hT5xRm9pY8sVw4qZ1eA2tXcMb0rNfUwG6dPiKs3QvJh'; 

  const getIframeSrc = () => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const username = obj?.username || 'guest';
    const secret = SHA256(username + sharedSecret).toString();
          debugger; 
    switch (videoname) {
      case 'rewardpoints': 
        return "https://prosperclub.com/?sharing=" + username;
      default: 
        return '';
    }
  };

  useEffect(() => {}, [videoname]);

  useEffect(() => {
    if (!modal_successMessage) {
      document.body.style.overflow = 'auto';
    }
  }, [modal_successMessage]);

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
        <div></div>
       )}

      <div className="page-content">
        {/* <Container fluid>
          <BreadCrumb title={videoname} pageTitle="Dashboard" url="/dashboard/home" />
          <Row>
            <Col md={12}>
              <iframe
                src={getIframeSrc()}
                title="Site Frame"
                onLoad={() => setPageLoading(false)} // <-- important: stop loading when iframe ready
                style={{ width: '100%', height: '80vh', border: 'none', display: pageloading ? 'none' : 'block' }}
              />
            </Col>
          </Row>
        </Container> */}

        <Container fluid>
            <BreadCrumb title={videoname} pageTitle="Dashboard" url="/dashboard/home" />
            <Row>
                <Col md={12}>
                {getIframeSrc() ? (
                    <iframe
                    src={getIframeSrc()}
                    title="Site Frame"
                    onLoad={() => setPageLoading(false)}
                    style={{ width: '100%', height: '80vh', border: 'none', display: pageloading ? 'none' : 'block' }}
                    />
                ) : (
                    <Row>
                    <Col lg={12}>
                        <div className="text-center pt-4">
                        <div className="mb-5 text-white-50">
                            <h1 className="display-5">This page is still under construction.</h1>
                            <p className="fs-14">Please check back later</p>
                        </div>
                        <Row className="justify-content-center mb-5">
                            <Col xl={4} lg={8}>
                            <div>
                                <img src={maintenanceImg} alt="" className="img-fluid" />
                            </div>
                            </Col>
                        </Row>
                        </div>
                    </Col>
                    </Row>
                )}
                </Col>
            </Row>
        </Container>


      </div>
    </React.Fragment>
    )
};

export default VideosForm;
