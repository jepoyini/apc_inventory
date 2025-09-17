// ================================================================
// FILE: src/pages/Inventory/ProductCard.jsx
// ================================================================
import React, { useState } from "react";
import { Card, CardBody, Badge } from "reactstrap";
import { api } from "../../config"; 
import DeleteModal from "../../Components/Common/DeleteModal";
import QRCodeGenerator from "./QRCodeGenerator"; // adjust path if needed

const ProductCard = ({ product, onView }) => {
  const [qrOpen, setQrOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png";
    if (url === "images/no-image.png") return base + "/images/noimage.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  return (
    <>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => {
          setDeleteModal(false);
          // hook kept in case you want delete later
        }}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Card
        className="h-100 shadow-sm clickable-card"
        onClick={() => onView(product)}
        style={{ cursor: "pointer" }}
      >
        <CardBody className="d-flex flex-column">
          {/* Header */}
          <div className="mb-2">
            <h5 className="mb-1">{product.name}</h5>
            <div className="text-muted small">ID: {product.id}</div>
            <Badge color="info" pill className="me-2">{product.category}</Badge>
            <Badge
              color={product.status === "active" ? "success" : "secondary"}
              pill
            >
              {product.status}
            </Badge>
          </div>

          {/* Product Image */}
          <div
            className="ratio ratio-16x9 bg-light mb-3"
            style={{ overflow: "hidden" }}
          >
            <img
              src={prefixUrl(product.primary_image || "images/noimage.png")}
              alt={product.name}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>

          {/* Info */}
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <strong>Serial/SKU:</strong>
              <span className="font-monospace">{product.sku}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Price:</strong>
              <span className="text-success fw-semibold">
                ₱{Number(product.price).toFixed(2)}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Stock:</strong>
              <span className="text-success fw-semibold">
                {product.available_qty}/{product.total_qty || product.capacity || 0}
              </span>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-auto d-flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((t, i) => (
                <Badge key={i} color="primary" className="text-dark">
                  {t}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge color="primary" className="text-muted">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* QR modal kept for future, but hidden since no button */}
      <QRCodeGenerator
        product={product}
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  );
};

export default ProductCard;
