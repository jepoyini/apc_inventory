
// src/pages/P2PTrading/MyOffers.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardHeader, CardBody,
  Row, Col, Input, Button, Badge
} from "reactstrap";
import Swal from "sweetalert2";
import { P2PApi } from "../../helpers/p2p_api";
import EditOfferModal from "./EditOfferModal";
// Optional — only if you have a create modal implemented
// import PostOfferModal from "./PostOfferModal";

const num2 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

const StatusBadge = ({ status }) => {
  const s = String(status || "").toUpperCase();
  const color =
    s === "ACTIVE"   ? "success"   :
    s === "PAUSED"   ? "warning"   :
    s === "HIDDEN"   ? "secondary" :
    s === "ARCHIVED" ? "dark"      :
    s === "CANCELED" ? "danger"    : "secondary";
  return <Badge color={color}>{s}</Badge>;
};

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState("");    // BUY/SELL/empty
  const [statusFilter, setStatusFilter] = useState(""); // ACTIVE/PAUSED/...

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // create modal (if you have one)
  // const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // include inactive so user can manage paused/hidden/archived/canceled offers too
      const res = await P2PApi.myOffers({ include_inactive: true });
      debugger; 
      setOffers(res.offers || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (offers || []).filter((o) => {
      if (sideFilter && String(o.side).toUpperCase() !== sideFilter) return false;
      if (statusFilter && String(o.status).toUpperCase() !== statusFilter) return false;
      if (!term) return true;
      const blob = [
        o.id,
        o.username,
        o.side,
        o.asset,
        o.fiat,
        o.price_type,
        o.status,
        o.terms_text,
      ].join(" ").toLowerCase();
      return blob.includes(term);
    });
  }, [offers, search, sideFilter, statusFilter]);

  const openEdit = (offer) => {
    setSelected(offer);
    setEditOpen(true);
  };

  const changeStatus = async (offer, next) => {
    try {
      const res = await P2PApi.setOfferStatus({ id: offer.id, status: next });
      if (!res.success) throw new Error(res.message || "Failed");
      Swal.fire("Updated", `Offer is now ${next}.`, "success");
      load();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  const cancelOffer = async (offer) => {
    const ok = await Swal.fire({
      title: `Cancel Offer #${offer.id}?`,
      text: "It will no longer be visible to other users.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it",
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await P2PApi.cancelOffer({ offer_id: offer.id });
      if (!res.success) throw new Error(res.message || "Failed");
      Swal.fire("Canceled", "Offer canceled.", "success");
      load();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  const actionButtons = (o) => {
    const s = String(o.status || "").toUpperCase();
    return (
      <div className="d-flex flex-wrap gap-1 justify-content-end">
        <Button size="sm" color="outline-primary" onClick={() => openEdit(o)}>
          Edit
        </Button>
        {s === "ACTIVE" && (
          <>
            <Button size="sm" color="outline-warning" onClick={() => changeStatus(o, "PAUSED")}>
              Pause
            </Button>
            <Button size="sm" color="outline-secondary" onClick={() => changeStatus(o, "HIDDEN")}>
              Hide
            </Button>
          </>
        )}
        {s === "PAUSED" && (
          <Button size="sm" color="outline-success" onClick={() => changeStatus(o, "ACTIVE")}>
            Resume
          </Button>
        )}
        {s === "HIDDEN" && (
          <Button size="sm" color="outline-success" onClick={() => changeStatus(o, "ACTIVE")}>
            Unhide
          </Button>
        )}
        {s !== "ARCHIVED" && (
          <Button size="sm" color="outline-dark" onClick={() => changeStatus(o, "ARCHIVED")}>
            Archive
          </Button>
        )}
        {s !== "CANCELED" && (
          <Button size="sm" color="danger" onClick={() => cancelOffer(o)}>
            Cancel
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <Row className="g-2 align-items-center">
            <Col md={5}>
              <Input
                placeholder="Search id, user, asset, fiat, terms…"
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
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="HIDDEN">Hidden</option>
                <option value="ARCHIVED">Archived</option>
                <option value="CANCELED">Canceled</option>
              </Input>
            </Col>
            <Col md={1} className="d-flex justify-content-end">
              <Button color="success" onClick={load} disabled={loading} style={{ whiteSpace: "nowrap" }}>
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
                  <th>Pair</th>
                  <th>Price</th>
                  <th>Limits</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 160 }}>Updated</th>
                  <th style={{ width: 1 }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="text-muted">#{o.id}</td>
                    <td>
                      <Badge color={o.side === "BUY" ? "info" : "primary"}>{o.side}</Badge>
                    </td>
                    <td className="small">
                      {o.asset} / {o.fiat}
                    </td>
                    <td className="small">
                      {o.price_type === "FLOATING"
                        ? `Floating (${o.float_bps || 0} bps)`
                        : `${num2(o.price)} ${o.fiat}/${o.asset}`}
                    </td>
                    <td className="small">
                      {num2(o.min_amount_asset)} – {num2(o.max_amount_asset)} {o.asset}
                    </td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="small">
                      {o.updated_at ? new Date(o.updated_at).toLocaleString() : "-"}
                    </td>
                    <td>{actionButtons(o)}</td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      {loading ? "Loading offers…" : "No offers found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Toolbar (optional): Post new offer */}
      <div className="d-flex justify-content-end mt-3">
        {/* If you have a PostOfferModal component, uncomment below */}
        {/* <Button color="primary" onClick={() => setCreateOpen(true)}>
          <i className="ri-add-circle-line me-1" /> Post Trade Offer
        </Button> */}
      </div>

      {/* Edit modal */}
      <EditOfferModal
        isOpen={editOpen}
        toggle={() => setEditOpen(false)}
        offer={selected}
        onSaved={load}
      />

      {/* Create modal (optional) */}
      {/* <PostOfferModal
        isOpen={createOpen}
        toggle={() => setCreateOpen(false)}
        onCreated={load}
      /> */}
    </>
  );
}
