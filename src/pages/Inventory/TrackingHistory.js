// ================================================================
// FILE: src/pages/Inventory/TrackingHistory.jsx
// ================================================================
import React from "react";
import {
  Card, CardBody, Row, Col, Badge
} from "reactstrap";
import {
  RiCalendarLine,
  RiAddLine,
  RiPencilLine,
  RiArrowRightLine,
  RiTruckLine,
  RiInboxLine,
  RiArrowGoBackLine,
  RiDeleteBinLine,
  RiQrCodeLine,
  RiMapPinLine,
  RiUserLine
} from "react-icons/ri";

const TrackingHistory = ({ events = [] }) => {

  const getEventIcon = (type) => {
    switch (type) {
      case "created": return <RiAddLine />;
      case "updated": return <RiPencilLine />;
      case "moved": return <RiArrowRightLine />;
      case "shipped": return <RiTruckLine />;
      case "received": return <RiInboxLine />;
      case "returned": return <RiArrowGoBackLine />;
      case "disposed": return <RiDeleteBinLine />;
      case "scanned": return <RiQrCodeLine />;
      default: return <RiCalendarLine />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "created": return "bg-success-subtle text-success border-success-subtle";
      case "updated": return "bg-primary-subtle text-primary border-primary-subtle";
      case "moved": return "bg-warning-subtle text-warning border-warning-subtle";
      case "shipped": return "bg-info-subtle text-info border-info-subtle";
      case "received": return "bg-success-subtle text-success border-success-subtle";
      case "returned": return "bg-secondary-subtle text-secondary border-secondary-subtle";
      case "disposed": return "bg-danger-subtle text-danger border-danger-subtle";
      case "scanned": return "bg-dark-subtle text-dark border-dark-subtle";
      default: return "bg-light text-muted border-light";
    }
  };

  const formatDescription = (ev) => {
    switch (ev.type) {
      case "created": return "Product created in system";
      case "updated": return "Product information updated";
      case "moved": return `Moved from ${ev.fromLocation} to ${ev.toLocation}`;
      case "shipped": return `Shipped ${ev.quantity || ""} from ${ev.location}`;
      case "received": return `Received ${ev.quantity || ""} at ${ev.location}`;
      case "returned": return `Returned ${ev.quantity || ""} to ${ev.location}`;
      case "disposed": return `Disposed ${ev.quantity || ""} from ${ev.location}`;
      case "scanned": return `Scanned at ${ev.location}`;
      default: return "Activity recorded";
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <Card>
      <CardBody>
        <h5 className="mb-3 d-flex align-items-center">
          <RiCalendarLine className="me-2" /> Tracking History
          <Badge color="secondary" pill className="ms-2">
            {events.length} events
          </Badge>
        </h5>

        {sortedEvents.length === 0 ? (
          <div className="text-center text-muted py-5">
            <RiCalendarLine size={40} className="mb-2 text-muted" />
            <div>No tracking events recorded</div>
          </div>
        ) : (
          <div className="timeline position-relative">


            {sortedEvents.map((ev, idx) => (
              <Row key={idx} className="mb-4 align-items-start position-relative">
                <Col xs="auto" className="position-relative">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center border ${getEventColor(ev.type)}`}
                    style={{ width: 48, height: 48 }}
                  >
                    {getEventIcon(ev.type)}
                  </div>
                  {idx !== sortedEvents.length - 1 && (
                    <div
                      className="position-absolute top-100 start-50 translate-middle-x bg-light"
                      style={{ width: "2px", height: "200%" }}
                    />
                  )}
                </Col>
                <Col>
                  <div className="justify-content-between align-items-center ">
                    <Badge className={`text-capitalize ${getEventColor(ev.type)}`}>
                      {ev.type}
                    </Badge>
                    
                    <small className="ml10px text-muted">
                      {new Date(ev.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div className="fw-semibold">{formatDescription(ev)}</div>
                  {ev.remarks && <div className="text-muted small">{ev.remarks}</div>}
                  <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
                    {ev.fullname && <span><RiUserLine className="me-1" /> {ev.fullname}</span>}
                    {ev.quantity && <span><RiInboxLine className="me-1" /> {ev.quantity} items</span>}
                    {ev.location && !ev.fromLocation && !ev.toLocation && (
                      <span><RiMapPinLine className="me-1" /> {ev.location}</span>
                    )}
                  </div>
                </Col>
              </Row>

            ))}



            
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default TrackingHistory;
