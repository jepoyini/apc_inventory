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
import { toast } from "react-toastify";
import { api } from "../../config";
import { useNavigate } from "react-router-dom";
import QrReader from "react-qr-scanner";
import Swal from "sweetalert2";

const QRScanner = () => {
  const navigate = useNavigate();
  const apipost = new APIClient();
  const [activeTab, setActiveTab] = useState("camera");
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
    debugger; 
    setLoading(true);
    try {
        const payload = {
          code,
          action: selectedAction !== "none" ? selectedAction : null,
          warehouse_id: selectedWarehouse ,
          uid: obj.id,
        };

      const res = await apipost.post(`/products/scan`, payload);

      const entry = {
        code,
        timestamp: new Date().toLocaleString(),
        success: res?.status === "success",
        action: payload.action,
        product_id: res.product.id,
        name: res.product.name,
        image: res.product.primary_image,
        warehouse_name: res.warehouse_name,
      };
      setScanHistory((prev) => [entry, ...prev].slice(0, 100));


      if (entry.success) {
        toast.success(`Scan saved: ${entry.name || code}`);
      } else {
        toast.error(`Failed to save: ${code}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchWarehouses = async () => {

      try {
        const res = await apipost.post("/warehouses", {}); // <-- make sure you have this API
        setWarehouses(res.warehouses || []);
      } catch (e) {
        console.error("Failed to fetch warehouses", e);
      }
    };

  fetchWarehouses();
}, []);

  // ✅ Focus input for manual scans
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
      return;
      
      if (isMobile) {
        // On phone → preview first
        Swal.fire({
          title: "Scanned Code",
          text: `SKU / Code: ${result.text}`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Submit to Server",
          cancelButtonText: "Cancel"
        }).then((res) => {
          if (res.isConfirmed) sendToServer(result.text);
        });
      } else {
        // On desktop → send immediately
        sendToServer(result.text);
      }
    }
  };

  const handleCameraError = (err) => {
    console.error("Camera error", err);
    toast.error("Camera access error");
  };


  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <Card>

              {/* Header: only title */}
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

                {/* Actions Row */}
                <Row className="mb-4">
                  <Col xs={12} md={4}>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <Label className="mb-0 fw-semibold">Action:</Label>

                      <Input
                        type="select"
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                      >
                        <option value="none">None</option>
                        <option value="receive">Mark as Received</option>
                        <option value="ship">Mark as Shipped</option>
                        <option value="move">Move to Location</option>
                      </Input>

                      {(selectedAction === "receive" || selectedAction === "move") && (
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
                </Row>

                {/* Tabs */}
                <Nav tabs>
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
                      className={classnames({ active: activeTab === "manual" })}
                      onClick={() => toggleTab("manual")}
                      style={{ cursor: "pointer" }}
                    >
                     <RiQrCodeLine className="me-1" />  
                      Keyboard / Scanner
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
                            <p className="text-muted small">
                              Position your QR code in front of the camera.
                            </p>

                            {/* Toggle button */}
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
                          innerRef={batchInputRef}   // ✅ new ref
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
                                <li
                                  key={idx}
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                  <span className="font-monospace">{code}</span>
                                  <Badge color="info">Pending</Badge>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {batchScans.length > 0 && (
                          <Button
                            color="success"
                            className="mt-3"
                            onClick={handleBatchCommit}
                          >
                            <RiCheckLine className="me-1" /> Commit Batch
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </TabPane>

                  {/* Manual / Keyboard Tab */}

                  <TabPane tabId="manual">
                    <Row>
                      <Col md={3}>
                        <h6>Keyboard / Scanner Input</h6>
                        <Input
                          innerRef={manualInputRef}   // ✅ This must exist
                          placeholder="Scan here using barcode scanner..."
                         onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              handleManualKey(e.target.value.trim());
                              e.target.value = "";
                            }
                          }}

                        />
                        <small className="text-muted">
                          Works with physical barcode/QR scanners (auto-fills + Enter).
                        </small>
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
                  <div
                    className="list-group"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {scanHistory.map((scan, idx) => (
                      <div
                        key={idx}
                        className="list-group-item d-flex align-items-center"
                      >
                        {/* Thumbnail */}
                        {scan.image && (
                          <img
                            src={prefixUrl(scan.image)}
                            alt={scan.name || scan.code}
                            className="me-3 rounded border"
                            style={{
                              width: "50px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                          />
                        )}

                        {/* Details */}
                        <div className="flex-grow-1">
                          <span
                            className="fw-bold text-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/products/${scan.product_id}`)}
                          >
                            {scan.name || scan.code}
                          </span>
                          <div className="small text-muted">
                            {scan.code} • {scan.timestamp}
                            {scan.action === "receive" && scan.warehouse_name && (
                              <> • Received at {scan.warehouse_name}</>
                            )}
                            {scan.action === "move" && scan.warehouse_name && (
                              <> • Moved to {scan.warehouse_name}</>
                            )}
                            {scan.action === "ship" && (
                              <> • Marked as Shipped</>
                            )}
                          </div>
                        </div>




                        {/* Badges */}
                        <div>
                          {scan.action && (
                            <Badge color="info" pill className="me-2">
                              {scan.action}
                            </Badge>
                          )}
                          <Badge
                            color={scan.success ? "success" : "danger"}
                            pill
                          >
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
