import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Badge,
} from "reactstrap";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";
import { toast } from "react-toastify";

const UserDetailsModal = ({ open, onClose, userId }) => {
  const apipost = new APIClient();
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    if (!userId) return;
    try {
      const r = await apipost.post("/users/details", { id: userId });
      setUser(r?.user || null);
    } catch {
      toast.error("Failed to load user details");
    }
  };

  useEffect(() => {
    if (open) loadUser();
  }, [open, userId]);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noavatar.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "success";
      case "locked":
        return "warning";
      case "deleted":
        return "secondary";
      default:
        return "dark";
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>
        <i className="ri-user-3-line me-2"></i> User Details
      </ModalHeader>
      <ModalBody>
        {/* Avatar + Basic Info */}
        <div className="text-center mb-4 border rounded shadow-sm p-4">
          <img
            src={prefixUrl(user.avatar)}
            alt="Avatar"
            className="rounded-circle shadow-sm mb-3"
            width="120"
            height="120"
            style={{ objectFit: "cover" }}
          />
          <h4 className="mb-1">
            {user.firstname} {user.lastname}
          </h4>
          <p className="text-muted mb-1">
            <i className="ri-at-line me-1"></i>
            {user.username} &nbsp;|&nbsp; #{user.id}
          </p>
          <p className="text-muted mb-0">
            <i className="ri-mail-line me-1"></i>
            {user.email}
          </p>
        </div>

        {/* Role + Status */}
        <Row className="mb-4">
          <Col md={6}>
            <div className="border rounded shadow-sm p-3 text-center h-100">
              <p className="text-muted mb-1">
                <i className="ri-shield-user-line me-1"></i> Role
              </p>
              <h6>
                <Badge color="info" pill>
                  {user.role_name || "—"}
                </Badge>
              </h6>
            </div>
          </Col>
          <Col md={6}>
            <div className="border rounded shadow-sm p-3 text-center h-100">
              <p className="text-muted mb-1">
                <i className="ri-shield-check-line me-1"></i> Status
              </p>
              <h6>
                <Badge color={getStatusColor(user.status)} pill>
                  {user.status}
                </Badge>
              </h6>
            </div>
          </Col>
        </Row>

        {/* Contact + Address */}
        <Row className="mb-4">
          <Col md={6}>
            <div className="border rounded shadow-sm p-3 h-100">
              <p className="text-muted mb-1">
                <i className="ri-phone-line me-1"></i> Phone
              </p>
              <h6>{user.phone || "—"}</h6>
            </div>
          </Col>
          <Col md={6}>
            <div className="border rounded shadow-sm p-3 h-100">
              <p className="text-muted mb-1">
                <i className="ri-map-pin-line me-1"></i> Location
              </p>
              <h6>
                {user.city || "—"}, {user.country || "—"} {user.zipcode || ""}
              </h6>
              <div className="small text-muted">{user.address || "No address"}</div>
            </div>
          </Col>
        </Row>

        {/* Permissions */}
        <div className="border rounded shadow-sm p-3 mb-3">
          <h6 className="mb-3">
            <i className="ri-lock-2-line me-1"></i> Permissions
          </h6>
          <Row>
            <Col md={6} className="mb-3">
              <h6>
                <i className="ri-user-settings-line me-1"></i> Users
              </h6>
              <ul className="list-unstyled mb-0">
                {["add", "edit", "delete"].map((p) => (
                  <li key={p}>
                    {user.permissions?.users?.[p] ? "✅" : "❌"} {p}
                  </li>
                ))}
              </ul>
            </Col>
            <Col md={6} className="mb-3">
              <h6>
                <i className="ri-archive-line me-1"></i> Inventory
              </h6>
              <ul className="list-unstyled mb-0">
                {["add", "edit", "delete"].map((p) => (
                  <li key={p}>
                    {user.permissions?.inventory?.[p] ? "✅" : "❌"} {p}
                  </li>
                ))}
              </ul>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <h6>
                <i className="ri-qr-code-line me-1"></i> QR Scanning
              </h6>
              {user.permissions?.qr ? "✅ Allowed" : "❌ Not Allowed"}
            </Col>
            <Col md={6} className="mb-3">
              <h6>
                <i className="ri-bar-chart-line me-1"></i> Reports
              </h6>
              {user.permissions?.reports ? "✅ Allowed" : "❌ Not Allowed"}
            </Col>
          </Row>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          <i className="ri-close-line me-1"></i> Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UserDetailsModal;
