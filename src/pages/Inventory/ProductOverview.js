// ================================================================
// FILE: src/pages/Inventory/ProductOverview.jsx
// ================================================================
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Container,
  Badge,
  Button,
} from "reactstrap";
import { api } from "../../config";

const ProductOverview = ({ product, onGenerateQr, onDelete, onEdit, reloadProduct, active }) => {

  // useEffect(() => {
  //     if (active && reloadProduct) {
  //       reloadProduct();
  //     }
  //   }, [active, reloadProduct]);

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
            <Card>
              <CardBody className="text-center text-muted">
                No product data available
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Row className="g-3">
      {/* LEFT SIDE – Image & Actions */}
      <Col xl={4} lg={5}>
        <Card>
          <CardBody className="text-center">
            <img
              src={prefixUrl(product.primary_image)}
              alt={product.name}
              className="img-fluid rounded border"
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
          </CardBody>
        </Card>

        <Card className="mt-3">
          <CardBody>
            <h5 className="mb-3">Actions</h5>
            <div className="d-flex flex-wrap gap-2">
              <Button color="info" onClick={onGenerateQr}>
                <i className="ri-qr-code-line me-1" /> Generate QR
              </Button>
              <Button color="warning" onClick={onEdit}>
                <i className="ri-pencil-line me-1" /> Edit
              </Button>
              <Button color="danger" onClick={onDelete}>
                <i className="ri-delete-bin-line me-1" /> Delete
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* RIGHT SIDE – Info & Stock */}
      <Col xl={8} lg={7}>
        <Row className="g-3">
          {/* Product Info */}
          <Col md={12}>
            <Card>
              <CardBody>
                <h5 className="mb-3">Product Information</h5>
                <Row>
                  <Col sm={6}>
                    <p><strong>SKU:</strong> {product.sku}</p>
                    <p><strong>Brand:</strong> {product.brand}</p>
                    <p>
                      <strong>Price:</strong>{" "}
                      <span className="text-success fw-bold">
                        ₱{Number(product.price || 0).toFixed(2)}
                      </span>
                    </p>
                  </Col>
                  <Col sm={6}>
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Model:</strong> {product.model}</p>
                    <p><strong>Cost:</strong> ₱{Number(product.cost || 0).toFixed(2)}</p>
                  </Col>
                </Row>
                {product.description && (
                  <p className="mt-3">
                    <strong>Description:</strong> {product.description}
                  </p>
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

          {/* Stock Info */}
          <Col md={12}>
            <Card>
              <CardBody>
                <h5 className="mb-3">Stock Information</h5>
                <Row className="g-3 text-center mb-3">
                  <Col sm={6} md={3}>
                    <div className="p-3 bg-light border rounded">
                      <h4 className="text-primary">{product.total_qty || 0}</h4>
                      <p className="mb-0">Total</p>
                    </div>
                  </Col>
                  <Col sm={6} md={3}>
                    <div className="p-3 bg-light border rounded">
                      <h4 className="text-success">{product.available_qty || 0}</h4>
                      <p className="mb-0">Available</p>
                    </div>
                  </Col>
                  <Col sm={6} md={3}>
                    <div className="p-3 bg-light border rounded">
                      <h4 className="text-warning">{product.reserved_qty || 0}</h4>
                      <p className="mb-0">Reserved</p>
                    </div>
                  </Col>
                  <Col sm={6} md={3}>
                    <div className="p-3 bg-light border rounded">
                      <h4 className="text-danger">{product.low_stock || 0}</h4>
                      <p className="mb-0">Low Stock Alert</p>
                    </div>
                  </Col>
                </Row>
                <p><strong>Warehouse:</strong> {product.warehouse || "N/A"}</p>
                <p><strong>Locations:</strong> {product.locations || "N/A"}</p>
                <p><strong>Reorder Point:</strong> {product.reorder_point || 0}</p>
                <p><strong>Max Stock:</strong> {product.max_stock || 0}</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ProductOverview;
