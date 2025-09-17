// src/pages/Inventory/WarehouseViewModal.jsx
import React, { useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Nav, NavItem, NavLink, TabContent, TabPane,
  Row, Col, Card, CardBody, Progress, Table, Button, Input
} from "reactstrap";
import classnames from "classnames";
import { api } from "../../config";

const WarehouseViewModal = ({
  isOpen,
  toggle,
  details,
  activeTab,
  setActiveTab,
  fmt,
  pct
}) => {
  const [logoFile, setLogoFile] = useState(null);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/warehouse.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]); // preview new file
    }
  };

  const displayLogo = logoFile
    ? URL.createObjectURL(logoFile)
    : prefixUrl(details?.warehouse?.logo);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader toggle={toggle}>
        {details?.warehouse?.name || "Warehouse"}{" "}
        <span className="text-muted">— {details?.warehouse?.location}</span>
      </ModalHeader>
      <ModalBody>
        {!details.warehouse ? (
          <div className="text-center p-5">Loading...</div>
        ) : (
          <>
            {/* Tabs */}
            <Nav tabs className="mb-3">
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => setActiveTab("1")}
                >
                  Overview
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => setActiveTab("2")}
                >
                  Products
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
              {/* Overview */}
              <TabPane tabId="1">
                <Row className="mb-3 align-items-center">
                  {/* Logo on the left */}
                  <Col md={3} className="text-center">
                    <img
                      src={displayLogo}
                      alt="Warehouse Logo"
                      className="img-fluid rounded shadow-sm mb-2"
                      style={{ maxHeight: "150px", objectFit: "contain" }}
                    />
       
                  </Col>

                  {/* Info on the right */}
                  <Col md={9}>
                    <Row>
                      <Col md={4}>
                        <Card className="shadow-sm mb-3">
                          <CardBody>
                            <h6 className="text-muted">Manager</h6>
                            <p className="fw-semibold">{details.warehouse.manager}</p>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="shadow-sm mb-3">
                          <CardBody>
                            <h6 className="text-muted">Capacity</h6>
                            <p className="fw-semibold">{fmt(details.warehouse.capacity)}</p>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="shadow-sm mb-3">
                          <CardBody>
                            <h6 className="text-muted">Current Stock</h6>
                            <p className="fw-semibold">{fmt(details.warehouse.current_stock)}</p>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>

                    <Progress
                      value={pct(details.warehouse.current_stock, details.warehouse.capacity)}
                      className="progress-sm mb-2"
                    />
                    <small className="text-muted d-block mb-3">
                      {pct(details.warehouse.current_stock, details.warehouse.capacity)}% Used
                    </small>
                  </Col>
                </Row>

                {/* Monthly Stats + Performance */}
                <Row>
                  <Col md={6}>
                    <Card className="shadow-sm mb-3">
                      <CardBody>
                        <h6>Monthly Stats</h6>
                        <p>Received: {fmt(details.stats.received || 0)}</p>
                        <p>Shipped: {fmt(details.stats.shipped || 0)}</p>
                        <p>Transfers: {fmt(details.stats.transfers || 0)}</p>
                        <p>Returns: {fmt(details.stats.returns || 0)}</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="shadow-sm mb-3">
                      <CardBody>
                        <h6>Performance</h6>
                        <p>Accuracy: {details.metrics.accuracy || "99%"}</p>
                        <p>Processing Time: {details.metrics.processing_time || "2 hrs"}</p>
                        <p>Efficiency: {details.metrics.efficiency || "A+"}</p>
                        <p>Last Audit: {details.metrics.last_audit || "2 weeks ago"}</p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {/* Products */}
              <TabPane tabId="2">
                <Table hover responsive bordered>
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th className="text-end">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.products.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No products
                        </td>
                      </tr>
                    ) : (
                      details.products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.sku}</td>
                          <td>{p.category}</td>
                          <td className="text-end">{fmt(p.quantity)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </TabPane>
            </TabContent>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default WarehouseViewModal;
