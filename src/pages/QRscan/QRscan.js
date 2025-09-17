// ================================================================
// FILE: src/pages/Inventory/QRScanner.js
// ================================================================
import React, { useState, useEffect, useRef } from "react";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Input, Label, Badge, Nav, NavItem, NavLink,
  TabContent, TabPane, Spinner
} from "reactstrap";
import classnames from "classnames";
import {
  RiQrCodeLine, RiCameraLine, RiUpload2Line,
  RiCheckLine, RiCloseLine
} from "react-icons/ri";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";
import { useNavigate } from "react-router-dom";
import QrReader from "react-qr-scanner";
import Swal from "sweetalert2";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const QRScanner = () => {
  const navigate = useNavigate();
  const apipost = new APIClient();
  const [activeTab, setActiveTab] = useState("manual");
  const [scanHistory, setScanHistory] = useState([]);
  const [batchScans, setBatchScans] = useState([]);
  const [selectedAction, setSelectedAction] = useState("none");
  const [loading, setLoading] = useState(false);
  const manualInputRef = useRef(null);
  const batchInputRef = useRef(null);
  const obj = JSON.parse(sessionStorage.getItem("authUser"));
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  function showToast(message, error) {
    let backgroundColor = "#405189"; // default

    if (error) {
      backgroundColor = "#f06548";   // 🔴 Bootstrap danger
    } else {
      backgroundColor = "#0ab39c";   // 🟢 Bootstrap success
    }

    Toastify({
      text: message,
      gravity: "bottom",
      position: "right",
      duration: 2000,
      close: true,
      backgroundColor: backgroundColor,
    }).showToast();
  }
  
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // If action is "none", ignore
      if (selectedAction === "none") return;

      // Detect scanner input start (any printable char)
      if (e.key.length === 1 || e.key === "Enter") {
        if (activeTab === "manual" && manualInputRef.current) {
          manualInputRef.current.focus();
        } else if (activeTab === "batch" && batchInputRef.current) {
          batchInputRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [activeTab, selectedAction]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const sendToServer = async (code) => {
  
    setLoading(true);
    try {
      const payload = {
        code,
        action: selectedAction !== "none" ? selectedAction : null,
        warehouse_id: selectedWarehouse,
        uid: obj.id,
      };

      const res = await apipost.post(`/products/scan`, payload);
      if (res.status == 'error') {
          showToast(`${res.message}`, 'error');
      } else {
          const entry = {
            code,
            timestamp: new Date().toLocaleString(),
            success: res?.status === "success",
            action: payload.action,
            product_id: res.product?.id,
            name: res.product?.name,
            image: res.product?.primary_image,
            warehouse_name: res.warehouse_name,
          };
          setScanHistory((prev) => [entry, ...prev].slice(0, 100));

          if (entry.success) {
            showToast(`Scan saved: ${entry.name || code}`);
          } else {
            showToast(`Failed to save: ${code}`,1);
          }
      }
    } catch (e) {
      console.error(e);
       showToast("Error connecting to server",1);
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "CREATED":   return <Badge className="created-status mw-70">CREATED</Badge>;
      case "AVAILABLE": return <Badge color="success" className="mw-70">AVAILABLE</Badge>;
      case "IN_TRANSIT":return <Badge color="info" className="mw-70">IN-TRANSIT</Badge>;
      case "IN_STOCK":  return <Badge color="primary" className="mw-70">IN-STOCK</Badge>;
      case "SOLD":      return <Badge color="dark" className="mw-70">SOLD</Badge>;
      case "DISPOSED":  return <Badge color="danger" className="mw-70">DISPOSED</Badge>;
      case "RETURNED":  return <Badge className="returned-status mw-70">RETURNED</Badge>;
      case "CHECK_IN":  return <Badge className="returned-status mw-70">CHECK-IN</Badge>;
      default:          return <Badge color="secondary" className="mw-70">{status}</Badge>;
    }
  };
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await apipost.post("/warehouses", {});
        setWarehouses(res.warehouses || []);
      } catch (e) {
        console.error("Failed to fetch warehouses", e);
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (manualInputRef.current && activeTab === "manual") {
      manualInputRef.current.focus();
    }
  }, [activeTab]);

  const handleManualKey = (code) => {
    if (!code) return;
    sendToServer(code);
  };

  const handleBatchAdd = (code) => {
    if (!code) return;
    setBatchScans((prev) => [...prev, code]);
  };

  const handleBatchCommit = async () => {
    for (const code of batchScans) {
      await sendToServer(code);
    }
    setBatchScans([]);
  };

  const handleCameraScan = (result) => {
    if (result && result.text) {
      sendToServer(result.text);
    }
  };

  const handleCameraError = (err) => {
    console.error("Camera error", err);
    showToast("Error connecting to server",1); 
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <h5 className="mb-0 d-flex align-items-center">
                  <RiQrCodeLine className="me-2" /> QR Scanner
                </h5>
              </CardHeader>

              <CardBody>
                {loading && (
                  <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1050 }}
                  >
                    <div className="bg-white rounded shadow p-4 d-flex flex-column align-items-center">
                      <Spinner size="lg" color="primary" />
                      <div className="mt-2 fw-semibold text-dark">Saving scan...</div>
                    </div>
                  </div>
                )}

                {/* Actions + Legend Row */}
                <Row className="mb-4">
                  {/* 🔹 Actions */}
                  <Col xs={12} md={6}>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <Label className="mb-0 fw-semibold">Action:</Label>

                      <Input
                        type="select"
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                      >
                        <option value="none">None</option>
                        {/* <option value="CREATED">CREATED</option> */}
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="IN_TRANSIT">IN-TRANSIT</option>
                        <option value="CHECK_IN">CHECK-IN</option>
                        <option value="IN_STOCK">IN-STOCK</option>
                        <option value="SOLD">SOLD</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="DISPOSED">DISPOSED</option>
                      </Input>

                      {/* ✅ Keep Warehouse dropdown */}
                      {(selectedAction === "RECEIVE" ||
                        selectedAction === "MOVE" ||
                        selectedAction === "RETURNED" ||
                        selectedAction === "CHECK_IN" ||
                        selectedAction === "IN_TRANSIT" ||
                        selectedAction === "IN_STOCK") && (
                        <Input
                          type="select"
                          value={selectedWarehouse}
                          onChange={(e) => setSelectedWarehouse(e.target.value)}
                        >
                          <option value="">Select Warehouse</option>
                          {warehouses.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </Input>
                      )}

                      <Button
                        disabled={selectedAction === "none"}
                        color="success"
                        onClick={() => {
                          if (activeTab === "manual") {
                            setTimeout(() => manualInputRef.current?.focus(), 100);
                          } else if (activeTab === "batch") {
                            setTimeout(() => batchInputRef.current?.focus(), 100);
                          } else {
                            toggleTab("manual");
                            setTimeout(() => manualInputRef.current?.focus(), 150);
                          }
                        }}
                      >
                        <i className="ri-play-line me-1"></i> Start Scan
                      </Button>
                    </div>
                  </Col>

                  {/* 🔹 Legend */}
                  <Col xs={12} md={6}>
                    <Card>
                      <CardHeader>
                        <h6 className="mb-0 fw-bold">Statuses Legend</h6>
                      </CardHeader>
                      <CardBody>
                        <ul className="list-unstyled mb-0 small">
                          <li><Badge className="created-status mw-70 me-2">CREATED</Badge> Product created/defined</li>
                          <li><Badge color="success" className="mw-70 me-2">AVAILABLE</Badge> Items entered, ready at origin</li>
                          <li><Badge color="info" className="mw-70 me-2">IN-TRANSIT</Badge> On the way to warehouse</li>
                          <li><Badge className="mw-70 checkin-status me-2">CHECK-IN</Badge> Under verification/audit</li>
                          <li><Badge color="primary" className="mw-70 me-2">IN-STOCK</Badge> Officially received at warehouse</li>
                          <li><Badge color="dark" className="mw-70 me-2">SOLD</Badge> Sold/fulfilled order</li>
                          <li><Badge className="returned-status mw-70 me-2">RETURNED</Badge> Customer returned</li>
                          <li><Badge color="danger" className="mw-70 me-2">DISPOSED</Badge> Scrapped/destroyed</li>
                        </ul>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>



                {/* Tabs */}
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "manual" })}
                      onClick={() => toggleTab("manual")}
                      style={{ cursor: "pointer" }}
                    >
                      <RiQrCodeLine className="me-1" /> Keyboard / Scanner
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "camera" })}
                      onClick={() => toggleTab("camera")}
                      style={{ cursor: "pointer" }}
                    >
                      <RiCameraLine className="me-1" /> Camera
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "batch" })}
                      onClick={() => toggleTab("batch")}
                      style={{ cursor: "pointer" }}
                    >
                      <RiUpload2Line className="me-1" /> Batch
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab} className="pt-3">
                  {/* Camera Tab */}
                  <TabPane tabId="camera">
                    <div className="text-center">
                      <Card className="p-3">
                        <CardBody>
                          <h6>Live Camera Scan</h6>
                          <Button
                            color={cameraActive ? "danger" : "success"}
                            className="mb-3"
                            onClick={() => setCameraActive(!cameraActive)}
                          >
                            {cameraActive ? "Stop Camera" : "Start Camera"}
                          </Button>
                          <div
                            className="bg-light border rounded d-flex align-items-center justify-content-center"
                            style={{ height: 300 }}
                          >
                            {cameraActive && activeTab === "camera" ? (
                              <QrReader
                                delay={300}
                                onError={handleCameraError}
                                onScan={handleCameraScan}
                                style={{ width: "100%" }}
                              />
                            ) : (
                              <RiCameraLine size={48} className="text-muted" />
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </TabPane>

                  {/* Batch Tab */}
                  <TabPane tabId="batch">
                    <Row>
                      <Col md={12}>
                        <h6>Batch Scan Session</h6>
                        <Input
                          innerRef={batchInputRef}
                          placeholder="Scan or type a code..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              handleBatchAdd(e.target.value.trim());
                              e.target.value = "";
                            }
                          }}
                        />
                        <div className="mt-3">
                          {batchScans.length === 0 ? (
                            <p className="text-muted">No codes added</p>
                          ) : (
                            <ul className="list-group">
                              {batchScans.map((code, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                  <span className="font-monospace">{code}</span>
                                  <Badge color="info">Pending</Badge>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {batchScans.length > 0 && (
                          <Button color="success" className="mt-3" onClick={handleBatchCommit}>
                            <RiCheckLine className="me-1" /> Commit Batch
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </TabPane>

                  {/* Manual Tab */}
                  <TabPane tabId="manual">
                    <Row>
                      <Col md={3}>
                        <h6>Keyboard / Scanner Input</h6>
                        <Input
                          innerRef={manualInputRef}
                          disabled={selectedAction === "none"}
                          placeholder="Scan here..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              handleManualKey(e.target.value.trim());
                              e.target.value = "";
                            }
                          }}
                        />
                        <small className="text-muted">Works with physical scanners.</small>
                      </Col>
                    </Row>
                  </TabPane>
                </TabContent>

                {/* History Section */}
                <hr className="my-4" />
                <h6>Scan History</h6>
                {scanHistory.length === 0 ? (
                  <p className="text-muted">No scans yet</p>
                ) : (
                  <div className="list-group" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {scanHistory.map((scan, idx) => (
                      <div key={idx} className="list-group-item d-flex align-items-center">
                        {scan.image && (
                          <img
                            src={prefixUrl(scan.image)}
                            alt={scan.name || scan.code}
                            className="me-3 rounded border"
                            style={{ width: "50px", height: "40px", objectFit: "cover" }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <span
                            className="fw-bold text-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/products/${scan.product_id}`)}
                          >
                            {scan.name || scan.code}
                          </span>
                           <span style={{paddingLeft:'10px'}}></span>
                            {scan.action && (
                            getStatusBadge(scan.action)
                          )}
                          <div className="small text-muted">
                            {scan.code} • {scan.timestamp}
                            {scan.action && <> • {scan.action}</>}
                            {scan.warehouse_name && <> • {scan.warehouse_name}</>}
                          </div>
                        </div>
                        <div>

                         
                          <Badge color={scan.success ? "success" : "danger"} pill>
                            {scan.success ? <RiCheckLine /> : <RiCloseLine />}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default QRScanner;
