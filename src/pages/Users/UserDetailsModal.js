// ================================================================
// FILE: src/pages/Users/UserDetailsModal.jsx
// ================================================================
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
  Spinner,
} from "reactstrap";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";
import { toast } from "react-toastify";
import ActivityLogs from "./ActivityLogs";

const UserDetailsModal = ({ open, onClose, userId }) => {
  const apipost = new APIClient();
  const [user, setUser] = useState(null);

  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsMaximized, setLogsMaximized] = useState(false);

  const loadUser = async () => {
    if (!userId) return;
    try {
      const r = await apipost.post("/users/details", { id: userId });
      setUser(r?.user || null);
    } catch {
      toast.error("Failed to load user details");
    }
  };

  const loadLogs = async () => {
    if (!userId) return;
    setLoadingLogs(true);
    try {
      const r = await apipost.post("/users/activitylogs", { id: userId });
      setLogs(r?.logs || []);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoadingLogs(false);
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
    <>
      {/* Main User Details Modal */}
      <Modal isOpen={open} toggle={onClose} size="lg" centered>
        <ModalHeader toggle={onClose}>
          <i className="ri-user-3-line me-2"></i> User Details
        </ModalHeader>
        <ModalBody>
          {/* Avatar + Info */}
          <Row className="align-items-center mb-4 border rounded shadow-sm p-4">
            <Col md={4} className="text-center mb-3 mb-md-0">
              <img
                src={prefixUrl(user.avatar)}
                alt="Avatar"
                className="rounded-circle shadow-sm mb-2"
                width="120"
                height="120"
                style={{ objectFit: "cover" }}
              />
              {/* Badges */}
              <div className="mt-2">
                {user.role_name && (
                  <Badge color="info" pill className="me-2">
                    <i className="ri-shield-user-line me-1"></i>
                    {user.role_name}
                  </Badge>
                )}
                {user.status && (
                  <Badge color={getStatusColor(user.status)} pill>
                    <i className="ri-checkbox-circle-line me-1"></i>
                    {user.status}
                  </Badge>
                )}
              </div>
            </Col>
            <Col md={8}>
              <h4 className="mb-1">
                {user.firstname} {user.lastname}
              </h4>

              <p className="mb-1">
                <span className="text-muted">
                  <i className="ri-at-line me-1"></i> Username / ID:
                </span>{" "}
                <strong>{user.username}</strong> &nbsp;|&nbsp; #{user.id}
              </p>

              <p className="mb-1">
                <span className="text-muted">
                  <i className="ri-mail-line me-1"></i> Email:
                </span>{" "}
                <a href={`mailto:${user.email}`} className="text-decoration-none">
                  {user.email}
                </a>
              </p>

              <p className="mb-1">
                <span className="text-muted">
                  <i className="ri-map-pin-line me-1"></i> Address:
                </span>{" "}
                {user.address || "No address"},{" "}
                {user.city || "—"}, {user.country || "—"} {user.zipcode || ""}
              </p>

              <p className="mb-1">
                <span className="text-muted">
                  <i className="ri-phone-line me-1"></i> Phone:
                </span>{" "}
                <a href={`tel:${user.phone}`} className="text-decoration-none">
                  {user.phone || "—"}
                </a>{" "}
                &nbsp;|&nbsp;
                <span className="text-muted">
                  <i className="ri-calendar-line me-1"></i> Date Joined:
                </span>{" "}
                {user.date_created || "—"}
              </p>

              <p className="mb-0">
                <span className="text-muted">
                  <i className="ri-time-line me-1"></i> Last Logged:
                </span>{" "}
                {user.logged_time || "—"} &nbsp;|&nbsp;
                <span className="text-muted">
                  <i className="ri-map-pin-user-line me-1"></i> Location:
                </span>{" "}
                {user.logged_location || "Unknown"}
              </p>
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
          <Button
            color="info"
            onClick={() => {
              setLogsOpen(true);
              loadLogs();
            }}
          >
            <i className="ri-file-list-2-line me-1"></i> Activity Logs
          </Button>
          <Button color="secondary" onClick={onClose}>
            <i className="ri-close-line me-1"></i> Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Activity Logs Modal with Maximize/Restore */}
      <Modal
        isOpen={logsOpen}
        toggle={() => setLogsOpen(false)}
        size={logsMaximized ? "xl" : "lg"}
        fullscreen={logsMaximized}
        centered={!logsMaximized}
      >
<ModalHeader toggle={() => setLogsOpen(false)}>
  <div className="d-flex align-items-center w-100">
    <div>
      <i className="ri-file-list-2-line me-2"></i> Activity Logs
    </div>
    <div  style={{ marginLeft: "10px" }}>
      <Button
        size="sm"
        color="light"
        onClick={() => setLogsMaximized(!logsMaximized)}
        title={logsMaximized ? "Restore" : "Maximize"}
      >
        {logsMaximized ? (
          <i className="ri-contract-left-right-line"></i>
        ) : (
          <i className="ri-fullscreen-line"></i>
        )}
      </Button>
    </div>
  </div>
</ModalHeader>


        <ModalBody>
          {loadingLogs ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "200px" }}
            >
              <Spinner color="primary" />
            </div>
          ) : (
            <ActivityLogs logs={logs} loading={loadingLogs} />
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default UserDetailsModal;
