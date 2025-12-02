// ================================================================
// FILE: src/pages/Inventory/ProductOverview.jsx
// ================================================================
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Badge,
  Button,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
} from "reactstrap";
import { api } from "../../config";
import AddProductDialog from "./AddProductDialog";   // ✅ import

const ProductOverview = ({ product, onDelete, specs }) => {
  const [openEdit, setOpenEdit] = useState(false);   // ✅ modal state
  const [form, setForm] = useState(product || {});   // ✅ form state

  const [open, setOpen] = React.useState("1");
  const toggle = (id) => setOpen(open === id ? "" : id);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png?a=14234";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  if (!product) {
    return (
      <Container fluid>
        <Row>
          <Col>
            <Card className="shadow-sm border-0">
              <CardBody className="text-center text-muted">
                No product data available
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "CREATED": return <Badge className="created-status mw-70">CREATED</Badge>;
      case "AVAILABLE": return <Badge color="success" className="mw-70">AVAILABLE</Badge>;
      case "IN_TRANSIT": return <Badge color="info" className="mw-70">IN-TRANSIT</Badge>;
      case "IN_STOCK": return <Badge color="primary" className="mw-70">IN-STOCK</Badge>;
      case "SOLD": return <Badge color="dark" className="mw-70">SOLD</Badge>;
      case "DISPOSED": return <Badge color="danger" className="mw-70">DISPOSED</Badge>;
      case "RETURNED": return <Badge className="returned-status mw-70">RETURNED</Badge>;
      case "CHECK_IN": return <Badge className="returned-status mw-70">CHECK-IN</Badge>;
      default: return <Badge color="secondary" className="mw-70">{status}</Badge>;
    }
  };

  const handleEdit = () => {
    setForm(product);      // ✅ preload current product
    setOpenEdit(true);     // ✅ open modal
  };

  const handleUpdate = () => {
    console.log("Updated product:", form);
    setOpenEdit(false);
  };

  return (
    <Container fluid>
      {/* Edit Modal */}
      <AddProductDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSubmit={handleUpdate}
        form={form}
        setForm={setForm}
        isEditing={true}
        editingId={product.id}
      />

      <Row className="g-4">
        {/* LEFT SIDE – Image & Stock */}
        <Col xl={4} lg={5}>
          {/* Product Image + Description */}
          <Card className="shadow-sm border-0">
            <CardBody className="p-0">
              <div
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  padding: "4px",
                  textAlign: "center",
                  background: "#fff",
                }}
              >
                <img
                  src={prefixUrl(product.primary_image)}
                  alt={product.name}
                  className="img-fluid"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "350px",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* ✅ Description under image */}
              {product.description && (
                <div className="mt-3 px-2">
                  <h6 className="fw-semibold">Description</h6>
                  <p className="text-muted small mb-0">
                    {product.description}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* RIGHT SIDE – Actions, Info & Specs */}
        <Col xl={8} lg={7}>
          <Row className="g-4">
            {/* Product Info with Actions */}
            <Col md={12}>
              <Card className="shadow-sm border-0">


<CardHeader className="d-flex justify-content-between align-items-center">

  {/* LEFT: Title */}
  <h5 className="mb-0">Product Information</h5>

  {/* RIGHT: Buttons (Admin Only) */}
  {JSON.parse(sessionStorage.getItem("authUser") || "{}").role === "Admin" && (
    <div className="d-flex gap-2">
      <Button color="primary" size="sm" onClick={handleEdit}>
        <i className="ri-pencil-line me-1" /> Edit
      </Button>

      <Button color="danger" size="sm" onClick={onDelete}>
        <i className="ri-delete-bin-line me-1" /> Delete
      </Button>
    </div>
  )}

</CardHeader>


                <CardBody>

                  <Row>
                    <Col sm={6}>
                      <p><strong>Category:</strong>&nbsp;&nbsp; {product.category}</p>
                      <p><strong>Material:</strong>&nbsp;&nbsp; {product.material}</p>
                      <p><strong>Size:</strong>&nbsp;&nbsp; {product.size}</p>
                    </Col>

                    <Col sm={6}>
                      {/* <p><strong>Status:</strong>&nbsp;&nbsp; {getStatusBadge(product.last_status)}</p> */}
                      <p><strong>Quantity:</strong>&nbsp;&nbsp; {product.qty || 0}</p>
                      <p><strong>Warehouse:</strong>&nbsp;&nbsp; {product.warehouse_name}</p>
                      {(() => {
                        const role = JSON.parse(sessionStorage.getItem("authUser") || "{}").role;

                        // ================================
                        // ADMIN – show all price fields
                        // ================================
                        if (role === "Admin") {
                          return (
                            <>
                              {/* Base Price */}
                              <p>
                                <strong>Base Price:</strong>&nbsp;&nbsp;
                                <span className="text-success fw-bold">
                                  {Number(product.price || 0).toFixed(2)}
                                </span>
                              </p>

                              {/* Markup % */}
                              {product.markup_percent !== undefined && product.markup_percent !== null && (
                                <p>
                                  <strong>Markup %:</strong>&nbsp;&nbsp;
                                  {Number(product.markup_percent).toFixed(2)}%
                                </p>
                              )}

                              {/* Warehouse Price */}
                              {product.warehouse_price !== undefined && product.warehouse_price !== null && (
                                <p>
                                  <strong>Warehouse Price:</strong>&nbsp;&nbsp;
                                  <span className="fw-bold text-primary">
                                    {Number(product.warehouse_price || 0).toFixed(2)}
                                  </span>
                                </p>
                              )}
                            </>
                          );
                        }

                        // ================================
                        // MANAGER / STAFF – warehouse price only
                        // ================================
                        return (
                          <>
                            {product.warehouse_price !== undefined && (
                              <p>
                                <strong>Warehouse Price:</strong>&nbsp;&nbsp;
                                <span className="fw-bold text-primary">
                                  {Number(product.warehouse_price || 0).toFixed(2)}
                                </span>
                              </p>
                            )}
                          </>
                        );
                      })()}
                     
                    </Col>
                  </Row>

                  {product.tags?.length > 0 && (
                    <div className="mt-2">
                      <strong>Tags:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {product.tags.map((tag, idx) => (
                          <Badge key={idx} color="light" className="text-dark">
                            <i className="ri-price-tag-3-line me-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Specs + Stock Summary */}
            <Col md={12}>
              {/* Stock Summary */}
              <Card className="mt-3 shadow-sm border-0">
                <CardBody>
                  <h5 className="mb-3">Stock Summary</h5>
                  <Row className="g-3 text-center">
                    <Col sm={6}>
                      <div className="p-3 bg-light border rounded shadow-sm">
                        <h4 className="text-primary">{product.total_qty || 0}</h4>
                        <p className="mb-0">Total</p>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="p-3 bg-light border rounded shadow-sm">
                        <h4 className="text-success">{product.available_qty || 0}</h4>
                        <p className="mb-0">Available</p>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="p-3 bg-light border rounded shadow-sm">
                        <h4 className="text-warning">{product.in_transit_qty || 0}</h4>
                        <p className="mb-0">In-Transit</p>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="p-3 bg-light border rounded shadow-sm">
                        <h4 className="text-danger">{product.sold_qty || 0}</h4>
                        <p className="mb-0">Sold</p>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductOverview;
