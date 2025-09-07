// src/pages/Inventory/Products.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import CountUp from "react-countup";
import {
  CardBody, Row, Col, Input, Card, Container, CardHeader,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Label,
  FormGroup, Badge, Progress
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { APIClient } from "../../helpers/api_helper";

/**
 * Products Page
 * - Mirrors the MGX designs: tiles, filters, tag chips, grid cards
 * - Details modal with tabs: Overview, Images, Quantity, Tracking, Specs
 * - QR Generator modal
 * - Direct-POST endpoints (see ProductController)
 */

const peso = (n) => Number(n || 0).toLocaleString("en-PH", { style: "currency", currency: "PHP" });
const fmt = (n) => Number(n || 0).toLocaleString();

const TagChip = ({ label, onClick, active }) => (
  <Button
    size="sm"
    color={active ? "primary" : "light"}
    className="me-2 mb-2"
    onClick={onClick}
  >
    {label}
  </Button>
);

const Products = () => {
  document.title = "Products | IBOPRO";
  const api = new APIClient();

  // tiles summary
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    activeProducts: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  // table/grid state
  const [view, setView] = useState("grid");
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // filters
  const searchRef = useRef("");
  const categoryRef = useRef("");
  const statusRef = useRef("");
  const stockRef = useRef("");
  const warehouseRef = useRef("");
  const [tagUniverse, setTagUniverse] = useState([
    "premium", "wood", "metal", "crystal", "plastic", "custom", "engraving",
    "corporate", "achievement", "recognition", "sports", "academic", "office", "aluminum"
  ]);
  const [tags, setTags] = useState([]);

  // modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // forms
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    status: "active",
    price: 0,
    cost: 0,
    default_warehouse_id: "",
    reorder_point: 0,
    tags: [],
    brand: "",
    model: "",
    description: "",
  });

  const [qrForm, setQrForm] = useState({
    format: "SKU",
    includeText: true,
    text: "",
    payload: "",
  });

  // details payload
  const [details, setDetails] = useState({ product: null, images: [], stock: {}, items: [], events: [], specs: {} });

  const load = async (page) => {
    try {
      const body = {
        page,
        limit: pageSize,
        search: searchRef.current || "",
        category: categoryRef.current || "",
        warehouse: warehouseRef.current || "",
        status: statusRef.current || "",
        stockLevel: stockRef.current || "",
        tags,
      };
      const r = await api.post(`/products`, body);
      const list = r?.products || [];
      setRows(list);
      const total = r?.totalRecords || list.length;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      setSummary(r?.summary || summary);
    } catch (e) {
      toast.error("Error loading products");
    }
  };

  useEffect(() => { load(currentPage); /* eslint-disable-next-line */ }, [currentPage]);

  const onFilterChange = () => { setCurrentPage(1); load(1); };
  const clearFilters = () => {
    searchRef.current = ""; categoryRef.current = ""; statusRef.current = ""; stockRef.current = ""; warehouseRef.current = ""; setTags([]); onFilterChange();
  };

  // CRUD
  const onCreate = () => { setCurrentId(null); setForm({
    sku: "", name: "", category: "", status: "active", price: 0, cost: 0, default_warehouse_id: "", reorder_point: 0, tags: [], brand: "", model: "", description: ""
  }); setCreateModal(true); };

  const onCreateSubmit = async () => {
    try {
      if (!form.sku || !form.name || !form.category) { Swal.fire("Missing fields","SKU, Name, Category required","warning"); return; }
      await api.post(`/products/create`, {
        ...form,
        price: Number(form.price||0),
        cost: Number(form.cost||0),
        default_warehouse_id: Number(form.default_warehouse_id||0),
        reorder_point: Number(form.reorder_point||0),
      });
      setCreateModal(false); load(currentPage); toast.success("Product added");
    } catch { toast.error("Create failed"); }
  };

  const onEditAsk = (row) => { setCurrentId(row.id); setForm({
    sku: row.sku, name: row.name, category: row.category, status: row.status,
    price: row.price, cost: row.cost, default_warehouse_id: row.default_warehouse_id||"",
    reorder_point: row.reorder_point||0, tags: row.tags||[], brand: row.brand||"", model: row.model||"", description: row.description||""
  }); setEditModal(true); };

  const onEditSubmit = async () => {
    try {
      await api.post(`/products/${currentId}/update`, {
        ...form,
        price: Number(form.price||0), cost: Number(form.cost||0), default_warehouse_id: Number(form.default_warehouse_id||0), reorder_point: Number(form.reorder_point||0)
      });
      setEditModal(false); load(currentPage); toast.success("Product updated");
    } catch { toast.error("Update failed"); }
  };

  const onDeleteAsk = (id) => {
    Swal.fire({ title: "Delete product?", text: "This cannot be undone.", icon: "warning", showCancelButton: true }).then(async (r) => {
      if (r.isConfirmed) {
        try { await api.post(`/products/${id}/delete`, {}); load(currentPage); toast.success("Deleted"); } catch { toast.error("Delete failed"); }
      }
    });
  };

  // details
  const onView = async (id) => {
    try {
      const r = await api.post(`/products/${id}/details`, {});
      setDetails(r || { product:null, images:[], stock:{}, items:[], events:[], specs:{} });
      setActiveTab("overview");
      setDetailsModal(true);
    } catch { toast.error("Failed to load details"); }
  };

  // QR
  const onQR = async (row) => {
    try {
      const r = await api.post(`/products/${row.id}/qr`, { format: qrForm.format, text: qrForm.text });
      setQrForm((s)=>({ ...s, payload: r?.payload || "" }));
      setCurrentId(row.id);
      setQrModal(true);
    } catch { toast.error("QR init failed"); }
  };

  const regenerateQR = async () => {
    try {
      const r = await api.post(`/products/${currentId}/qr`, { format: qrForm.format, text: qrForm.text });
      setQrForm((s)=>({ ...s, payload: r?.payload || "" }));
    } catch { toast.error("QR generate failed"); }
  };

  // helpers
  const tagActive = (t) => tags.includes(t);
  const toggleTag = (t) => setTags((s)=> tagActive(t) ? s.filter(x=>x!==t) : [...s, t]);

  return (
    <div className="page-content">
      <Container fluid>
        <Row className="align-items-center">
          <Col>
            <h2>Inventory Management</h2>
            <div className="text-muted">Complete product management solution with enhanced functionality</div>
          </Col>
          <Col className="text-end">
            <Button color="secondary" className="me-2" onClick={()=>api.post(`/products/export`, { page:1, limit:9999, search: searchRef.current, tags })
              .then((csv)=>{ const blob = new Blob([csv], {type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='products_export.csv'; a.click(); })
              .catch(()=>toast.error('Export failed'))
            }>
              <i className="ri-download-2-line me-1"/> Export
            </Button>
            <Button color="primary" onClick={onCreate}><i className="ri-add-line me-1"/> Add Product</Button>
          </Col>
        </Row>

        {/* Summary Tiles */}
        <Row className="mt-3">
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="text-uppercase text-muted">Total Products</div>
              <div className="d-flex align-items-end justify-content-between mt-3">
                <h4 className="mb-0"><CountUp end={summary.totalProducts} duration={1.8}/></h4>
                <span className="avatar-title bg-primary-subtle rounded fs-3"><i className="ri-box-3-line text-primary"/></span>
              </div>
            </CardBody></Card>
          </Col>
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="text-uppercase text-muted">Total Value</div>
              <div className="d-flex align-items-end justify-content-between mt-3">
                <h4 className="mb-0">{peso(summary.totalValue)}</h4>
                <span className="avatar-title bg-success-subtle rounded fs-3"><i className="ri-money-dollar-circle-line text-success"/></span>
              </div>
            </CardBody></Card>
          </Col>
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="text-uppercase text-muted">Active Products</div>
              <div className="d-flex align-items-end justify-content-between mt-3">
                <h4 className="mb-0"><CountUp end={summary.activeProducts} duration={1.8}/></h4>
                <span className="avatar-title bg-info-subtle rounded fs-3"><i className="ri-trending-up-fill text-info"/></span>
              </div>
            </CardBody></Card>
          </Col>
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-uppercase text-muted">Low Stock</div>
                  <h5 className="mb-0 mt-2 text-warning"><CountUp end={summary.lowStock} duration={1.2}/></h5>
                </div>
                <div>
                  <div className="text-uppercase text-muted">Out of Stock</div>
                  <h5 className="mb-0 mt-2 text-danger"><CountUp end={summary.outOfStock} duration={1.2}/></h5>
                </div>
              </div>
            </CardBody></Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mt-3">
          <CardBody>
            <h5 className="mb-3"><i className="ri-filter-3-line me-2"/>Filters</h5>
            <Row className="g-2 align-items-center">
              <Col md={4}>
                <Input placeholder="Search products..." value={searchRef.current}
                  onChange={(e)=>{ searchRef.current=e.target.value; onFilterChange(); }}/>
              </Col>
              <Col md={2}>
                <Input type="select" value={categoryRef.current} onChange={(e)=>{ categoryRef.current=e.target.value; onFilterChange(); }}>
                  <option value="">All Categories</option>
                  <option value="Plaques">Plaques</option>
                  <option value="Trophies">Trophies</option>
                  <option value="Signage">Signage</option>
                </Input>
              </Col>
              <Col md={2}>
                <Input type="select" value={warehouseRef.current} onChange={(e)=>{ warehouseRef.current=e.target.value; onFilterChange(); }}>
                  <option value="">All Warehouses</option>
                </Input>
              </Col>
              <Col md={2}>
                <Input type="select" value={statusRef.current} onChange={(e)=>{ statusRef.current=e.target.value; onFilterChange(); }}>
                  <option value="">All Statuses</option>
                  <option value="active">active</option>
                  <option value="archived">archived</option>
                </Input>
              </Col>
              <Col md={2}>
                <Input type="select" value={stockRef.current} onChange={(e)=>{ stockRef.current=e.target.value; onFilterChange(); }}>
                  <option value="">All Stock Levels</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </Input>
              </Col>
            </Row>

            <div className="mt-3">Filter by Tags:</div>
            <div className="d-flex flex-wrap mt-2">
              {tagUniverse.map((t)=>(
                <TagChip key={t} label={t} active={tagActive(t)} onClick={()=>{ toggleTag(t); }}/>
              ))}
            </div>

            <div className="text-end mt-2">
              <Button color="light" className="me-2" onClick={clearFilters}><i className="ri-filter-off-line me-1"/> Clear Filters</Button>
              <Button color="light" onClick={()=>setView(view==="grid"?"list":"grid")}><i className={`me-1 ${view==='grid'?'ri-list-check-2':'ri-layout-grid-line'}`}/> {view==="grid"?"List":"Grid"} View</Button>
            </div>
          </CardBody>
        </Card>

        {/* Grid Cards */}
        <Row className="mt-3">
          {rows.length===0 && (<Col className="text-center text-muted">No products</Col>)}
          {rows.map((p)=> (
            <Col xl={4} md={6} key={p.id} className="mb-3">
              <Card className="h-100 shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-semibold">{p.name}</div>
                    <div>
                      <Button size="sm" color="light" className="me-1" onClick={()=>onView(p.id)} title="Details"><i className="ri-eye-line"/></Button>
                      <Button size="sm" color="light" className="me-1" onClick={()=>onEditAsk(p)} title="Edit"><i className="ri-edit-2-line"/></Button>
                      <Button size="sm" color="light" onClick={()=>onDeleteAsk(p.id)} title="Delete"><i className="ri-delete-bin-6-line"/></Button>
                    </div>
                  </div>

                  <div className="text-muted small mb-2">{p.category} · <Badge color="success" pill>{p.status}</Badge></div>

                  <div className="ratio ratio-16x9 bg-light rounded mb-2 d-flex align-items-center justify-content-center">
                    {p.primary_image ? (
                      <img src={p.primary_image} alt={p.name} style={{objectFit:'cover', width:'100%', height:'100%'}}/>
                    ) : (
                      <div className="text-muted">Product front view</div>
                    )}
                  </div>

                  <Row className="gy-1">
                    <Col xs={6}><div className="text-muted small">SKU:</div><div className="font-monospace">{p.sku}</div></Col>
                    <Col xs={6} className="text-end"><div className="text-muted small">Price:</div><div className="fw-semibold text-success">{peso(p.price)}</div></Col>
                    <Col xs={6}><div className="text-muted small">Stock:</div><div className="fw-semibold"><i className="ri-checkbox-circle-line text-success me-1"/>{p.available_qty}/{p.total_qty}</div></Col>
                    <Col xs={6}><div className="text-muted small">Location:</div><div>{p.warehouse_name || '-'}</div></Col>
                  </Row>

                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {(p.tags||[]).slice(0,4).map((t,i)=>(<Badge key={i} color="light" className="text-dark">{t}</Badge>))}
                    {p.tags && p.tags.length>4 && (<Badge color="light" className="text-dark">+{p.tags.length-4}</Badge>)}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button color="light" onClick={()=>onQR(p)}><i className="ri-qr-code-line me-1"/> Generate QR</Button>
                    <Button color="light" onClick={()=>onView(p.id)}><i className="ri-information-line me-1"/> Details</Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Simple pager */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="text-muted">Showing {rows.length} of page {currentPage}</div>
          <div className="btn-group">
            <Button disabled={currentPage<=1} onClick={()=>setCurrentPage((p)=>Math.max(1,p-1))}>Prev</Button>
            <Button disabled={currentPage>=totalPages} onClick={()=>setCurrentPage((p)=>Math.min(totalPages,p+1))}>Next</Button>
          </div>
        </div>
      </Container>

      {/* Create Modal */}
      <Modal isOpen={createModal} toggle={()=>setCreateModal(false)} centered>
        <ModalHeader className="bg-light p-3" toggle={()=>setCreateModal(false)}>Add Product</ModalHeader>
        <ModalBody>
          <Row className="g-2">
            <Col md={6}><Label>SKU</Label><Input value={form.sku} onChange={(e)=>setForm(s=>({...s, sku:e.target.value}))}/></Col>
            <Col md={6}><Label>Status</Label><Input type="select" value={form.status} onChange={(e)=>setForm(s=>({...s, status:e.target.value}))}>
              <option>active</option><option>archived</option>
            </Input></Col>
            <Col md={12}><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm(s=>({...s, name:e.target.value}))}/></Col>
            <Col md={6}><Label>Category</Label><Input value={form.category} onChange={(e)=>setForm(s=>({...s, category:e.target.value}))}/></Col>
            <Col md={6}><Label>Warehouse ID</Label><Input type="number" value={form.default_warehouse_id} onChange={(e)=>setForm(s=>({...s, default_warehouse_id:e.target.value}))}/></Col>
            <Col md={6}><Label>Price</Label><Input type="number" value={form.price} onChange={(e)=>setForm(s=>({...s, price:e.target.value}))}/></Col>
            <Col md={6}><Label>Cost</Label><Input type="number" value={form.cost} onChange={(e)=>setForm(s=>({...s, cost:e.target.value}))}/></Col>
            <Col md={6}><Label>Reorder Point</Label><Input type="number" value={form.reorder_point} onChange={(e)=>setForm(s=>({...s, reorder_point:e.target.value}))}/></Col>
            <Col md={12}><Label>Tags (comma separated)</Label><Input value={form.tags.join(',')} onChange={(e)=>setForm(s=>({...s, tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}))}/></Col>
            <Col md={6}><Label>Brand</Label><Input value={form.brand} onChange={(e)=>setForm(s=>({...s, brand:e.target.value}))}/></Col>
            <Col md={6}><Label>Model</Label><Input value={form.model} onChange={(e)=>setForm(s=>({...s, model:e.target.value}))}/></Col>
            <Col md={12}><Label>Description</Label><Input type="textarea" value={form.description} onChange={(e)=>setForm(s=>({...s, description:e.target.value}))}/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={()=>setCreateModal(false)}>Cancel</Button>
          <Button color="primary" onClick={onCreateSubmit}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={()=>setEditModal(false)} centered>
        <ModalHeader className="bg-light p-3" toggle={()=>setEditModal(false)}>Edit Product</ModalHeader>
        <ModalBody>
          <Row className="g-2">
            <Col md={6}><Label>SKU</Label><Input value={form.sku} onChange={(e)=>setForm(s=>({...s, sku:e.target.value}))}/></Col>
            <Col md={6}><Label>Status</Label><Input type="select" value={form.status} onChange={(e)=>setForm(s=>({...s, status:e.target.value}))}>
              <option>active</option><option>archived</option>
            </Input></Col>
            <Col md={12}><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm(s=>({...s, name:e.target.value}))}/></Col>
            <Col md={6}><Label>Category</Label><Input value={form.category} onChange={(e)=>setForm(s=>({...s, category:e.target.value}))}/></Col>
            <Col md={6}><Label>Warehouse ID</Label><Input type="number" value={form.default_warehouse_id} onChange={(e)=>setForm(s=>({...s, default_warehouse_id:e.target.value}))}/></Col>
            <Col md={6}><Label>Price</Label><Input type="number" value={form.price} onChange={(e)=>setForm(s=>({...s, price:e.target.value}))}/></Col>
            <Col md={6}><Label>Cost</Label><Input type="number" value={form.cost} onChange={(e)=>setForm(s=>({...s, cost:e.target.value}))}/></Col>
            <Col md={6}><Label>Reorder Point</Label><Input type="number" value={form.reorder_point} onChange={(e)=>setForm(s=>({...s, reorder_point:e.target.value}))}/></Col>
            <Col md={12}><Label>Tags (comma separated)</Label><Input value={form.tags.join(',')} onChange={(e)=>setForm(s=>({...s, tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}))}/></Col>
            <Col md={6}><Label>Brand</Label><Input value={form.brand} onChange={(e)=>setForm(s=>({...s, brand:e.target.value}))}/></Col>
            <Col md={6}><Label>Model</Label><Input value={form.model} onChange={(e)=>setForm(s=>({...s, model:e.target.value}))}/></Col>
            <Col md={12}><Label>Description</Label><Input type="textarea" value={form.description} onChange={(e)=>setForm(s=>({...s, description:e.target.value}))}/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={()=>setEditModal(false)}>Cancel</Button>
          <Button color="primary" onClick={onEditSubmit}>Update</Button>
        </ModalFooter>
      </Modal>

      {/* QR Modal */}
      <Modal isOpen={qrModal} toggle={()=>setQrModal(false)} centered size="lg">
        <ModalHeader className="bg-light p-3" toggle={()=>setQrModal(false)}>
          QR Code Generator
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md={5}>
              <h6>QR Code Settings</h6>
              <Label className="mt-2">Format</Label>
              <Input type="select" value={qrForm.format} onChange={(e)=>setQrForm(s=>({...s, format:e.target.value}))}>
                <option value="SKU">Standard (SKU)</option>
                <option value="SKU+NAME">SKU + Name</option>
                <option value="CUSTOM">Custom Text</option>
              </Input>
              <Label className="mt-2">Custom Text</Label>
              <Input value={qrForm.text} onChange={(e)=>setQrForm(s=>({...s, text:e.target.value}))} placeholder="Additional text to display"/>
              <Button className="mt-3" color="primary" onClick={regenerateQR}><i className="ri-qr-code-line me-1"/> Generate</Button>
            </Col>
            <Col md={7}>
              <h6>Preview</h6>
              <div className="border rounded d-flex align-items-center justify-content-center" style={{height:220}}>
                <div className="text-center">
                  <div className="mb-2">(Render QR on frontend using the payload below)</div>
                  <div className="fw-bold">{qrForm.payload || '—'}</div>
                </div>
              </div>
              <div className="mt-3">
                <Label>QR Data Preview</Label>
                <Input type="textarea" rows={3} value={qrForm.payload} readOnly/>
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={()=>setQrModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={detailsModal} toggle={()=>setDetailsModal(false)} centered size="xl">
        <ModalHeader className="bg-light p-3" toggle={()=>setDetailsModal(false)}>
          {details?.product?.name || 'Product'} <span className="text-muted ms-2">— Details</span>
        </ModalHeader>
        <ModalBody>
          {!details?.product ? (<>Loading…</>) : (
            <>
              {/* Tabs nav */}
              <div className="d-flex gap-2 mb-3">
                {['overview','images','quantity','tracking','specs'].map((t)=> (
                  <Button key={t} size="sm" color={activeTab===t? 'primary':'light'} onClick={()=>setActiveTab(t)} className="text-capitalize">{t}</Button>
                ))}
              </div>

              {activeTab==='overview' && (
                <Row className="g-3">
                  <Col md={7}>
                    <Card className="h-100 border-0 shadow-sm"><CardBody>
                      <h5>Product Information</h5>
                      <Row className="mt-2 gy-2">
                        <Col xs={6}><div className="text-muted small">SKU:</div><div className="font-monospace">{details.product.sku}</div></Col>
                        <Col xs={6}><div className="text-muted small">Category:</div><div>{details.product.category}</div></Col>
                        <Col xs={6}><div className="text-muted small">Brand:</div><div>{details.product.brand||'-'}</div></Col>
                        <Col xs={6}><div className="text-muted small">Model:</div><div>{details.product.model||'-'}</div></Col>
                        <Col xs={6}><div className="text-muted small">Price:</div><div className="fw-semibold text-success">{peso(details.product.price)}</div></Col>
                        <Col xs={6}><div className="text-muted small">Cost:</div><div className="fw-semibold">{peso(details.product.cost)}</div></Col>
                      </Row>
                      <div className="mt-3">
                        <div className="text-muted small">Description:</div>
                        <div>{details.product.description || '—'}</div>
                      </div>
                      <div className="mt-3 d-flex flex-wrap gap-2">
                        {(details.product.tags||[]).map((t,i)=>(<Badge key={i} color="light" className="text-dark">{t}</Badge>))}
                      </div>
                    </CardBody></Card>
                  </Col>
                  <Col md={5}>
                    <Card className="h-100 border-0 shadow-sm"><CardBody>
                      <h5>Stock Information</h5>
                      <Row className="text-center">
                        <Col xs={6}><div className="display-6">{fmt(details.stock.total||0)}</div><div className="text-muted">Total</div></Col>
                        <Col xs={6}><div className="display-6 text-success">{fmt(details.stock.available||0)}</div><div className="text-muted">Available</div></Col>
                      </Row>
                      <Row className="text-center mt-3">
                        <Col xs={6}><div className="fs-4 text-warning">{fmt(details.stock.reserved||0)}</div><div className="text-muted">Reserved</div></Col>
                        <Col xs={6}><div className="fs-4">{fmt(details.stock.shipped||0)}</div><div className="text-muted">Shipped</div></Col>
                      </Row>
                      <div className="mt-3">
                        <div className="text-muted small">Reorder Point</div>
                        <Progress className="progress-sm" value={Math.min(100, (details.stock.lowAlert||0) && details.stock.total ? Math.round((details.stock.lowAlert/details.stock.total)*100):0)} />
                      </div>
                    </CardBody></Card>
                  </Col>
                </Row>
              )}

              {activeTab==='images' && (
                <Row className="g-3">
                  <Col md={12}>
                    <div className="d-flex flex-wrap gap-3">
                      {(details.images||[]).map((img)=> (
                        <div key={img.id} className="border rounded p-1" style={{width:220}}>
                          <div className="ratio ratio-16x9 bg-light rounded">
                            <img src={img.url} alt="img" style={{objectFit:'cover', width:'100%', height:'100%'}}/>
                          </div>
                          {img.is_primary? <div className="badge bg-primary mt-1">Primary</div>: null}
                        </div>
                      ))}
                      {(!details.images || details.images.length===0) && (<div className="text-muted">No images</div>)}
                    </div>
                  </Col>
                </Row>
              )}

              {activeTab==='quantity' && (
                <>
                  <div className="d-flex gap-3 mb-2">
                    <Card className="p-2"><div className="text-center"><div className="fs-4 text-success">{fmt(details.stock.available||0)}</div><div className="text-muted small">Available</div></div></Card>
                    <Card className="p-2"><div className="text-center"><div className="fs-4 text-warning">{fmt(details.stock.reserved||0)}</div><div className="text-muted small">Reserved</div></div></Card>
                    <Card className="p-2"><div className="text-center"><div className="fs-4">{fmt(details.stock.shipped||0)}</div><div className="text-muted small">Shipped</div></div></Card>
                    <Card className="p-2"><div className="text-center"><div className="fs-4">{fmt(details.stock.total||0)}</div><div className="text-muted small">Total</div></div></Card>
                  </div>
                  <Table hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Serial/Batch</th>
                        <th>Location</th>
                        <th>Condition</th>
                        <th>Status</th>
                        <th>Acquired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(details.items||[]).map((it)=> (
                        <tr key={it.id}>
                          <td className="font-monospace">{it.serial||'-'}</td>
                          <td>{it.location_code||'-'}</td>
                          <td><Badge color="light" className="text-dark">{it.condition_label||'-'}</Badge></td>
                          <td>
                            {it.status==='available' || it.status==='IN_STOCK' ? <Badge color="success" pill>available</Badge> :
                             it.status==='reserved' || it.status==='RESERVED' ? <Badge color="warning" pill>reserved</Badge> :
                             it.status==='shipped'  || it.status==='SHIPPED'  ? <Badge color="info" pill>shipped</Badge> : <Badge color="secondary" pill>{it.status}</Badge>}
                          </td>
                          <td>{it.acquired_at ? new Date(it.acquired_at).toLocaleDateString(): '-'}</td>
                        </tr>
                      ))}
                      {(!details.items || details.items.length===0) && (
                        <tr><td colSpan="5" className="text-center text-muted">No items</td></tr>
                      )}
                    </tbody>
                  </Table>
                </>
              )}

              {activeTab==='tracking' && (
                <Table hover responsive className="mb-0">
                  <thead className="table-light"><tr><th>Event</th><th>Description</th><th>Actor</th><th>Qty</th><th>Warehouse</th><th>Time</th></tr></thead>
                  <tbody>
                    {(details.events||[]).map((ev)=> (
                      <tr key={ev.id}>
                        <td><Badge color="light" className="text-dark">{ev.event_type}</Badge></td>
                        <td>{ev.description}</td>
                        <td>{ev.actor||'-'}</td>
                        <td className="text-end">{fmt(ev.quantity||0)}</td>
                        <td>{ev.warehouse_name||'-'}</td>
                        <td>{ev.created_at ? new Date(ev.created_at).toLocaleString(): '-'}</td>
                      </tr>
                    ))}
                    {(!details.events || details.events.length===0) && (
                      <tr><td colSpan="6" className="text-center text-muted">No history</td></tr>
                    )}
                  </tbody>
                </Table>
              )}

              {activeTab==='specs' && (
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="border-0 shadow-sm"><CardBody>
                      <h5>Dimensions</h5>
                      <Row className="gy-2 mt-1">
                        <Col xs={6} className="text-muted">Length:</Col><Col xs={6} className="text-end">{details.specs?.length||'-'}</Col>
                        <Col xs={6} className="text-muted">Width:</Col><Col xs={6} className="text-end">{details.specs?.width||'-'}</Col>
                        <Col xs={6} className="text-muted">Height:</Col><Col xs={6} className="text-end">{details.specs?.height||'-'}</Col>
                        <Col xs={6} className="text-muted">Weight:</Col><Col xs={6} className="text-end">{details.specs?.weight||'-'}</Col>
                      </Row>
                    </CardBody></Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm"><CardBody>
                      <h5>Specifications</h5>
                      <Row className="gy-2 mt-1">
                        <Col xs={6} className="text-muted">Material:</Col><Col xs={6} className="text-end">{details.specs?.material||'-'}</Col>
                        <Col xs={6} className="text-muted">Base:</Col><Col xs={6} className="text-end">{details.specs?.base||'-'}</Col>
                        <Col xs={6} className="text-muted">Engraving:</Col><Col xs={6} className="text-end">{details.specs?.engraving||'-'}</Col>
                        <Col xs={6} className="text-muted">Packaging:</Col><Col xs={6} className="text-end">{details.specs?.packaging||'-'}</Col>
                      </Row>
                    </CardBody></Card>
                  </Col>
                  <Col md={12}>
                    <Card className="border-0 shadow-sm"><CardBody>
                      <h5>Additional Information</h5>
                      <Row className="gy-2 mt-1">
                        <Col xs={6} className="text-muted">Supplier:</Col><Col xs={6} className="text-end">{details.specs?.supplier||'-'}</Col>
                        <Col xs={6} className="text-muted">Manufactured:</Col><Col xs={6} className="text-end">{details.specs?.manufactured||'-'}</Col>
                        <Col xs={6} className="text-muted">Warranty:</Col><Col xs={6} className="text-end">{details.specs?.warranty||'-'}</Col>
                        <Col xs={6} className="text-muted">Created:</Col><Col xs={6} className="text-end">{details.product?.created_at? new Date(details.product.created_at).toLocaleDateString():'-'}</Col>
                        <Col xs={6} className="text-muted">Last Updated:</Col><Col xs={6} className="text-end">{details.product?.updated_at? new Date(details.product.updated_at).toLocaleDateString():'-'}</Col>
                      </Row>
                    </CardBody></Card>
                  </Col>
                </Row>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={()=>setDetailsModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default Products;
