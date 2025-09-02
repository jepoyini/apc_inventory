import React, { useEffect, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Row, Col, Input, Label
} from "reactstrap";
import Swal from "sweetalert2";
import { P2PApi } from "../../helpers/p2p_api";

export default function PaymentMethodsModal({ isOpen, toggle }) {
  const [catalog, setCatalog] = useState([]);
  const [items, setItems] = useState([]);
  const [payment_method_id, setPm] = useState("");
  const [account_label, setLabel] = useState("");
  const [account_details, setDetails] = useState({});

  const load = async () => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj?.id;
    if (!uid) return;
    const [cat, mine] = await Promise.all([
      P2PApi.listPaymentMethods(),
      P2PApi.myPaymentMethods(uid),
    ]);
    setCatalog(cat.payment_methods || []);
    setItems(mine.items || []);
  };

  useEffect(() => { if (isOpen) load(); }, [isOpen]);

  const add = async () => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj?.id;
    if (!uid) return;

    try {
      if (!payment_method_id || !account_label) {
        return Swal.fire("Missing", "Select method and label", "warning");
      }
      const payload = {
        uid,
        payment_method_id: Number(payment_method_id),
        account_label,
        account_details,
      };
      await P2PApi.addMyPaymentMethod(payload);
      setPm(""); setLabel(""); setDetails({});
      await load();
      Swal.fire("Saved", "Payment method added", "success");
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  const remove = async (id) => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj?.id;
    if (!uid) return;

    const ok = await Swal.fire({
      title: "Delete?",
      text: "Remove this method?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!ok.isConfirmed) return;

    await P2PApi.deleteMyPaymentMethod({ uid, id });
    await load();
  };

  return (
<Modal isOpen={isOpen} toggle={toggle} size="lg">
  <ModalHeader toggle={toggle} >
    My Payment Methods
  </ModalHeader>
  <hr></hr>
  <br></br>
  <ModalBody>
    <Row className="g-3">
      <Col md={4}>
        <Label>Method</Label>
        <Input type="select" value={payment_method_id} onChange={(e) => setPm(e.target.value)}>
          <option value="">Select</option>
          {catalog.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </Input>
      </Col>
      <Col md={4}>
        <Label>Account Label</Label>
        <Input
          value={account_label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Chase Checking"
        />
      </Col>
      <Col md={4}>
        <Label>Account Name</Label>
        <Input
          onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
          placeholder="e.g. John Doe"
        />
      </Col>
      <Col md={6}>
        <Label>Account Number</Label>
        <Input
          onChange={(e) => setDetails((d) => ({ ...d, number: e.target.value }))}
          placeholder="e.g. 1234567890"
        />
      </Col>
      <Col md={6}>
        <Label>Routing Number</Label>
        <Input
          onChange={(e) => setDetails((d) => ({ ...d, routing: e.target.value }))}
          placeholder="e.g. 021000021"
        />
      </Col>
      <Col md={12}>
        <Label>Extra Info (optional)</Label>
        <Input
          onChange={(e) => setDetails((d) => ({ ...d, note: e.target.value }))}
          placeholder="e.g. PayPal email, Zelle email, branch info"
        />
      </Col>
      <Col md={12}>
        <Button className="btn-soft-warning waves-effect waves-light" onClick={add}>
          <i className="ri-add-circle-line me-1" />
          Add
        </Button>
      </Col>
    </Row>

    <hr />
    <h6 className="mb-3">Saved Payment Methods</h6>
    <div className="table-responsive">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Method</th>
            <th>Label</th>
            <th>Details</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.label}</td>
              <td>{it.account_label}</td>
              <td>
                {(() => {
                  let details = {};
                  try {
                    details = typeof it.account_details === "string"
                      ? JSON.parse(it.account_details)
                      : it.account_details;
                  } catch (e) {
                    details = {};
                  }
                  return (
                    <div className="text-muted small">
                      {Object.entries(details).map(([k, v]) => {
                        const label = k.charAt(0).toUpperCase() + k.slice(1);
                        return (
                          <div key={k}>
                            <strong>{label}:</strong> {v}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </td>
              <td className="text-end">
                <Button color="danger" size="sm" onClick={() => remove(it.id)}>
                  <i className="ri-delete-bin-6-line" />
                </Button>
              </td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No payment methods yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </ModalBody>
  <ModalFooter>
    <Button className="btn-soft-warning waves-effect waves-light" onClick={toggle}>
      Close
    </Button>
  </ModalFooter>
</Modal>

  );
}
