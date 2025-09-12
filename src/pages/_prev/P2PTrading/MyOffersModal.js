// src/pages/P2PTrading/MyOffersModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Card, CardHeader, CardBody,
  Row, Col, Input, Button, Badge
} from "reactstrap";
import Swal from "sweetalert2";
import { P2PApi } from "../../helpers/p2p_api";
import EditOfferModal from "./EditOfferModal";
import TableContainer from "../../Components/Common/TableContainerReactTable";

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

export default function MyOffersModal({ isOpen, toggle }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await P2PApi.myOffers({ include_inactive: true });
      setOffers(res.offers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (offers || []).filter((o) => {
      if (sideFilter && String(o.side).toUpperCase() !== sideFilter) return false;
      if (statusFilter && String(o.status).toUpperCase() !== statusFilter) return false;
      if (!term) return true;
      const blob = [
        o.id, o.username, o.side, o.asset, o.fiat, o.price_type, o.status, o.terms_text
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
      <div className="d-flex flex-nowrap gap-1">
        <Button size="sm" color="outline-primary" onClick={() => openEdit(o)}>Edit</Button>
        {s === "ACTIVE" && (
          <>
            <Button size="sm" color="outline-warning" onClick={() => changeStatus(o, "PAUSED")}>Pause</Button>
            <Button size="sm" color="outline-secondary" onClick={() => changeStatus(o, "HIDDEN")}>Hide</Button>
          </>
        )}
        {s === "PAUSED" && (
          <Button size="sm" color="outline-success" onClick={() => changeStatus(o, "ACTIVE")}>Resume</Button>
        )}
        {s === "HIDDEN" && (
          <Button size="sm" color="outline-success" onClick={() => changeStatus(o, "ACTIVE")}>Unhide</Button>
        )}
        {s !== "ARCHIVED" && (
          <Button size="sm" color="outline-dark" onClick={() => changeStatus(o, "ARCHIVED")}>Archive</Button>
        )}
        {s !== "CANCELED" && (
          <Button size="sm" color="danger" onClick={() => cancelOffer(o)}>Cancel</Button>
        )}
      </div>
    );
  };

  const columns = useMemo(() => [
    { header: "#",      enableColumnFilter: false, accessorKey: "id", cell: (cell) => <span className="text-muted">#{cell.getValue()}</span>, size: 70 },
    { header: "Type",       enableColumnFilter: false,accessorKey: "side", cell: (cell) => (
        <Badge color={cell.getValue() === "BUY" ? "info" : "primary"}>{cell.getValue()}</Badge>
      ), size: 80 },
    { header: "Pair",      enableColumnFilter: false, accessorKey: "pair", cell: (cell) => {
        const row = cell.row.original;
        return `${row.asset} / ${row.fiat}`;
      }},
    { header: "Price",       enableColumnFilter: false,accessorKey: "price", cell: (cell) => {
        const row = cell.row.original;
        return row.price_type === "FLOATING"
          ? `Floating (${row.float_bps || 0} bps)`
          : `${num2(row.price)} ${row.fiat}/${row.asset}`;
      }},
    { header: "Limits",      enableColumnFilter: false, accessorKey: "limits", cell: (cell) => {
        const row = cell.row.original;
        return `${num2(row.min_amount_asset)} – ${num2(row.max_amount_asset)} ${row.asset}`;
      }},
    { header: "Status",      enableColumnFilter: false, accessorKey: "status", cell: (cell) => <StatusBadge status={cell.getValue()} />, size: 120 },
    { header: "Updated",      enableColumnFilter: false, accessorKey: "updated_at", cell: (cell) => cell.getValue() ? new Date(cell.getValue()).toLocaleString() : "-", size: 160 },
    { header: "Actions",      enableColumnFilter: false, accessorKey: "actions", cell: (cell) => actionButtons(cell.row.original), size: 300 },
  ], []);

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="xl" backdrop="static">
        <ModalHeader toggle={toggle}>My Trade Offers</ModalHeader>
        <hr />

        <ModalBody>
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
                  <Input type="select" value={sideFilter} onChange={(e) => setSideFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                  </Input>
                </Col>
                <Col md={3}>
                  <Input type="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="HIDDEN">Hidden</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="CANCELED">Canceled</option>
                  </Input>
                </Col>
                <Col md={1} className="d-flex justify-content-end">
                  <Button color="soft-warning" onClick={load} disabled={loading}>
                    {loading ? "..." : "Refresh"}
                  </Button>
                </Col>
              </Row>
            </CardHeader>

            <CardBody>
              <TableContainer
                columns={columns}
                data={filtered}
                customPageSize={10}
                maxLength={1}
                currentPage={1}
                totalPages={1}
                isExtraFeature={true}
                isGlobalFilter={false}
                isAddOptions={false}
                className="custom-header-css"
                theadClass="table-light"
                divClass="table-responsive table-card mb-3"
                tableClass="align-middle table-nowrap"
              />
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button color="soft-warning" onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>

      <EditOfferModal
        isOpen={editOpen}
        toggle={() => setEditOpen(false)}
        offer={selected}
        onSaved={load}
      />
    </>
  );
}
