// ================================================================
// FILE: src/pages/Inventory/ImageGallery.jsx
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, CardBody, Button, Badge, Modal, ModalHeader, ModalBody } from "reactstrap";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { api } from "../../config"; 

const ImageGallery = ({
  productId = null,
  images = [],
  onServerChange = null,
  onLocalChange = null,
  readonly = false,
}) => {
  const apiClient = useMemo(() => new APIClient(), []);
  const [viewer, setViewer] = useState({ open: false, image: null });

  const [localImages, setLocalImages] = useState(images || []);
  const [localFiles, setLocalFiles] = useState([]);

  useEffect(() => {
    if (!productId) {
      setLocalImages(images || []);
    }
  }, [productId, images]);

  const prefixUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return api.IMAGE_URL.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
  };

  const primary = (productId ? images : localImages)?.find((im) => im.is_primary) ||
                  (productId ? images : localImages)?.[0];

  const openViewer = (im) => setViewer({ open: true, image: im });
  const closeViewer = () => setViewer({ open: false, image: null });

  const handleSetPrimaryLocal = (idx) => {
    const next = (productId ? images.slice() : localImages.slice()).map((im, i) => ({ ...im, is_primary: i === idx }));
    if (!productId) {
      setLocalImages(next);
      onLocalChange && onLocalChange({ images: next, files: localFiles });
    }
  };

  const handleRemoveLocal = (idx) => {
    const nextImgs = localImages.slice();
    const nextFiles = localFiles.slice();
    nextImgs.splice(idx, 1);
    nextFiles.splice(idx, 1);
    if (nextImgs.length && !nextImgs.some((x) => x.is_primary)) nextImgs[0].is_primary = true;
    setLocalImages(nextImgs);
    setLocalFiles(nextFiles);
    onLocalChange && onLocalChange({ images: nextImgs, files: nextFiles });
  };

  const handleSetPrimaryServer = async (image) => {
    try {
      await apiClient.post(`/products/${productId}/images/update`, { image_id: image.id, is_primary: true });
      toast.success("Set as primary");
      await refreshFromServer();
    } catch {
      toast.error("Failed to set primary");
    }
  };

  const handleRemoveServer = async (image) => {
    if (!window.confirm("Remove this image?")) return;
    try {
      await apiClient.post(`/products/${productId}/images/delete`, { image_id: image.id });
      toast.success("Image removed");
      await refreshFromServer();
    } catch {
      toast.error("Failed to remove image");
    }
  };

  const refreshFromServer = async () => {
    try {
      const r = await apiClient.post(`/products/${productId}/details`, {});
      const next = (r?.images || []).map((im) => ({
        ...im,
        url: prefixUrl(im.url),
      }));
      onServerChange && onServerChange(next);
    } catch {}
  };

  const onFileSelect = async (ev) => {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;

    if (productId) {
      const fd = new FormData();
      files.forEach((f) => fd.append("files[]", f));
      try {
        await apiClient.post(`/products/${productId}/images/upload`, fd, { showLoader: false });
        toast.success(`Uploaded ${files.length} image(s)`);
        await refreshFromServer();
      } catch {
        toast.error("Upload failed");
      }
    } else {
      const previews = files.map((file, i) => ({
        id: null,
        url: URL.createObjectURL(file), // preview stays local
        alt: file.name,
        is_primary: localImages.length === 0 && i === 0,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "you",
      }));
      const nextImgs = [...localImages, ...previews];
      const nextFiles = [...localFiles, ...files];
      setLocalImages(nextImgs);
      setLocalFiles(nextFiles);
      onLocalChange && onLocalChange({ images: nextImgs, files: nextFiles });
    }

    ev.target.value = "";
  };

  const currentImages = productId ? images.map((im) => ({ ...im, url: prefixUrl(im.url) })) : localImages;

  return (
    <>
      {/* Main display */}
      {currentImages?.length > 0 && primary && (
        <Card className="mb-3">
          <div className="ratio ratio-4x3 bg-light">
            <img
              src={prefixUrl(primary.url)}
              alt={primary.alt || ""}
              style={{ objectFit: "cover", width: "100%", height: "100%", cursor: "pointer" }}
              onClick={() => openViewer(primary)}
            />
          </div>
          <CardBody className="d-flex justify-content-between align-items-center">
            <Badge color="primary" pill><i className="ri-star-fill me-1" /> Primary</Badge>
            {!readonly && (
              <label className="btn btn-secondary btn-sm mb-0">
                <i className="ri-upload-2-line me-1" /> Add Images
                <input type="file" accept="image/*" multiple hidden onChange={onFileSelect} />
              </label>
            )}
          </CardBody>
        </Card>
      )}

      {/* Thumbnails */}
      <Row className="g-2">
        {currentImages?.length ? currentImages.map((im, idx) => (
          <Col key={(im.id ?? "tmp") + "-" + idx} md={3} sm={4} xs={6}>
            <Card className="h-100 shadow-sm">
              <div className="ratio ratio-1x1 bg-light">
                <img
                  src={prefixUrl(im.url)}
                  alt={im.alt || ""}
                  style={{ objectFit: "cover", width: "100%", height: "100%", cursor: "pointer" }}
                  onClick={() => openViewer(im)}
                />
              </div>
              {!readonly && (
                <CardBody className="d-flex justify-content-between align-items-center py-2">
                  <Button
                    size="sm"
                    color={im.is_primary ? "primary" : "light"}
                    onClick={() => productId ? handleSetPrimaryServer(im) : handleSetPrimaryLocal(idx)}
                  >
                    <i className={im.is_primary ? "ri-star-fill" : "ri-star-line"} />
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => productId ? handleRemoveServer(im) : handleRemoveLocal(idx)}
                  >
                    <i className="ri-delete-bin-6-line" />
                  </Button>
                </CardBody>
              )}
            </Card>
          </Col>
        )) : (
          <Col>
            <Card>
              <CardBody className="text-center text-muted">
                No images yet
                {!readonly && (
                  <div className="mt-2">
                    <label className="btn btn-secondary btn-sm mb-0">
                      <i className="ri-upload-2-line me-1" /> Add Images
                      <input type="file" accept="image/*" multiple hidden onChange={onFileSelect} />
                    </label>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        )}
      </Row>

      {/* Viewer */}
      <Modal isOpen={viewer.open} toggle={closeViewer} size="lg" centered>
        <ModalHeader toggle={closeViewer}>{viewer.image?.alt || "Image"}</ModalHeader>
        <ModalBody>
          {viewer.image && (
            <div className="text-center">
              <img
                src={prefixUrl(viewer.image.url)}
                alt={viewer.image.alt || ""}
                style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
              />
              {viewer.image.is_primary && <div className="mt-2"><Badge color="primary">Primary</Badge></div>}
            </div>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default ImageGallery;
