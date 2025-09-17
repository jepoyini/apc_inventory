// ================================================================
// FILE: src/pages/Dashboard/Section.jsx
// ================================================================
import React, { useEffect, useState } from 'react';
import { Col, Row, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import FeatherIcon from "feather-icons-react";

const Section = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) return "Good Morning";
      if (currentHour < 18) return "Good Afternoon";
      return "Good Evening";
    };
    setGreeting(getGreeting());

    if (sessionStorage.getItem("authUser")) {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      setUserName(obj.firstname + ' ' + obj.lastname);
    }
  }, []);

  return (
    <React.Fragment>
      <Row className="mb-3 pb-1 align-items-center">
        {/* Left side: Greeting */}
        <Col xl={6} lg={6} md={12} className="mb-2 mb-lg-0">
          <div>
            <h2 className="mb-1">Dashboard</h2>
            <p className="mb-0">
              <span className="fs-16 fw-bold">{greeting}, {userName}</span>
            </p>
            <p className="text-muted mb-0">
              Welcome to American Plaque Inventory Management System
            </p>
          </div>
        </Col>

        {/* Right side: Quick Actions (all on one line) */}
        <Col
          xl={6}
          lg={6}
          md={12}
          className="d-flex justify-content-lg-end"
        >
          <div
            className="d-flex flex-nowrap gap-2 overflow-auto"
            style={{ whiteSpace: "nowrap" }}
          >
            <Button
              color="primary"
              onClick={() => navigate("/inventory")}
              className="d-flex align-items-center"
            >
              <FeatherIcon icon="package" className="me-2" size={16} />
              Add Product
            </Button>

            <Button
              color="success"
              onClick={() => navigate("/qrscan")}
              className="d-flex align-items-center"
            >
              <FeatherIcon icon="camera" className="me-2" size={16} />
              Start Scan
            </Button>

            <Button
              color="info"
              onClick={() => navigate("/warehouses")}
              className="d-flex align-items-center"
            >
              <FeatherIcon icon="layers" className="me-2" size={16} />
              Warehouses
            </Button>

            <Button
              color="warning"
              onClick={() => navigate("/reports")}
              className="d-flex align-items-center"
            >
              <FeatherIcon icon="bar-chart-2" className="me-2" size={16} />
              Reports
            </Button>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Section;
