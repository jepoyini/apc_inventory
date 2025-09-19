// src/pages/Inventory/index.jsx
import React, { useMemo, useState } from "react";
import {
  Container, Row, Col,
  Card, CardHeader, CardBody,
  Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Label
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const WAREHOUSES = ["Main Warehouse", "Japan Warehouse", "USA Warehouse"];
const CATEGORIES = ["Awards", "Trophies", "Nameplates", "Plaques", "Certificates"];
const STATUSES = ["In Stock", "In Transit", "Disposed"];

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "Premium Award Plaque",
    description: "High-quality crystal award plaque with custom engraving",
    sku: "APF747",
    qrCode: "QR001APF747",
    category: "Awards",
    warehouse: "Main Warehouse",
    quantity: 150,
    status: "In Stock",
    createdBy: "Bryan Hamer",
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "p2",
    name: "Corporate Recognition Trophy",
    description: "Metal trophy for corporate recognition ceremonies",
    sku: "CRT892",
    qrCode: "QR002CRT892",
    category: "Trophies",
    warehouse: "Japan Warehouse",
    quantity: 75,
    status: "In Transit",
    createdBy: "Sarah Johnson",
    createdAt: "2024-01-20T08:00:00.000Z",
  },
  {
    id: "p3",
    name: "Custom Nameplate",
    description: "Personalized nameplate for office desks",
    sku: "CNP456",
    qrCode: "QR003CNP456",
    category: "Nameplates",
    warehouse: "USA Warehouse",
    quantity: 300,
    status: "In Stock",
    createdBy: "Mike Chen",
    createdAt: "2024-01-26T08:00:00.000Z",
  },
];

const statusBadgeClass = (s) =>
  s === "In Stock"   ? "badge bg-success-subtle text-success" :
  s === "In Transit" ? "badge bg-warning-subtle text-warning" :
  s === "Disposed"   ? "badge bg-danger-subtle text-danger"   :
                       "badge bg-secondary-subtle text-secondary";

