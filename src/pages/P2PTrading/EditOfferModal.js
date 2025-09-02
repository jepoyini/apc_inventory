// src/pages/P2PTrading/EditOfferModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Row, Col, Input, Label, Button, Badge
} from "reactstrap";
import Swal from "sweetalert2";
import { P2PApi } from "../../helpers/p2p_api";

const num2 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "";
};

export default function EditOfferModal({ isOpen, toggle, offer, onSaved }) {
  const [priceType, setPriceType] = useState("FIXED");
  const [price, setPrice] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [terms, setTerms] = useState("");
  const [windowMin, setWindowMin] = useState(15);
  const [methods, setMethods] = useState([]);         // catalog
  const [pmIds, setPmIds] = useState([]);             // selected
  const [saving, setSaving] = useState(false);

  // prime fields from offer
  useEffect(() => {
    if (!isOpen) return;
    if (offer) {
      setPriceType(offer.price_type || "FIXED");
      setPrice(offer.price ? String(offer.price) : "");
      setMinAmt(offer.min_amount_asset ? String(offer.min_amount_asset) : "");
      setMaxAmt(offer.max_amount_asset ? String(offer.max_amount_asset) : "");
      setTerms(offer.terms_text || "");
      setWindowMin(offer.payment_window_minutes || 15);
      setPmIds((offer.payment_methods || []).map((x) => x.payment_method_id));
    }
    // load payment methods catalog for the chips
    (async () => {
      try {
        const cat = await P2PApi.listPaymentMethods();
        setMethods(cat.payment_methods || []);
      } catch (e) {
        // no-op
      }
    })();
  }, [isOpen, offer]);

  const statusBadge = useMemo(() => {
    const s = (offer?.status || "ACTIVE").toUpperCase();
    const color =
      s === "ACTIVE" ? "success" :
      s === "PAUSED" ? "warning" :
      s === "HIDDEN" ? "secondary" :
      s === "ARCHIVED" ? "dark" : "secondary";
    return <Badge color={color}>{s}</Badge>;
  }, [offer]);

  const togglePm = (id) => {
    setPmIds((curr) => (
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]
    ));
  };

  const validate = () => {
    if (!offer?.id) return "Missing offer id";
    if (priceType === "FIXED" && (!price || Number(price) <= 0)) return "Price must be > 0";
    if (!minAmt || Number(minAmt) <= 0) return "Min amount must be > 0";
    if (!maxAmt || Number(maxAmt) < Number(minAmt)) return "Max amount must be ≥ min amount";
    if (!pmIds.length) return "Select at least one payment method";
    return null;
    // (we only validate local fields; server enforces asset/fiat/side)
  };

  const save = async () => {
    const err = validate();
    if (err) return Swal.fire("Invalid", err, "warning");

    setSaving(true);
    try {
      const payload = {
        offer_id: offer.id,
        // optional fields – only send if changed or present
        price: priceType === "FIXED" ? price : undefined,
        min_amount_asset: minAmt,
        max_amount_asset: maxAmt,
        terms_text: terms,
        payment_window_minutes: windowMin,
        // if you want to allow updating method list in backend, add route to replace set
        payment_method_ids: pmIds
      };
      const res = await P2PApi.modifyOffer(payload);
      if (!res.success) throw new Error(res.message || "Failed to save");
      Swal.fire("Saved", "Offer updated.", "success");
      onSaved?.(); // refresh list outside
      toggle();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelOffer = async () => {
    const ok = await Swal.fire({
      title: "Cancel this offer?",
      text: "It will no longer appear to other users.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it"
    });
    if (!ok.isConfirmed) return;

    setSaving(true);
    try {
      const res = await P2PApi.cancelOffer({ offer_id: offer.id });
      if (!res.success) throw new Error(res.message || "Failed to cancel");
      Swal.fire("Canceled", "Offer canceled.", "success");
      onSaved?.();
      toggle();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status) => {
    setSaving(true);
    try {
      const res = await P2PApi.setOfferStatus({ id: offer.id, status });
      if (!res.success) throw new Error(res.message || "Failed to update status");
      Swal.fire("Updated", `Offer is now ${status}.`, "success");
      onSaved?.();
      toggle();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!offer) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" backdrop="static">
      <ModalHeader toggle={toggle}>Edit Offer #{offer.id} &nbsp; {statusBadge}</ModalHeader>
      <ModalBody>
        <Row className="g-3">
          {/* Row 1: immutable info */}
          <Col md={4}>
            <Label className="text-muted">Type</Label>
            <div className="fw-semibold">{offer.side}</div>
          </Col>
          <Col md={4}>
            <Label className="text-muted">Asset / Fiat</Label>
            <div className="fw-semibold">{offer.asset} / {offer.fiat}</div>
          </Col>
          <Col md={4}>
            <Label className="text-muted">Window (mins)</Label>
            <Input
              type="select"
              value={String(windowMin)}
              onChange={(e) => setWindowMin(Number(e.target.value))}
            >
              {[15,30,45,60,180,360].map(v => <option key={v} value={v}>{v}</option>)}
            </Input>
          </Col>

          {/* Row 2: pricing and limits */}
          <Col md={4}>
            <Label>Pricing</Label>
            <Input
              type="select"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              disabled
              title="Change via new offer if you need to switch pricing mode"
            >
              <option value="FIXED">Fixed</option>
              <option value="FLOATING">Floating</option>
            </Input>
            <div className="form-text">Pricing mode cannot be changed here.</div>
          </Col>
          <Col md={4}>
            <Label>Price (Fixed)</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 56.25"
              disabled={priceType !== "FIXED"}
            />
          </Col>
          <Col md={2}>
            <Label>Min Amount</Label>
            <Input
              value={minAmt}
              onChange={(e) => setMinAmt(e.target.value)}
              placeholder="e.g. 10"
            />
          </Col>
          <Col md={2}>
            <Label>Max Amount</Label>
            <Input
              value={maxAmt}
              onChange={(e) => setMaxAmt(e.target.value)}
              placeholder="e.g. 500"
            />
          </Col>

          {/* Row 3: terms */}
          <Col md={12}>
            <Label>Terms</Label>
            <Input
              type="textarea"
              rows="3"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Your trade terms and instructions to the counterparty"
            />
          </Col>

          {/* Row 4: payment methods */}
          <Col md={12}>
            <Label>Payment Methods</Label>
            <div className="d-flex flex-wrap gap-2">
              {methods.map((m) => {
                const on = pmIds.includes(m.id);
                return (
                  <Button
                    key={m.id}
                    size="sm"
                    color={on ? "primary" : "secondary"}
                    outline={!on}
                    onClick={() => togglePm(m.id)}
                  >
                    {m.label}
                  </Button>
                );
              })}
              {!methods.length && <div className="text-muted small">No methods configured.</div>}
            </div>
            <div className="form-text">
              Tip: Manage your own receivable accounts in <strong>Payment Methods</strong>.
            </div>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter className="justify-content-between">
        <div className="d-flex gap-2">
          <Button color="secondary" outline onClick={() => setStatus("PAUSED")} disabled={saving}>
            Pause
          </Button>
          <Button color="secondary" outline onClick={() => setStatus("HIDDEN")} disabled={saving}>
            Hide
          </Button>
          <Button color="dark" outline onClick={() => setStatus("ARCHIVED")} disabled={saving}>
            Archive
          </Button>
          <Button color="danger" onClick={cancelOffer} disabled={saving}>
            Cancel Offer
          </Button>
        </div>

        <div className="d-flex gap-2">
          <Button color="soft-warning" onClick={toggle} disabled={saving}>Close</Button>
          <Button color="primary" onClick={save} disabled={saving}>
            <i className="ri-save-3-line me-1" /> Save Changes
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
