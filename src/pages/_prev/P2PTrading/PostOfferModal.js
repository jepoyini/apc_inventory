// src/pages/P2PTrading/PostOfferModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Row, Col, Input, Label
} from "reactstrap";
import Swal from "sweetalert2";
import { P2PApi } from "../../helpers/p2p_api";

export default function PostOfferModal({ isOpen, toggle, onPosted }) {
  const [assets, setAssets] = useState([]);
  const [fiats, setFiats] = useState([]);
  const [methods, setMethods] = useState([]);

  // hidden field: asset defaults to USDT id after catalogs load
  const [assetId, setAssetId] = useState(""); // resolved to USDT id on load

  // visible fields
  const [side, setSide] = useState("SELL");          // SELL / BUY
  const [fiatId, setFiatId] = useState("");
  const [priceType, setPriceType] = useState("FIXED");
  const [price, setPrice] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [windowMin, setWindowMin] = useState("15");  // default 15 (as requested)
  const [terms, setTerms] = useState("");
  const [pmIds, setPmIds] = useState([]);

  const resetState = () => {
    setSide("SELL");
    setFiatId("");
    setPriceType("FIXED");
    setPrice("");
    setMinAmt("");
    setMaxAmt("");
    setWindowMin("15");
    setTerms("");
    setPmIds([]);
  };

  const loadCatalogs = async () => {
    const [a, f, pm] = await Promise.all([
      P2PApi.listAssets(),        // POST
      P2PApi.listFiats(),         // POST
      P2PApi.listPaymentMethods() // POST
    ]);
    const assetsArr = a.assets || [];
    setAssets(assetsArr);
    setFiats(f.fiats || []);
    setMethods(pm.payment_methods || []);

    // resolve USDT id and set
    const usdt = assetsArr.find((x) => String(x.code).toUpperCase() === "USDT");
    setAssetId(usdt ? usdt.id : "");
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
      loadCatalogs();
    }
    
  }, [isOpen]);

  const togglePm = (id) => {
    setPmIds((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  };

  const submit = async () => {
    // assetId must be resolved to USDT
    if (!assetId) {
      return Swal.fire("Missing", "USDT asset not found in catalog.", "error");
    }
    if (!fiatId) {
      return Swal.fire("Missing", "Select a fiat currency.", "warning");
    }
    if (priceType === "FIXED" && !price) {
      return Swal.fire("Missing", "Enter a fixed price.", "warning");
    }
    if (!minAmt || !maxAmt) {
      return Swal.fire("Missing", "Enter min and max amounts.", "warning");
    }
    if (pmIds.length === 0) {
      return Swal.fire("Missing", "Select at least one payment method.", "warning");
    }

   const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj.id;   

    const payload = {
      uid: uid,
      side: side,
      asset_id: Number(assetId),               // hidden but forced to USDT
      fiat_id: Number(fiatId),
      price_type: priceType,
      price: priceType === "FIXED" ? price : undefined,
      min_amount_asset: minAmt,
      max_amount_asset: maxAmt,
      payment_window_minutes: Number(windowMin),
      terms_text: terms,
      payment_method_ids: pmIds
    };

    Swal.fire({
      title: "Publishing Offer",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    try {
      const res = await P2PApi.createOffer(payload);
      Swal.close();
      if (res.success) {
        Swal.fire("Published", "Your offer is now active.", "success");
        onPosted?.();
        toggle();
      } else {
        Swal.fire("Error", res.message || "Failed", "error");
      }
    } catch (e) {
      Swal.close();
      Swal.fire("Error", e.message || "Failed", "error");
    }
  };

  return (
<Modal isOpen={isOpen} toggle={toggle} size="lg" backdrop="static">
  <ModalHeader toggle={toggle}>Post Trade Offer</ModalHeader>
  <hr></hr>
  <br></br>  
  <ModalBody>
    <Row className="g-3">
      {/* Type */}
      <Col md={4}>
        <Label>Type</Label>
        <Input
          type="select"
          value={side}
          onChange={(e) => setSide(e.target.value)}
        >
          <option value="SELL">Sell (you sell USDT)</option>
          <option value="BUY">Buy (you buy USDT)</option>
        </Input>
      </Col>

      {/* Fiat */}
      <Col md={4}>
        <Label>Fiat</Label>
        <Input type="select" value={fiatId} onChange={(e) => setFiatId(e.target.value)}>
          <option value="">Select</option>
          {fiats.map((f) => (
            <option key={f.id} value={f.id}>{f.code}</option>
          ))}
        </Input>
      </Col>

      {/* Payment Time Limit */}
      <Col md={4}>
        <Label>Payment Time Limit</Label>
        <Input
          type="select"
          value={windowMin}
          onChange={(e) => setWindowMin(e.target.value)}
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
          <option value="180">180 minutes</option>
          <option value="360">360 minutes</option>
        </Input>
      </Col>

      {/* Pricing */}
      <Col md={4}>
        <Label>Pricing</Label>
        <Input type="select" value={priceType} onChange={(e) => setPriceType(e.target.value)}>
          <option value="FIXED">Fixed</option>
          <option value="FLOATING">Floating</option>
        </Input>
      </Col>

      {/* Price */}
      <Col md={4}>
        <Label>Price (for Fixed)</Label>
        <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 1.00" />
      </Col>

      {/* Min Amount */}
      <Col md={4}>
        <Label>Min Amount (USDT)</Label>
        <Input value={minAmt} onChange={(e) => setMinAmt(e.target.value)} placeholder="e.g. 10" />
      </Col>

      {/* Max Amount */}
      <Col md={4}>
        <Label>Max Amount (USDT)</Label>
        <Input value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} placeholder="e.g. 500" />
      </Col>

      {/* Terms - full width */}
      <Col md={12}>
        <Label>Terms</Label>
        <Input
          type="textarea"
          rows="3"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="e.g. Release only after Zelle confirmation. No third-party payments."
        />
      </Col>

      {/* Payment Methods - full width */}
      <Col md={12}>
        <Label>Payment Methods</Label>
        <div className="d-flex flex-wrap gap-2">
          {methods.map((m) => (
            <Button
              key={m.id}
              size="sm"
              color={pmIds.includes(m.id) ? "secondary" : "primary"}
              outline={!pmIds.includes(m.id)}
              onClick={() => togglePm(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </Col>
    </Row>
  </ModalBody>
  <ModalFooter>
    <Button color="soft-warning" onClick={toggle}>Cancel</Button>
    <Button color="primary" onClick={submit}>
      <i className="ri-check-line me-1" />
      Publish
    </Button>
  </ModalFooter>
</Modal>

  );
}



















