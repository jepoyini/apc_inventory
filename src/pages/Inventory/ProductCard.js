// ================================================================
// FILE: src/pages/Inventory/ProductCard.jsx
// ================================================================
import React, { useState } from "react";
import { Card, CardBody, Badge, Button } from "reactstrap";
import { api } from "../../config"; 
import DeleteModal from "../../Components/Common/DeleteModal";
import QRCodeGenerator from "./QRCodeGenerator"; // adjust path if needed

const ProductCard = ({ product, onView, onDelete, onEdit }) => {

  const [qrOpen, setQrOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png";
    if (url === "images/no-image.png") return base + "/images/noimage.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const handleDelete = () => {
    setDeleteModal(false);
    onDelete(product.id);
  };

  return (
    <>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Card className="h-100 shadow-sm">
        <CardBody className="d-flex flex-column">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 className="mb-1">{product.name}</h5>
              <Badge color="info" pill className="me-2">{product.category}</Badge>
              <Badge color={product.status === "active" ? "success" : "secondary"} pill>
                {product.status}
              </Badge>
            </div>
         
          </div>

          {/* Product Image */}
          <div className="ratio ratio-16x9 bg-light mb-3" style={{ overflow: "hidden" }}>
            <img
              src={prefixUrl(product.primary_image || "images/noimage.png")}
              alt={product.name}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>



            {/* Info */}
            <div className="mb-3">
            <div className="d-flex justify-content-between">
                <strong>SKU:</strong>
                <span className="font-monospace">{product.sku}</span>
            </div>
            <div className="d-flex justify-content-between">
                <strong>Price:</strong>
                <span className="text-success fw-semibold">
                ${Number(product.price).toFixed(2)}
                </span>
            </div>
            <div className="d-flex justify-content-between">
                <strong>Stock:</strong>
                <span className="text-success fw-semibold">
                {product.available_qty}/{product.total_qty || product.capacity || 0}
                </span>
            </div>
            <div className="d-flex justify-content-between">
                <strong>Location:</strong>
                <span>
                <i className="ri-map-pin-line me-1 text-muted"></i>
                {product.warehouse_name || "N/A"}
                </span>
            </div>
            </div>



          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((t, i) => (
                <Badge key={i} color="primary" className="text-dark">{t}</Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge color="primary" className="text-muted">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}


        {/* Spacer to push actions down */}
        <div className="flex-grow-1"></div>

        {/* Actions */}
        <div className="d-flex justify-content-between mt-2">
            <Button color="light" size="sm" onClick={() => setQrOpen(true)}>
              <i className="ri-qr-code-line me-1" /> Generate QR
            </Button>

           <div className="d-flex gap-1">
              <Button color="light" size="sm" onClick={onView} title="View">
                <i className="ri-eye-line" />
              </Button>
              <Button 
                color="light" 
                size="sm" 
                onClick={() => onEdit(product)} 
                title="Edit"
              >
                <i className="ri-edit-2-line text-primary" />
              </Button>
              <Button 
                color="light" 
                size="sm" 
                onClick={() => setDeleteModal(true)} 
                title="Delete"
              >
                <i className="ri-delete-bin-6-line text-danger" />
              </Button>
            </div>

          </div>
        </CardBody>
      </Card>
      
      <QRCodeGenerator
        product={product}
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  );
};

export default ProductCard;

