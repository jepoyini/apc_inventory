// ================================================================
// FILE: src/pages/Inventory/WarehouseCard.jsx
// ================================================================
import React from "react";
import {
  Card,
  CardBody,
  Badge,
  Button,
  Row,
  Col,
  Progress,
} from "reactstrap";

const fmt = (n) => Number(n || 0).toLocaleString();
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

const WarehouseCard = ({ warehouse, onView, onEdit, onDelete }) => {
  const utilization = pct(warehouse.current_stock, warehouse.capacity);

  return (
    <Card className="shadow-sm h-100">
      <CardBody>
        {/* Title + Status */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="mb-0">{warehouse.name}</h5>
          <Badge
            color={warehouse.status === "Active" ? "success" : "warning"}
            pill
          >
            {warehouse.status}
          </Badge>
        </div>

        {/* Location + Manager */}
        <p className="text-muted mb-1">
          <i className="ri-map-pin-line me-1"></i> {warehouse.location}
        </p>
        <p className="text-muted mb-2">
          <i className="ri-user-3-line me-1"></i> {warehouse.manager}
        </p>

        {/* Utilization */}
        <div className="mb-2">
          <small className="text-muted d-flex justify-content-between">
            <span>Utilization</span>
            <span>{utilization}%</span>
          </small>
          <Progress
            value={utilization}
            className="progress-sm"
            color={utilization > 80 ? "danger" : utilization > 60 ? "warning" : "success"}
          />
        </div>

        {/* Quick stats */}
        <Row className="text-center mb-3">
          <Col xs={4}>
            <div className="fw-semibold">{fmt(warehouse.current_stock)}</div>
            <small className="text-muted">Stock</small>
          </Col>
          <Col xs={4}>
            <div className="fw-semibold text-success">
              {fmt(Math.max(0, (warehouse.capacity || 0) - (warehouse.current_stock || 0)))}
            </div>
            <small className="text-muted">Available</small>
          </Col>
          <Col xs={4}>
            <div className="fw-semibold">{fmt(warehouse.capacity)}</div>
            <small className="text-muted">Capacity</small>
          </Col>
        </Row>

        {/* Actions */}
        <div className="d-flex justify-content-between gap-2">
          <Button
            size="sm"
            color="info"
            onClick={() => onView(warehouse.id)}
          >
            <i className="ri-eye-line me-1"></i> View
          </Button>
          <Button
            size="sm"
            color="warning"
            onClick={() => onEdit(warehouse)}
          >
            <i className="ri-edit-line me-1"></i> Edit
          </Button>
          <Button
            size="sm"
            color="danger"
            onClick={() => onDelete(warehouse.id)}
          >
            <i className="ri-delete-bin-6-line me-1"></i> Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default WarehouseCard;
