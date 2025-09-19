import React, { useEffect, useState } from "react";
import { Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
//images import
import maintenanceImg from '../../assets/images/coming-soon-img.png';

const Transactions = () => {
    document.title="Videos | PNP Inventory";
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    
      const handleChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Example: Call your backend here
        console.log("Form submitted:", formData);
    
        Swal.fire("Message Sent", "Thank you for contacting us!", "success");
    
        // Reset the form
        setFormData({ name: "", email: "", subject: "", message: "" });
      };
  return (
    <React.Fragment>
    <div className="page-content">
        <Container fluid>
            <BreadCrumb title="Contact Us" pageTitle="Dashboard" url="/dashboard" />

            <Row>
                    <Col lg={12}>
                        <div className="text-center  pt-4">
                            <div className="mb-5 text-white-50">
                                <h1 className="display-5">This page is still under construction.</h1>
                                <p className="fs-14">Please check back later</p>
                                <div className="mt-4 pt-2">
                                </div>
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

        </Container>

    </div>

  
</React.Fragment>
  );
};

export default Transactions;