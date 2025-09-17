// ================================================================
// FILE: src/pages/Inventory/TrackingHistory.jsx
// ================================================================
import React, { useState } from "react";
import {
  Card, CardBody, Row, Col, Badge, Input
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
  RiUserLine,
  RiCheckLine,
  RiRefreshLine
} from "react-icons/ri";

// 🔹 Status badge (from QuantityManager)
const getStatusBadge = (status) => {
  switch (status) {
    case "CREATED":   return <Badge className="created-status mw-70">CREATED</Badge>;
    case "AVAILABLE": return <Badge color="success" className="mw-70">AVAILABLE</Badge>;
    case "IN_TRANSIT":return <Badge color="info" className="mw-70">IN-TRANSIT</Badge>;
    case "IN_STOCK":  return <Badge color="primary" className="mw-70">IN-STOCK</Badge>;
    case "SOLD":      return <Badge color="dark" className="mw-70">SOLD</Badge>;
    case "DISPOSED":  return <Badge color="danger" className="mw-70">DISPOSED</Badge>;
    case "RETURNED":  return <Badge className="returned-status mw-70">RETURNED</Badge>;
    case "CHECK_IN":  return <Badge className="returned-status mw-70">CHECK-IN</Badge>;
    default:          return <Badge color="secondary" className="mw-70">{status}</Badge>;
  }
};
const getStatusIcon = (status) => {
  switch (status?.toUpperCase()) {
    case "CREATED":   return <RiAddLine />;
    case "AVAILABLE": return <RiInboxLine />;         // 📦 available
    case "IN_TRANSIT":return <RiTruckLine />;         // 🚚 in-transit
    case "IN_STOCK":  return <RiCheckLine />;         // ✅ in-stock
    case "SOLD":      return <RiArrowRightLine />;    // ➡ sold/delivered
    case "DISPOSED":  return <RiDeleteBinLine />;     // 🗑 disposed
    case "RETURNED":  return <RiArrowGoBackLine />;   // ↩ returned
    case "CHECK_IN":  return <RiPencilLine />;        // 📝 check-in/verification
    default:          return <RiCalendarLine />;      // 📅 fallback
  }
};
const TrackingHistory = ({ events = [], load }) => {

  const [refreshing, setRefreshing] = useState(false); // 🔹 new state

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await load();   // 🔹 call your fetch function
    } finally {
      setRefreshing(false);
    }
  };

  const [search, setSearch] = useState("");

  // 🔹 Highlight matching text
  const highlightText = (text, search) => {
    if (!search || !text) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} style={{ backgroundColor: "yellow", padding: "0" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // 🔹 Icons by action
  const getEventIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "created": return <RiAddLine />;
      case "updated": return <RiPencilLine />;
      case "moved":
      case "transfer": return <RiArrowRightLine />;
      case "shipped": return <RiTruckLine />;
      case "received": return <RiInboxLine />;
      case "returned": return <RiArrowGoBackLine />;
      case "disposed": return <RiDeleteBinLine />;
      case "scanned": return <RiQrCodeLine />;
      case "status": return <RiCheckLine />;
      default: return <RiCalendarLine />;
    }
  };

