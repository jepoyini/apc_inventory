// ================================================================
// FILE: src/pages/Users/PermissionCheckboxes.jsx
// ================================================================
import React from "react";
import { Row, Col, FormGroup, Input, Label } from "reactstrap";

const PermissionCheckboxes = ({ permissions = {}, onChange = () => {} }) => {
  return (
    <div>
      <Row>
        {/* Users */}
        <Col md={6}>
          <h6>Users</h6>
          {["add", "edit", "delete"].map((p) => (
            <FormGroup check key={`users-${p}`}>
              <Input
                type="checkbox"
                checked={permissions.users && permissions.users[p] ? true : false}
                onChange={() => onChange("users", p)}
              />{" "}
              <Label check>{p.charAt(0).toUpperCase() + p.slice(1)}</Label>
            </FormGroup>
          ))}
        </Col>

        {/* Inventory */}
        <Col md={6}>
          <h6>Inventory</h6>
          {["add", "edit", "delete"].map((p) => (
            <FormGroup check key={`inventory-${p}`}>
              <Input
                type="checkbox"
                checked={
                  permissions.inventory && permissions.inventory[p]
                    ? true
                    : false
                }
                onChange={() => onChange("inventory", p)}
              />{" "}
              <Label check>{p.charAt(0).toUpperCase() + p.slice(1)}</Label>
            </FormGroup>
          ))}
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <FormGroup check>
            <Input
              type="checkbox"
              checked={permissions.qr ? true : false}
              onChange={() => onChange("qr")}
            />{" "}
            <Label check>QR Scanning</Label>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup check>
            <Input
              type="checkbox"
              checked={permissions.reports ? true : false}
              onChange={() => onChange("reports")}
            />{" "}
            <Label check>Reports</Label>
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

export default PermissionCheckboxes;
