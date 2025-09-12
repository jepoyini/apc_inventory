import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Row, Col, Input, Label, Progress
} from "reactstrap";
import Swal from "sweetalert2";
import { P2PApi } from "../../helpers/p2p_api";
import OrderChat from "./OrderChat";

export default function OrderModal({ isOpen, toggle, offer, onUpdated }) {
  const [amount, setAmount] = useState("");
  const [order, setOrder] = useState(null);
  const [pmId, setPmId] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const fiatTotal = useMemo(() => {
    if (!amount || !offer?.price) return "0.00";
    try {
      return (parseFloat(amount) * parseFloat(offer.price)).toFixed(2);
    } catch {
      return "0.00";
    }
  }, [amount, offer]);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setOrder(null);
      setPmId("");
      setProofFile(null);
    }
  }, [isOpen]);

  const obj = JSON.parse(sessionStorage.getItem("authUser")) || {};
  const uid = obj?.id;

  // --- API Actions (place, refresh, markPaid, release, cancel, uploadProof, dispute) ---
  const place = async () => {
    if (!amount || !pmId) {
      return Swal.fire("Missing", "Amount and Payment Method are required", "warning");
    }
    Swal.fire({ title: "Placing Order", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await P2PApi.placeOrder({
        uid: uid,
        offer_id: offer.id,
        amount_asset: amount,
        payment_method_id: Number(pmId),
      });
      Swal.close();
      if (res.success) {
        const o = await P2PApi.getOrder({ uid: uid, id: res.order_id });
        setOrder(o.order);
        onUpdated?.();
      } else {
        Swal.fire("Error", res.message || "Failed", "error");
      }
    } catch (e) {
      Swal.close();
      Swal.fire("Error", e.message, "error");
    }
  };

  const refresh = async () => {
    if (!order?.id) return;
    const o = await P2PApi.getOrder({ uid, id: order.id });
    setOrder(o.order);
    onUpdated?.();
  };

  const markPaid = async () => {
    const ok = await Swal.fire({
      title: "Mark as Paid?",
      text: "Confirm that you have sent the fiat payment.",
      icon: "question",
      showCancelButton: true,
    });
    if (!ok.isConfirmed) return;
    await P2PApi.markPaid({
      uid:uid,
      id: order.id,
      payment_method_id: Number(pmId) || undefined,
      amount_paid_fiat: order.amount_fiat,
    });
    await refresh();
    Swal.fire("Marked", "Seller will be notified to release.", "success");
  };

  const release = async () => {
    const ok = await Swal.fire({
      title: "Release Escrow?",
      text: "This will release the asset to the buyer.",
      icon: "warning",
      showCancelButton: true,
    });
    if (!ok.isConfirmed) return;
    await P2PApi.release({uid:uid,id:order.id});
    await refresh();
    Swal.fire("Released", "Order completed.", "success");
  };

  const cancel = async () => {
    const ok = await Swal.fire({
      title: "Cancel Order?",
      text: "This will refund escrow back to seller.",
      icon: "warning",
      showCancelButton: true,
    });
    if (!ok.isConfirmed) return;
    
    await P2PApi.cancel({uid:uid,id:order.id});
    await refresh();
    Swal.fire("Canceled", "Order canceled.", "success");
  };

  const uploadProof = async () => {
    if (!proofFile) return;
    await P2PApi.uploadPaymentProof(order.id, proofFile);
    await refresh();
    Swal.fire("Uploaded", "Payment proof added.", "success");
  };

  const openDispute = async () => {
    const { value: reason } = await Swal.fire({
      title: "Open Dispute",
      input: "select",
      inputOptions: {
        NO_PAYMENT: "No Payment",
        PARTIAL_PAYMENT: "Partial Payment",
        PAYMENT_NOT_RECEIVED: "Payment Not Received",
        SUSPECT_FRAUD: "Suspected Fraud",
        OTHER: "Other",
      },
      inputPlaceholder: "Select a reason",
      showCancelButton: true,
    });
    if (!reason) return;
    await P2PApi.openDispute({ uid:uid, order_id: order.id, reason_code: reason, description: "" });
    await refresh();
    Swal.fire("Dispute Opened", "", "success");
  };

  const deadlineProgress = useMemo(() => {
    if (!order?.payment_deadline_at || order.status !== "PENDING_PAYMENT") return null;
    const end = new Date(order.payment_deadline_at).getTime();
    const start = end - offer.payment_window_minutes * 60 * 1000;
    const now = Date.now();
    const pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
    return Math.round(pct);
  }, [order, offer]);

  const iAmBuyer = order ? order.buyer_id === uid : null;
  const iAmSeller = order ? order.seller_id === uid : null;

  return (
<Modal isOpen={isOpen} toggle={toggle} size="lg" backdrop="static">
  <ModalHeader toggle={toggle}>
    {order ? `Order #${order.id}` : `Place ${offer?.side === "SELL" ? "Buy" : "Sell"} Order`}
  </ModalHeader>
 
  <hr></hr>
  <ModalBody>
    {order ? (
      <>
        {/* --- Order Summary Card --- */}
        <div className="p-3 mb-3 border rounded bg-dark-subtle">
          <Row className="g-3 align-items-center">
            <Col md={3}>
              <Label className="text-muted">Status</Label>
              <div className="fw-bold">
                <span
                  className={`badge px-3 py-2 fs-6 ${
                    order.status === "PENDING_PAYMENT"
                      ? "bg-warning text-dark"
                      : order.status === "PAID"
                      ? "bg-info"
                      : order.status === "RELEASED"
                      ? "bg-success"
                      : order.status === "CANCELED"
                      ? "bg-danger"
                      : "bg-secondary"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </Col>
            <Col md={3}>
              <Label className="text-muted">Price</Label>
              <div className="fw-bold fs-5">
                {parseFloat(order.price_snapshot).toFixed(2)} {order.fiat_code}/{order.asset_code}
              </div>
            </Col>
            <Col md={3}>
              <Label className="text-muted">Amount</Label>
              <div className="fw-bold fs-5">
                {parseFloat(order.amount_asset).toFixed(2)} {order.asset_code}
              </div>
            </Col>
            <Col md={3}>
              <Label className="text-muted">Fiat Total</Label>
              <div className="fw-bold fs-5 text-primary">
                {parseFloat(order.amount_fiat).toFixed(2)} {order.fiat_code}
              </div>
            </Col>
            <Col md={12}>
              <Label className="text-muted">Payment Deadline</Label>
              <div className="fw-semibold">
                {new Date(order.payment_deadline_at).toLocaleString()}
              </div>
              {deadlineProgress !== null && (
                <Progress className="mt-2" color="warning" value={deadlineProgress} />
              )}
            </Col>
          </Row>
        </div>

        {/* --- Actions & Chat --- */}
        <Row className="g-3">
          <Col md={6}>
            <div className="p-3 border rounded h-100">
              <h6 className="fw-bold mb-3">Actions</h6>
              <div className="d-flex flex-column gap-2">
                {iAmBuyer && order.status === "PENDING_PAYMENT" && (
                  <>
                    <Button color="warning" className="fw-bold" onClick={markPaid}>
                      <i className="ri-bank-card-line me-1" /> I Have Paid
                    </Button>
                    <Button color="danger" outline onClick={cancel}>
                      <i className="ri-close-circle-line me-1" /> Cancel
                    </Button>
                    <div>
                      <Label className="text-muted small">Upload Payment Proof</Label>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          onChange={(e) => setProofFile(e.target.files?.[0])}
                        />
                        <Button
                          color="secondary"
                          size="sm"
                          disabled={!proofFile}
                          onClick={uploadProof}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                {iAmSeller && (order.status === "PAID" || order.status === "DISPUTED") && (
                  <Button color="success" className="fw-bold" onClick={release}>
                    <i className="ri-lock-unlock-line me-1" /> Release Escrow
                  </Button>
                )}
                {(iAmBuyer || iAmSeller) &&
                  (order.status === "PENDING_PAYMENT" || order.status === "PAID") && (
                    <Button color="outline-warning" onClick={openDispute}>
                      <i className="ri-flag-2-line me-1" /> Open Dispute
                    </Button>
                  )}
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="p-3 border rounded h-100">
              <h6 className="fw-bold mb-3">Chat</h6>
              <OrderChat orderId={order.id} />
            </div>
          </Col>
        </Row>
      </>
    ) : (
      <>
        {/* --- Place Order View (like earlier code, cleaned) --- */}
        <Row className="g-3">
          <Col md={4}>
            <Label className="fw-semibold">Trader</Label>
            <div className="text-muted">{offer?.username}</div>
          </Col>
          <Col md={4}>
            <Label className="fw-semibold">Price</Label>
            <div className="fw-bold">
              {parseFloat(offer?.price).toFixed(2)} {offer?.fiat} / {offer?.asset}
            </div>
          </Col>
          <Col md={4}>
            <Label className="fw-semibold">Limits</Label>
            <div className="text-muted">
              {parseFloat(offer?.min_amount_asset).toFixed(2)} –{" "}
              {parseFloat(offer?.max_amount_asset).toFixed(2)} {offer?.asset}
            </div>
          </Col>

          <Col md={6}>
            <Label>Amount ({offer?.asset})</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter asset amount"
            />
          </Col>
          <Col md={6}>
            <Label>Payment Method</Label>
            <Input type="select" value={pmId} onChange={(e) => setPmId(e.target.value)}>
              <option value="">Select</option>
              {(offer?.payment_methods || []).map((pm) => (
                <option key={pm.payment_method_id} value={pm.payment_method_id}>
                  {pm.label}
                </option>
              ))}
            </Input>
          </Col>

          <Col md={12}>
            <div className="p-3 bg-light rounded text-center">
              <div className="fw-bold fs-5">
                Total to Pay:&nbsp;
                <span className="fs-4 text-primary">
                  {parseFloat(fiatTotal || 0).toFixed(2)} {offer?.fiat}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </>
    )}
  </ModalBody>

  <ModalFooter>
    {!order ? (
      <>
        <Button color="soft-warning" onClick={toggle}>Close</Button>
        <Button color="primary" onClick={place}>
          <i className="ri-shopping-bag-3-line me-1" /> Place Order
        </Button>
      </>
    ) : (
      <>
        <Button color="primary" onClick={refresh}>Refresh</Button>
        <Button color="soft-warning" onClick={toggle}>Close</Button>
      </>
    )}
  </ModalFooter>
</Modal>

  );
}
