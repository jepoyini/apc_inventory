// ================================================================
// FILE: src/pages/Dashboard/RecentTrackingActivity.jsx
// ================================================================
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Badge,
  UncontrolledTooltip,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";

const RecentTrackingActivity = () => {
  const apipost = new APIClient();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CREATED":
        return <Badge className="created-status">CREATED</Badge>;
      case "AVAILABLE":
        return <Badge color="success">AVAILABLE</Badge>;
      case "IN_TRANSIT":
        return <Badge color="info">IN-TRANSIT</Badge>;
      case "IN_STOCK":
        return <Badge color="primary">IN-STOCK</Badge>;
      case "SOLD":
        return <Badge color="dark">SOLD</Badge>;
      case "DISPOSED":
        return <Badge color="danger">DISPOSED</Badge>;
      case "RETURNED":
        return <Badge className="returned-status">RETURNED</Badge>;
      case "CHECK_IN":
        return <Badge className="checkin-status">CHECK-IN</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  const loadActivities = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await apipost.post(`/products/recent`, { page: pageNum });
      if (res?.activities?.length > 0) {
        setActivities((prev) => [...prev, ...res.activities]);
        setHasMore(res.activities.length >= 10); // assume API returns 10 at a time
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Failed to load tracking activity", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadActivities(nextPage);
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <h5 className="mb-0">Recent Tracking Activity</h5>
      </CardHeader>
      <CardBody>
        {loading && activities.length === 0 ? (
          <div className="text-center">
            <Spinner color="primary" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted">No recent tracking activity found.</p>
        ) : (
          <div className="list-group">
            {activities.map((a, idx) => (
              <div
                key={idx}
                className="list-group-item d-flex align-items-center justify-content-between"
              >
                {/* Left: Image */}
                <div className="d-flex align-items-center">
                  <img
                    src={prefixUrl(a.primary_image)}
                    alt={a.product_name}
                    className="me-3 rounded border"
                    style={{
                      width: "50px",
                      height: "40px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="flex-grow-1">
                    <span
                      id={`product-name-${idx}`}
                      className="fw-bold text-primary text-truncate d-inline-block"
                      style={{ cursor: "pointer", maxWidth: "220px" }}
                      onClick={() => navigate(`/products/${a.product_id}`)}
                    >
                      {a.product_name}
                    </span>
                    <UncontrolledTooltip
                      placement="top"
                      target={`product-name-${idx}`}
                    >
                      {a.product_name}
                    </UncontrolledTooltip>
                    <div className="small text-muted">
                      {a.user_name} • {a.warehouse_name || "—"} •{" "}
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right: Status */}
                <div>{getStatusBadge(a.status)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-3">
            <Button
              color="light"
              onClick={handleLoadMore}
              disabled={loading}
              className="shadow-sm"
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentTrackingActivity;