const Inventory = () => {
  document.title = "Inventory Management | PNP Inventory";

  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // filters
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return products.filter((p) => {
      const matchesTerm =
        !t ||
        p.name.toLowerCase().includes(t) ||
        p.sku.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t);
      const matchesStatus = status === "all" || p.status === status;
      const matchesWh = warehouse === "all" || p.warehouse === warehouse;
      const matchesCat = category === "all" || p.category === category;
      return matchesTerm && matchesStatus && matchesWh && matchesCat;
    });
  }, [products, term, status, warehouse, category]);

  // QR dialog
  const [qrOpen, setQrOpen] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);

  const showQR = (p) => { setQrProduct(p); setQrOpen(true); };

  // Add Product modal
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", qrCode: "", description: "",
    category: CATEGORIES[0], warehouse: WAREHOUSES[0],
    quantity: 0, status: "In Stock", createdBy: "System",
  });

  const onAdd = () => {
    if (!form.name || !form.sku || !form.qrCode) return;
    const now = new Date().toISOString();
    setProducts((prev) => [
      { id: String(Date.now()), createdAt: now, ...form },
      ...prev,
    ]);
    setAddOpen(false);
    setForm({ ...form, name: "", sku: "", qrCode: "", description: "", quantity: 0 });
  };

  const onDelete = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const clearFilters = () => {
    setTerm(""); setStatus("all"); setWarehouse("all"); setCategory("all");
  };

  const exportData = () => {
    const str = JSON.stringify(filtered, null, 2);
    const uri = "data:application/json;charset=utf-8," + encodeURIComponent(str);
    const a = document.createElement("a");
    a.href = uri; a.download = "inventory_export.json"; a.click();
  };

  return (
    <div className="page-content">
      <Container fluid>
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
          <div>
            <BreadCrumb title="Inventory Management" pageTitle="Dashboard" url="/dashboard" />
            <div className="text-muted">Manage your products and track inventory levels</div>
          </div>
          <div className="d-flex gap-2">
            <Button color="light" onClick={exportData}>
              <i className="ri-download-2-line me-1" /> Export
            </Button>
            <Button color="dark" onClick={() => setAddOpen(true)}>
              <i className="ri-add-line me-1" /> Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mt-3">
          <CardBody>
            <Row className="g-3">
              <Col md={5} lg={3}>
                <div className="position-relative">
                  <i className="ri-search-line position-absolute top-50 translate-middle-y ms-3 text-muted" />
                  <Input
                    className="ps-5"
                    placeholder="Search products..."
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  />
                </div>
              </Col>
              <Col md={3} lg={3}>
                <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Input>
              </Col>
              <Col md={4} lg={3}>
                <Input type="select" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                  <option value="all">All Warehouses</option>
                  {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
                </Input>
              </Col>
              <Col md={4} lg={2}>
                <Input type="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Input>
              </Col>
              <Col md={3} lg={1} className="d-grid">
                <Button color="light" onClick={clearFilters}>
                  <i className="ri-filter-3-line me-1" /> Clear
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Summary */}
        <div className="text-muted mt-2">Showing {filtered.length} of {products.length} products</div>

        {/* Grid */}
        <Row className="g-3 mt-1">
          {filtered.map((p) => (
            <Col md={6} xl={4} key={p.id}>
              <Card className="h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="mb-0">{p.name}</h5>
                    <span className={statusBadgeClass(p.status)}>{p.status}</span>
                  </div>
                  <div className="text-muted mb-3">{p.description}</div>

                  <Row className="g-2 small">
                    <Col xs={6}><span className="text-muted">SKU:</span> <span className="fw-semibold">{p.sku}</span></Col>
                    <Col xs={6} className="text-truncate"><span className="text-muted">QR:</span> <span className="font-monospace">{p.qrCode}</span></Col>
                    <Col xs={6}><span className="text-muted">Category:</span> {p.category}</Col>
                    <Col xs={6}><span className="text-muted">Quantity:</span> <span className="fw-semibold text-success">{p.quantity}</span></Col>
                    <Col xs={12}><span className="text-muted">Warehouse:</span> <span className="fw-medium">{p.warehouse}</span></Col>
                  </Row>

                  <div className="small text-muted mt-3">
                    Created by {p.createdBy} on {new Date(p.createdAt).toLocaleDateString()}
                  </div>

                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <Button color="light" onClick={() => showQR(p)}>
                      <i className="ri-qr-code-line me-1" /> QR Code
                    </Button>
                    <div className="d-flex gap-2">
                      <Button color="light" outline title="Edit"><i className="ri-edit-line" /></Button>
                      <Button color="light" outline className="text-danger" title="Delete" onClick={() => onDelete(p.id)}>
                        <i className="ri-delete-bin-6-line" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {filtered.length === 0 && (
          <div className="text-center text-muted py-5">No products found. Adjust filters or add a product.</div>
        )}

        {/* QR Modal */}
        <Modal isOpen={qrOpen} toggle={() => setQrOpen(false)} centered>
          <ModalHeader toggle={() => setQrOpen(false)}>
            QR Code — {qrProduct?.name}
          </ModalHeader>
          <ModalBody className="text-center">
            <div className="border border-dashed rounded p-4 mb-3">
              <div style={{ fontSize: 56 }}>📱</div>
              <div className="text-muted">QR Code would appear here</div>
            </div>
            <div className="fw-semibold font-monospace">{qrProduct?.qrCode}</div>
            <div className="text-muted small">SKU: {qrProduct?.sku}</div>
            <div className="text-muted small">Scan this code to track the product</div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setQrOpen(false)}>Close</Button>
          </ModalFooter>
        </Modal>

        {/* Add Product Modal */}
        <Modal isOpen={addOpen} toggle={() => setAddOpen(false)} size="lg" centered>
          <ModalHeader toggle={() => setAddOpen(false)}>Add Product</ModalHeader>
          <ModalBody>
            <Row className="g-3">
              <Col md={6}>
                <Label className="form-label">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Col>
              <Col md={6}>
                <Label className="form-label">SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </Col>
              <Col md={12}>
                <Label className="form-label">Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Col>
              <Col md={6}>
                <Label className="form-label">QR Code</Label>
                <Input value={form.qrCode} onChange={(e) => setForm({ ...form, qrCode: e.target.value })} />
              </Col>
              <Col md={6}>
                <Label className="form-label">Quantity</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value || 0) })} />
              </Col>
              <Col md={4}>
                <Label className="form-label">Status</Label>
                <Input type="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Input>
              </Col>
              <Col md={4}>
                <Label className="form-label">Category</Label>
                <Input type="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Input>
              </Col>
              <Col md={4}>
                <Label className="form-label">Warehouse</Label>
                <Input type="select" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
                  {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
                </Input>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button color="primary" onClick={onAdd}>Save</Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default Inventory;
