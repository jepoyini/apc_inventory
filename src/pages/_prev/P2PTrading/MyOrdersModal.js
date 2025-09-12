// src/pages/P2PTrading/MyOrdersModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Row, Col, Input, Label, Card, CardBody, CardHeader, Badge
} from "reactstrap";
import { P2PApi } from "../../helpers/p2p_api";
import OrderChat from "./OrderChat";

export default function MyOrdersModal({ isOpen, toggle }) {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // ALL by default
  const [sideFilter, setSideFilter] = useState("");     // BUY/SELL/empty

  const num2 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
  };

  const badgeForStatus = (s) => {
    switch (String(s || "").toUpperCase()) {
      case "PENDING_PAYMENT": return "warning";
      case "PAID":            return "info";
      case "DISPUTED":        return "danger";
      case "RELEASED":        return "success";
      case "CANCELED":        return "secondary";
      case "EXPIRED":         return "dark";
      default:                return "secondary";
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      // server already infers user from session/header; role "all" to fetch both buyer/seller
      const res = await P2PApi.listOrders({ role: "all" });
      setOrders(res.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveOrder(null);
      setSearch("");
      setStatusFilter("");
      setSideFilter("");
      load();
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (orders || []).filter((o) => {
      if (statusFilter && String(o.status).toUpperCase() !== statusFilter) return false;
      if (sideFilter && String(o.side).toUpperCase() !== sideFilter) return false;
      if (!term) return true;
      const blob = [
        o.id,
        o.side,
        o.asset_code,
        o.fiat_code,
        o.buyer_username,
        o.seller_username,
        o.status,
      ].join(" ").toLowerCase();
      return blob.includes(term);
    });
  }, [orders, search, statusFilter, sideFilter]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" backdrop="static">
      <ModalHeader toggle={toggle}>My Orders & Chat</ModalHeader>

      <hr></hr>
      <ModalBody>
        <Row className="g-3">
          {/* LEFT: Orders list */}
          <Col md={7}>
            <Card className="h-100">

<CardHeader>
  <Row className="g-2 align-items-center">
    <Col md={5}>
      <Input
        placeholder="Search id, user, asset, fiat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </Col>
    <Col md={3}>
      <Input
        type="select"
        value={sideFilter}
        onChange={(e) => setSideFilter(e.target.value)}
      >
        <option value="">All Types</option>
        <option value="BUY">Buy</option>
        <option value="SELL">Sell</option>
      </Input>
    </Col>
    <Col md={3}>
      <Input
        type="select"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="PENDING_PAYMENT">Pending</option>
        <option value="PAID">Paid</option>
        <option value="DISPUTED">Disputed</option>
        <option value="RELEASED">Released</option>
        <option value="CANCELED">Canceled</option>
        <option value="EXPIRED">Expired</option>
      </Input>
    </Col>
    <Col md={1} className="d-flex justify-content-end">
      <Button
        color="primary"
        onClick={load}
        disabled={loading}
        style={{whiteSpace: "nowrap" }}
      >
        {loading ? "..." : "Refresh"}
      </Button>
    </Col>
  </Row>
</CardHeader>



              <CardBody className="p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 70 }}>#</th>
                        <th style={{ width: 80 }}>Type</th>
                        <th>Asset</th>
                        <th>Fiat</th>
                        <th>Status</th>
                        <th style={{ width: 1 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((o) => {
                        const selected = activeOrder && activeOrder.id === o.id;
                        return (
                          <tr
                            key={o.id}
                            className={selected ? "table-active" : ""}
                            style={{ cursor: "pointer" }}
                            onClick={() => setActiveOrder(o)}
                          >
                            <td className="text-muted">#{o.id}</td>
                            <td>
                              <Badge color={o.side === "BUY" ? "info" : "primary"}>
                                {o.side}
                              </Badge>
                            </td>
                            <td className="small">
                              {num2(o.amount_asset)} {o.asset_code}
                            </td>
                            <td className="small">
                              {num2(o.amount_fiat)} {o.fiat_code}
                            </td>
                            <td>
                              <Badge color={badgeForStatus(o.status)}>{o.status}</Badge>
                            </td>
                            <td className="text-end">
                              <Button
                                size="sm"
                                color="outline-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveOrder(o);
                                }}
                              >
                                Open
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      {!filtered.length && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-4">
                            {loading ? "Loading orders..." : "No orders found."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* RIGHT: Chat panel */}
          <Col md={5}>
            <Card className="h-100">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">
                    {activeOrder ? `Order #${activeOrder.id}` : "Chat"}
                  </div>
                  {activeOrder && (
                    <div className="small text-muted">
                      {activeOrder.buyer_username} ↔ {activeOrder.seller_username} &nbsp;•&nbsp;{" "}
                      <Badge color={badgeForStatus(activeOrder.status)}>
                        {activeOrder.status}
                      </Badge>
                    </div>
                  )}
                </div>
                {activeOrder && (
                  <Button
                    size="sm"
                    color="secondary"
                    onClick={async () => {
                      const o = await P2PApi.getOrder({ id: activeOrder.id });
                      setActiveOrder(o.order);
                    }}
                  >
                    Refresh
                  </Button>
                )}
              </CardHeader>
              <CardBody style={{ minHeight: 380 }}>
                {activeOrder ? (
                  <OrderChat orderId={activeOrder.id} />
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                    Select an order from the left to view chat.
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button className="btn btn-soft-warning" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}
