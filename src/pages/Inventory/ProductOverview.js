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

  const handleEdit = () => {
    setForm(product);      // ✅ preload current product
    setOpenEdit(true);     // ✅ open modal
  };

  const handleUpdate = () => {
    console.log("Updated product:", form);
    // 🔥 here you would call API to save updates
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
          {/* Product Image */}
          <Card className="shadow-sm border-0">
            <CardBody className="p-0">
              <img
                src={prefixUrl(product.primary_image)}
                alt={product.name}
                className="img-fluid rounded-top"
                style={{
                  width: "100%",
                  height: "350px",
                  objectFit: "cover",
                }}
              />
            </CardBody>
          </Card>

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

        {/* RIGHT SIDE – Actions, Info & Specs */}
        <Col xl={8} lg={7}>
          <Row className="g-4">
            {/* Product Info with Actions */}
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Product Information</h5>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col sm={6}>
                      <p><strong>Model:</strong> {product.model}</p>
                      <p><strong>Brand:</strong> {product.brand}</p>
                      <p>
                        <strong>Price:</strong>{" "}
                        <span className="text-success fw-bold">
                          {Number(product.price || 0).toFixed(2)}
                        </span>
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p><strong>Category:</strong> {product.category}</p>
                      <p><strong>Reorder Point:</strong> {product.reorder_point || 0}</p>
                      <p><strong>Max Stock:</strong> {product.max_stock || 0}</p>
                    </Col>
                  </Row>

                  {product.description && (
                    <p className="mt-3 text-muted">{product.description}</p>
                  )}

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

            {/* Specs */}
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <CardBody>
                  <h5 className="mb-3">Specifications</h5>
                  <Accordion open={open} toggle={toggle}>
                    <AccordionItem>
                      <AccordionHeader targetId="1">Dimensions</AccordionHeader>
                      <AccordionBody accordionId="1">
                        <Row>
                          <Col xs={6}><strong>Length:</strong></Col>
                          <Col xs={6}>{product.length || "—"}</Col>
                          <Col xs={6}><strong>Width:</strong></Col>
                          <Col xs={6}>{product.width || "—"}</Col>
                          <Col xs={6}><strong>Height:</strong></Col>
                          <Col xs={6}>{product.height || "—"}</Col>
                          <Col xs={6}><strong>Weight:</strong></Col>
                          <Col xs={6}>{product.weight || "—"}</Col>
                        </Row>
                      </AccordionBody>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionHeader targetId="2">Technical Specs</AccordionHeader>
                      <AccordionBody accordionId="2">
                        <Row>
                          <Col xs={6}><strong>Material:</strong></Col>
                          <Col xs={6}>{product.material || "—"}</Col>
                          <Col xs={6}><strong>Base:</strong></Col>
                          <Col xs={6}>{product.base || "—"}</Col>
                          <Col xs={6}><strong>Engraving:</strong></Col>
                          <Col xs={6}>{product.engraving || "—"}</Col>
                          <Col xs={6}><strong>Packaging:</strong></Col>
                          <Col xs={6}>{product.packaging || "—"}</Col>
                        </Row>
                      </AccordionBody>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionHeader targetId="3">Additional Info</AccordionHeader>
                      <AccordionBody accordionId="3">
                        <Row>
                          <Col xs={6}><strong>Supplier:</strong></Col>
                          <Col xs={6}>{product.supplier || "—"}</Col>
                          <Col xs={6}><strong>Manufactured:</strong></Col>
                          <Col xs={6}>{product.manufactured || "—"}</Col>
                          <Col xs={6}><strong>Warranty:</strong></Col>
                          <Col xs={6}>{product.warranty || "—"}</Col>
                        </Row>
                      </AccordionBody>
                    </AccordionItem>
                  </Accordion>
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
