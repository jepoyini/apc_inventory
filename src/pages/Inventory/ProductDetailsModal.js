// ================================================================
// FILE: src/pages/Inventory/components/ProductDetailsModal.jsx
// ================================================================
import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Card, CardBody, Table, Button, Badge, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classNames from "classnames";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";

const fmt = (n) => Number(n||0).toLocaleString();

const ProductDetailsModal = ({ productId, open, onClose, onChanged }) => {
  const api = new APIClient();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ product:null, images:[], stock:{}, items:[], events:[], specs:{} });

  const load = async () => {
    try { setLoading(true); const r = await api.post(`/products/${productId}/details`, {}); setData(r || {}); }
    catch (e) { console.error(e); toast.error('Failed to load details'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ if(open) load(); }, [open, productId]);

  const addImage = async () => {
    const url = window.prompt('Image URL'); if (!url) return;
    try { await api.post(`/products/${productId}/images/add`, { url, is_primary: true }); load(); toast.success('Image added'); }
    catch { toast.error('Add image failed'); }
  };

  const addItems = async () => {
    const qtyStr = window.prompt('Quantity to add'); if (!qtyStr) return; const qty = Number(qtyStr); if (!qty || qty<1) return;
    const location_code = window.prompt('Location code (optional)') || '';
    const condition_label = window.prompt('Condition (e.g., new)') || '';
    try { await api.post(`/products/${productId}/items/add`, { qty, location_code, condition_label }); load(); toast.success('Items added'); }
    catch { toast.error('Add items failed'); }
  };

  const updateItem = async (itemId, patch) => {
    try { await api.post(`/products/${productId}/items/update`, { item_id: itemId, ...patch }); load(); toast.success('Item updated'); }
    catch { toast.error('Update failed'); }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.post(`/products/${productId}/items/delete`, { item_id: itemId }); load(); toast.success('Item deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const addEvent = async () => {
    const event_type = window.prompt('Event type (RECEIVED/MOVED/SHIPPED/SCANNED/etc)'); if(!event_type) return;
    const description = window.prompt('Description') || '';
    try { await api.post(`/products/${productId}/events/add`, { event_type, description }); load(); toast.success('Event logged'); }
    catch { toast.error('Event failed'); }
  };

  const getQr = async () => {
    try { const r = await api.post(`/products/${productId}/qr`, { format: 'SKU+NAME' }); window.alert(`QR payload: ${r?.payload}`); }
    catch { toast.error('QR failed'); }
  };

  const p = data.product || {};

  return (
    <Modal isOpen={open} toggle={onClose} size="xl" centered className="mw-1650">
      <ModalHeader toggle={onClose}>{p?.name || 'Product'} <span className="text-muted">— Details</span></ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center text-muted">Loading…</div>
        ) : (
          <>
            {/* Top cards */}
            <Row className="g-3">
              <Col md={3}><Card className="h-100"><CardBody>
                <div className="text-muted small">SKU</div>
                <div className="fw-semibold">{p?.sku}</div>
              </CardBody></Card></Col>
              <Col md={3}><Card className="h-100"><CardBody>
                <div className="text-muted small">Category</div>
                <div className="fw-semibold">{p?.category}</div>
              </CardBody></Card></Col>
              <Col md={3}><Card className="h-100"><CardBody>
                <div className="text-muted small">Price</div>
                <div className="fw-semibold">₱{Number(p?.price||0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</div>
              </CardBody></Card></Col>
              <Col md={3}><Card className="h-100"><CardBody>
                <div className="text-muted small">Status</div>
                <Badge color={p?.status==='active' ? 'success' : 'secondary'} pill>{p?.status}</Badge>
              </CardBody></Card></Col>
            </Row>

            {/* Tabs */}
            <Nav tabs className="mt-3">
              <NavItem><NavLink className={classNames({ active: tab==='overview' })} onClick={()=>setTab('overview')}>Overview</NavLink></NavItem>
              <NavItem><NavLink className={classNames({ active: tab==='images' })} onClick={()=>setTab('images')}>Images</NavLink></NavItem>
              <NavItem><NavLink className={classNames({ active: tab==='items' })} onClick={()=>setTab('items')}>Quantity</NavLink></NavItem>
              <NavItem><NavLink className={classNames({ active: tab==='events' })} onClick={()=>setTab('events')}>Tracking</NavLink></NavItem>
              <NavItem><NavLink className={classNames({ active: tab==='specs' })} onClick={()=>setTab('specs')}>Specs</NavLink></NavItem>
            </Nav>
            <TabContent activeTab={tab} className="mt-3">
              <TabPane tabId="overview">
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="h-100"><CardBody>
                      <div className="fw-semibold mb-2">Inventory</div>
                      <Row className="text-center">
                        <Col>
                          <div className="fs-4 fw-semibold">{fmt(data?.stock?.available)}</div>
                          <div className="text-muted small">Available</div>
                        </Col>
                        <Col>
                          <div className="fs-4 fw-semibold">{fmt(data?.stock?.reserved)}</div>
                          <div className="text-muted small">Reserved</div>
                        </Col>
                        <Col>
                          <div className="fs-4 fw-semibold">{fmt(data?.stock?.shipped)}</div>
                          <div className="text-muted small">Shipped</div>
                        </Col>
                        <Col>
                          <div className="fs-4 fw-semibold">{fmt(data?.stock?.total)}</div>
                          <div className="text-muted small">Total</div>
                        </Col>
                      </Row>
                      <div className="mt-3">
                        <Button size="sm" color="primary" className="me-2" onClick={addItems}><i className="ri-add-line me-1"/>Add Items</Button>
                        <Button size="sm" color="secondary" onClick={getQr}><i className="ri-qr-code-line me-1"/>QR</Button>
                      </div>
                    </CardBody></Card>
                  </Col>
                  <Col md={6}>
                    <Card className="h-100"><CardBody>
                      <div className="fw-semibold mb-2">Tags</div>
                      <div>
                        {(p?.tags||[]).length===0 ? <span className="text-muted">No tags</span> : (p?.tags||[]).map((t)=> <Badge key={t} color="secondary" pill className="me-2">{t}</Badge>)}
                      </div>
                      <hr/>
                      <div className="fw-semibold mb-2">Description</div>
                      <div className="text-muted" style={{whiteSpace:'pre-wrap'}}>{p?.description || '—'}</div>
                    </CardBody></Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tabId="images">
                <Row className="g-3">
                  {data.images?.map((img)=> (
                    <Col key={img.id} md={3}>
                      <Card className="shadow-sm"><div className="ratio ratio-16x9 bg-light"><img src={img.url} alt="" style={{objectFit:'cover'}}/></div></Card>
                    </Col>
                  ))}
                </Row>
                <div className="mt-3"><Button size="sm" onClick={addImage}><i className="ri-add-line me-1"/>Add Image</Button></div>
              </TabPane>

              <TabPane tabId="items">
                <Card><CardBody>
                  <Table hover responsive className="mb-0">
                    <thead className="table-light"><tr>
                      <th>ID</th><th>Serial/Batch</th><th>Location</th><th>Condition</th><th>Status</th><th>Acquired</th><th className="text-end">Action</th>
                    </tr></thead>
                    <tbody>
                      {data.items?.length ? data.items.map((it)=> (
                        <tr key={it.id}>
                          <td>{it.id}</td>
                          <td>{it.serial}</td>
                          <td>{it.location_code}</td>
                          <td>{it.condition_label}</td>
                          <td><Badge color={it.status==='IN_STOCK'?'success': it.status==='RESERVED'?'warning': it.status==='SHIPPED'?'info':'secondary'} pill>{it.status}</Badge></td>
                          <td>{it.acquired_at || ''}</td>
                          <td className="text-end">
                            <Button size="sm" className="me-1" onClick={()=>updateItem(it.id, { status: 'IN_STOCK' })}>Set In-Stock</Button>
                            <Button size="sm" color="danger" onClick={()=>deleteItem(it.id)}>Delete</Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={7} className="text-center text-muted">No items</td></tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody></Card>
              </TabPane>

              <TabPane tabId="events">
                <Card><CardBody>
                  <div className="d-flex justify-content-between mb-2">
                    <div className="fw-semibold">Recent Events</div>
                    <Button size="sm" onClick={addEvent}><i className="ri-add-line me-1"/>Add Event</Button>
                  </div>
                  <Table responsive hover className="mb-0">
                    <thead className="table-light"><tr>
                      <th>When</th><th>Type</th><th>Description</th><th>Actor</th><th className="text-end">Qty</th>
                    </tr></thead>
                    <tbody>
                      {data.events?.length ? data.events.map((ev)=> (
                        <tr key={ev.id}>
                          <td>{ev.created_at}</td>
                          <td>{ev.event_type}</td>
                          <td>{ev.description}</td>
                          <td>{ev.actor || ''}</td>
                          <td className="text-end">{ev.quantity||0}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="text-center text-muted">No events</td></tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody></Card>
              </TabPane>

              <TabPane tabId="specs">
                <Card><CardBody>
                  <Row className="g-3">
                    {Object.keys(data.specs||{}).length ? Object.entries(data.specs).map(([k,v]) => (
                      <Col key={k} md={6}>
                        <div className="text-muted small">{k}</div>
                        <div className="fw-semibold">{v}</div>
                      </Col>
                    )) : (
                      <Col><div className="text-muted">No specs</div></Col>
                    )}
                  </Row>
                </CardBody></Card>
              </TabPane>
            </TabContent>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProductDetailsModal;