// 🔹 Description builder (based on status instead of action)
const formatDescription = (ev) => {
  const qty = ev.quantity ? `${ev.quantity} ` : "";
  switch (ev.status?.toUpperCase()) {
    case "CREATED":   return `Item ${ev.tracking_code || ""} was created in the system`;
    case "AVAILABLE": return `Item ${ev.tracking_code || ""} is now available ${ev.warehouse_name ? "at " + ev.warehouse_name : ""}`;
    case "IN_TRANSIT":return `Item ${ev.tracking_code || ""} is in transit to warehouse ${ev.warehouse_name || ev.warehouse_id}`;
    case "IN_STOCK":  return `Item ${ev.tracking_code || ""} is in stock at ${ev.warehouse_name || ev.warehouse_id}`;
    case "SOLD":      return `Item ${ev.tracking_code || ""} has been sold`;
    case "DISPOSED":  return `Item ${ev.tracking_code || ""} has been disposed`;
    case "RETURNED":  return `Item ${ev.tracking_code || ""} has been returned to ${ev.warehouse_name || ev.warehouse_id}`;
    case "CHECK_IN":  return `Item ${ev.tracking_code || ""} check-in to ${ev.warehouse_name || ev.warehouse_id} for verification`;
    default:          return `Item ${ev.tracking_code || ""} status: ${ev.status || "N/A"}`;
  }
};
  // 🔹 Sort + filter
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const filteredEvents = sortedEvents.filter(ev => {
    const term = search.toLowerCase();
    return (
      (ev.action && ev.action.toLowerCase().includes(term)) ||
      (ev.status && ev.status.toLowerCase().includes(term)) ||
      (ev.tracking_code && ev.tracking_code.toLowerCase().includes(term)) ||
      (ev.fullname && ev.fullname.toLowerCase().includes(term)) ||
      (ev.remarks && ev.remarks.toLowerCase().includes(term)) ||
      (ev.warehouse_name && ev.warehouse_name.toLowerCase().includes(term))
    );
  });

  return (
    <Card>
      <CardBody>
        <h5 className="mb-3 d-flex align-items-center">
          <RiCalendarLine className="me-2" /> Tracking History
          <Badge color="dark" pill className="ms-2">
            {filteredEvents.length} / {events.length}
          </Badge>
        </h5>

        {/* 🔹 Search + Refresh Row */}
        <Row className="mb-3 g-2 align-items-center">
          <Col xs="12" md="3">
            <Input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs="auto">
            <button
              className="btn btn-outline-secondary d-flex align-items-center"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine
                className={`me-1 ${refreshing ? "spin" : ""}`} // 🔹 spin when loading
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </Col>
        </Row>


{refreshing ? (
  <div className="text-center py-5">
    <div className="spinner-border text-secondary" role="status" />
    <div className="mt-2 text-muted">Refreshing events...</div>
  </div>
) : filteredEvents.length === 0 ? (
  <div className="text-center text-muted py-5">
    <RiCalendarLine size={40} className="mb-2 text-muted" />
    <div>No tracking events match your search</div>
  </div>
) : (
  <div className="timeline position-relative">
    {filteredEvents.map((ev, idx) => (
              <Row
                    key={idx}
                    className="align-items-start position-relative"
                    style={{ marginBottom: "40px" }}
                  >
                <Col xs="auto" className="position-relative">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center border bg-light"
                    style={{ width: 48, height: 48 }}
                  >
                    {getStatusIcon(ev.status)}
                  </div>
                  {idx !== filteredEvents.length - 1 && (
                    <div
                      className="position-absolute top-100 start-50 translate-middle-x bg-light"
                      style={{ width: "2px", height: "200%" }}
                    />
                  )}
                </Col>
                <Col>


                  {/* 🔹 Description */}
                  <div className="fw-semibold">
                    {highlightText(formatDescription(ev), search)}
                  </div>
                  {/* 🔹 Action */}
                  <div className="mb-1">
                     <span>Status: {getStatusBadge(ev.status)}</span>
                  </div>
                  {/* 🔹 Remarks */}
                  {ev.remarks && (
                    <div className="text-muted small">
                      {highlightText(ev.remarks, search)}
                    </div>
                  )}

                  {/* 🔹 Status + Meta */}
                  <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">

                    <span>
                      <RiCalendarLine className="me-1" />
                      {new Date(ev.created_at).toLocaleString()}
                    </span>
                    {ev.tracking_code && (
                      <span><RiQrCodeLine className="me-1" /> {highlightText(ev.tracking_code, search)}</span>
                    )}
                    {ev.quantity && (
                      <span><RiInboxLine className="me-1" /> {highlightText(String(ev.quantity), search)} items</span>
                    )}
                    {ev.warehouse_name && (
                      <span><RiMapPinLine className="me-1" /> {highlightText(ev.warehouse_name, search)}</span>
                    )}
                    {ev.fullname && (
                      <span><RiUserLine className="me-1" /> {highlightText(ev.fullname, search)}</span>
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
