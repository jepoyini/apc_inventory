// ================================================================
// FILE: src/pages/Inventory/Specs.jsx
// ================================================================
import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";

const ProductSpecs = ({ specs = {} }) => {
  return (
    <Row className="g-3">
      {/* Dimensions */}
      <Col md={6}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Dimensions</h5>
            <Row>
              <Col xs={6}><strong>Length:</strong></Col>
              <Col xs={6}>{specs.length || "—"}</Col>
              <Col xs={6}><strong>Width:</strong></Col>
              <Col xs={6}>{specs.width || "—"}</Col>
              <Col xs={6}><strong>Height:</strong></Col>
              <Col xs={6}>{specs.height || "—"}</Col>
              <Col xs={6}><strong>Weight:</strong></Col>
              <Col xs={6}>{specs.weight || "—"}</Col>
            </Row>
          </CardBody>
        </Card>
      </Col>

      {/* Specifications */}
      <Col md={6}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Specifications</h5>
            <Row>
              <Col xs={6}><strong>Material:</strong></Col>
              <Col xs={6}>{specs.material || "—"}</Col>
              <Col xs={6}><strong>Base:</strong></Col>
              <Col xs={6}>{specs.base || "—"}</Col>
              <Col xs={6}><strong>Engraving:</strong></Col>
              <Col xs={6}>{specs.engraving || "—"}</Col>
              <Col xs={6}><strong>Packaging:</strong></Col>
              <Col xs={6}>{specs.packaging || "—"}</Col>
            </Row>
          </CardBody>
        </Card>
      </Col>

      {/* Additional Info */}
      <Col md={12}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Additional Information</h5>
            <Row>
              <Col xs={6}><strong>Supplier:</strong></Col>
              <Col xs={6}>{specs.supplier || "—"}</Col>
              <Col xs={6}><strong>Manufactured:</strong></Col>
              <Col xs={6}>{specs.manufactured || "—"}</Col>
              <Col xs={6}><strong>Warranty:</strong></Col>
              <Col xs={6}>{specs.warranty || "—"}</Col>
              <Col xs={6}><strong>Created:</strong></Col>
              <Col xs={6}>{specs.created || "—"}</Col>
              <Col xs={6}><strong>Last Updated:</strong></Col>
              <Col xs={6}>{specs.lastUpdated || "—"}</Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductSpecs;
