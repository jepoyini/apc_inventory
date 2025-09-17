// ================================================================
// FILE: src/pages/Users/UserCard.jsx
// ================================================================
import React from "react";
import {
  Card, CardBody, Button, Badge
} from "reactstrap";
import { api } from "../../config";

const UserCard = ({ user, onView, onEdit, onDelete }) => {
  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noavatar.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  // Role badge color mapping
  const getRoleColor = (role) => {
    if (!role) return "secondary";
    switch (role.toLowerCase()) {
      case "admin": return "info";
      case "manager": return "danger";
      case "staff": return "primary";
      default: return "info";
    }
  };

  // Status badge color mapping
  const getStatusColor = (status) => {
    if (!status) return "secondary";
    switch (status.toLowerCase()) {
      case "active": return "success";
      case "locked": return "danger";
      case "deleted": return "secondary";
      default: return "dark";
    }
  };

  return (
    <Card className="user-card shadow-sm">
      <CardBody className="text-center">
        {/* Avatar */}
        <img
          src={prefixUrl(user.avatar)}
          alt="Avatar"
          className="rounded-circle mb-3"
          width="80"
          height="80"
          style={{ objectFit: "cover" }}
        />

        {/* Name */}
        <h5 className="mb-1">{user.firstname} {user.lastname}</h5>

        {/* Username + ID */}
        <p className="text-muted small mb-2">
          {user.username} (#{user.id})
        </p>

        {/* Role Badge */}
        {user.role_name && (
          <Badge color={getRoleColor(user.role_name)} pill className="me-1 mb-2">
            <i className="ri-shield-user-line me-1"></i> {user.role_name}
          </Badge>
        )}

        {/* Status Badge */}
        {user.status && (
          <Badge color={getStatusColor(user.status)} pill className="mb-3">
            <i className="ri-checkbox-circle-line me-1"></i> {user.status}
          </Badge>
        )}

        {/* Logged Time & Location */}
        <div className="text-muted small mb-3">
          <div>Last Logged:</div>
          {user.logged_time && (
            <div>
              <i className="ri-time-line me-1"></i> {user.logged_time}
            </div>
          )}
          {user.logged_location && (
            <div>
              <i className="ri-map-pin-line me-1"></i> {user.logged_location}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-center gap-2 mt-2">
          <Button size="sm" color="info" onClick={onView}>
            <i className="ri-eye-line"></i>
          </Button>
          <Button size="sm" color="warning" onClick={onEdit}>
            <i className="ri-edit-line"></i>
          </Button>
          <Button size="sm" color="danger" onClick={onDelete}>
            <i className="ri-delete-bin-line"></i>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserCard;
