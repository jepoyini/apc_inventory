// ================================================================
// FILE: src/pages/Inventory/ImageGallery.jsx
// Drag & Drop upload with progress + Primary & Delete controls (server only)
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import {
  Row, Col, Card, CardBody, Button, Badge,
  Modal, ModalHeader, ModalBody, Progress
} from "reactstrap";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { api } from "../../config";

const ImageGallery = ({ productId, readonly = false }) => {
  const apiClient = useMemo(() => new APIClient(), []);
  const [viewer, setViewer] = useState({ open: false, index: 0 });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState([]); // [{file, preview, progress}]

  useEffect(() => {
    if (productId) refreshFromServer();
  }, [productId]);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png?a=14234";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const refreshFromServer = async () => {
    try {
      const r = await apiClient.post(`/products/${productId}/details`, {});
      const next = (r?.images || []).map((im) => ({
        ...im,
        url: prefixUrl(im.url),
      }));
      setImages(next);
    } catch (e) {
      console.error(e);
    }
  };

  const openViewer = (index) => setViewer({ open: true, index });
  const closeViewer = () => setViewer({ open: false, index: 0 });

  // --- Server actions ---
  const handleSetPrimary = async (image) => {
    try {
      await apiClient.post(`/products/${productId}/images/update`, {
        image_id: image.id,
        is_primary: true,
      });
      toast.success("Set as primary");
      await refreshFromServer();
    } catch {
      toast.error("Failed to set primary");
    }
  };

  const handleRemove = async (image) => {
    if (!window.confirm("Remove this image?")) return;
    try {
      await apiClient.post(`/products/${productId}/images/delete`, {
        image_id: image.id,
      });
      toast.success("Image removed");
      await refreshFromServer();
    } catch {
      toast.error("Failed to remove image");
    }
  };

  // --- Upload ---
  const handleFiles = (files) => {
    const arr = Array.from(files);

    const previews = arr.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    setUploading((prev) => [...prev, ...previews]);

    const fd = new FormData();
    arr.forEach((f) => fd.append("files[]", f));

    apiClient
      .post(`/products/${productId}/images/upload`, fd, {
        showLoader: false,
        onUploadProgress: (e) => {
          const prog = Math.round((e.loaded * 100) / e.total);
          setUploading((prev) =>
            prev.map((u) =>
              arr.includes(u.file) ? { ...u, progress: prog } : u
            )
          );
        },
      })
      .then(() => {
        toast.success(`Uploaded ${arr.length} image(s)`);
        setUploading((prev) => prev.filter((u) => !arr.includes(u.file)));
        refreshFromServer();
      })
      .catch(() => {
        toast.error("Upload failed");
        setUploading((prev) => prev.filter((u) => !arr.includes(u.file)));
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (readonly) return;
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    if (readonly) return;
    if (e.target.files.length) handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <>
{/* Dropzone */}
{!readonly && (
  <Card
    className="mb-3 border-dashed dropzone-card"
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
    onClick={() => document.getElementById("fileInput").click()}
  >
    <CardBody className="text-center">
      <p className="mb-2 text-muted">Drop files here to start uploading</p>
      <p className="mb-2 text-muted">or</p>
      <Button color="dark" size="sm">
        Select File
      </Button>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileInput}
      />
    </CardBody>
  </Card>
)}

      {/* Uploading Progress */}
      {uploading.length > 0 && (
        <Row className="g-2 mb-3">
          {uploading.map((u, idx) => (
            <Col key={idx} md={3} sm={4} xs={6}>
              <Card className="shadow-sm">
                <div className="ratio ratio-1x1 bg-light">
                  <img
                    src={u.preview}
                    alt={u.file.name}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
                <CardBody className="py-2">
                  <Progress value={u.progress} animated color="info" />
                  <small className="text-muted">{u.file.name}</small>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Gallery */}
      <Row className="g-2">
        {images.length > 0 ? (
          images.map((im, idx) => (
            <Col key={im.id} md={3} sm={4} xs={6}>
              <Card
                className={`h-100 shadow-sm ${
                  im.is_primary ? "border-primary" : ""
                }`}
              >
                <div className="ratio ratio-1x1 bg-light">
                  <img
                    src={prefixUrl(im.url)}
                    alt={im.alt || ""}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    onClick={() => openViewer(idx)}
                  />
                </div>
                {!readonly && (
                  <CardBody className="d-flex justify-content-between align-items-center py-2">
                    <Button
                      size="sm"
                      color={im.is_primary ? "primary" : "light"}
                      onClick={() => handleSetPrimary(im)}
                    >
                      <i
                        className={im.is_primary ? "ri-star-fill" : "ri-star-line"}
                      />
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => handleRemove(im)}
                    >
                      <i className="ri-delete-bin-6-line" />
                    </Button>
                  </CardBody>
                )}
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Card className="text-center p-4">
              <p className="text-muted mb-0">No images yet</p>
            </Card>
          </Col>
        )}
      </Row>

      {/* Modal viewer */}
      <Modal isOpen={viewer.open} toggle={closeViewer} size="lg" centered>
        <ModalHeader toggle={closeViewer}>
          {images[viewer.index]?.alt || "Image"}
        </ModalHeader>
        <ModalBody className="text-center">
          {images[viewer.index] && (
            <img
              src={prefixUrl(images[viewer.index].url)}
              alt={images[viewer.index].alt || ""}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
          {images[viewer.index]?.is_primary && (
            <div className="mt-2">
              <Badge color="primary">Primary</Badge>
            </div>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default ImageGallery;
