import React, { useState } from "react";
import {
  Card, CardHeader, CardBody,
  Container, Row, Col,
  Button, Input, Label, Alert, Badge, InputGroup, InputGroupText
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Swal from "sweetalert2";

const demoProduct = {
  qrCode: "QR001APF747",
  name: "Premium Award Plaque",
  sku: "APF747",
  quantity: 150,
  category: "Awards",
  warehouse: "Main Warehouse",
  description: "High-quality crystal award plaque with custom engraving",
  status: "In Stock", // In Stock | In Transit | Disposed
};

const getQRCodeActions = (status) => {
  switch (status) {
    case "In Stock":
      return ["Ship", "Dispose"];
    case "In Transit":
      return ["Receive"];
    default:
      return [];
  }
};

const statusBadgeClass = (status) => {
  if (status === "In Stock") return "badge bg-success-subtle text-success";
  if (status === "In Transit") return "badge bg-warning-subtle text-warning";
  if (status === "Disposed") return "badge bg-danger-subtle text-danger";
  return "badge bg-secondary-subtle text-secondary";
};

const QRScanner = () => {
  document.title = "QR Code Scanner | APC Inventory";

  const [qrCode, setQrCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null); // { success, product?, message?, actions? }
  const [selectedAction, setSelectedAction] = useState("");

  const handleScan = () => {
    const code = String(qrCode || "").trim();
    if (!code) return;

    // Demo lookup
    if (code === demoProduct.qrCode) {
      const actions = getQRCodeActions(demoProduct.status);
      setResult({ success: true, product: { ...demoProduct }, actions });
    } else {
      setResult({ success: false, message: "Product not found. Please check the QR code." });
    }
  };

  const simulateCamera = async () => {
    setIsScanning(true);
    // Simulate camera delay and auto-fill the demo code
    setTimeout(() => {
      setQrCode(demoProduct.qrCode);
      setIsScanning(false);
    }, 1600);
  };

  const handleAction = () => {
    if (!result?.success || !result.product || !selectedAction) return;

    const p = { ...result.product };

    if (selectedAction === "Ship") p.status = "In Transit";
    if (selectedAction === "Receive") p.status = "In Stock";
    if (selectedAction === "Dispose") p.status = "Disposed";

    Swal.fire({
      icon: "success",
      title: "Action Completed",
      text:
        selectedAction === "Ship"
          ? `Product "${p.name}" marked as shipped (now In Transit).`
          : selectedAction === "Receive"
          ? `Product "${p.name}" received and now In Stock.`
          : `Product "${p.name}" has been disposed and removed from active inventory.`,
      confirmButtonText: "OK",
    });

    setResult({ success: true, product: p, actions: getQRCodeActions(p.status) });
    setSelectedAction("");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="QR Code Scanner" pageTitle="Dashboard" url="/dashboard" />
        <p className="text-muted mb-3">
          Scan or enter QR codes to track and manage products
        </p>

        {/* Scanner */}
        <Card className="mb-3">
          <CardHeader>
            <h6 className="mb-0"><i className="ri-scan-2-line me-2"></i>Scan Product QR Code</h6>
          </CardHeader>
          <CardBody>
            {/* Camera area */}
            <div
              className="rounded d-flex align-items-center justify-content-center mb-3"
              style={{
                height: 220,
                border: "2px dashed var(--vz-border-color, #e9ecef)",
                background: "rgba(0,0,0,0.01)",
              }}
            >
              {!isScanning ? (
                <div className="text-center">
                  <i className="ri-camera-3-line text-muted" style={{ fontSize: 48 }}></i>
                  <p className="text-muted mb-2">Position QR code within the frame</p>
                  <Button color="dark" onClick={simulateCamera}>
                    <i className="ri-camera-line me-1"></i> Start Camera Scan
                  </Button>
                </div>
              ) : (
                <div className="text-center w-100 px-5">
                  <div className="mb-2">
                    <i className="ri-camera-lens-line text-primary" style={{ fontSize: 48 }}></i>
                  </div>
                  <div className="text-primary fw-medium mb-2">Scanning...</div>
                  <div className="progress" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: "60%" }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual entry */}
            <Label className="mb-1">Or enter QR code manually:</Label>
            <InputGroup className="mb-2">
              <Input
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Enter QR code (e.g., QR001APF747)"
              />
              <Button color="secondary" onClick={handleScan} disabled={!qrCode.trim()}>
                Scan
              </Button>
            </InputGroup>

            <Alert color="light" className="d-flex align-items-center gap-2 mb-0">
              <i className="ri-coupon-2-line"></i>
              <div>
                <strong>Demo:</strong> Try scanning <code>{demoProduct.qrCode}</code> to see the system in action!
              </div>
            </Alert>
          </CardBody>
        </Card>

        {/* Scan Result */}
        {result && (
          <Card className="mb-3">
            <CardHeader>
              <h6 className="mb-0">
                {result.success ? (
                  <i className="ri-check-fill text-success me-2"></i>
                ) : (
                  <i className="ri-alert-line text-danger me-2"></i>
                )}
                Scan Result
              </h6>
            </CardHeader>
            <CardBody>
              {result.success && result.product ? (
                <>
                  <div className="p-3 rounded border bg-success-subtle mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0 text-success">{result.product.name}</h6>
                      <span className={statusBadgeClass(result.product.status)}>{result.product.status}</span>
                    </div>

                    <Row className="text-muted small">
                      <Col md={6} className="mb-1">
                        <span>SKU:</span> <span className="fw-medium ms-1">{result.product.sku}</span>
                      </Col>
                      <Col md={6} className="mb-1">
                        <span>Quantity:</span> <span className="fw-medium ms-1">{result.product.quantity}</span>
                      </Col>
                      <Col md={6} className="mb-1">
                        <span>Category:</span> <span className="ms-1">{result.product.category}</span>
                      </Col>
                      <Col md={6} className="mb-1">
                        <span>Warehouse:</span> <span className="ms-1">{result.product.warehouse}</span>
                      </Col>
                    </Row>
                    <p className="text-muted small mb-0 mt-2">{result.product.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="mb-2">
                    <Label className="mb-1">Select Action:</Label>
                    <Input
                      type="select"
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                    >
                      <option value="">Choose an action</option>
                      {result.actions?.map((a) => (
                        <option key={a} value={a}>{a} Product</option>
                      ))}
                    </Input>
                  </div>
                  <Button color="secondary" disabled={!selectedAction} onClick={handleAction}>
                    Execute Action
                  </Button>
                </>
              ) : (
                <Alert color="danger" className="mb-0">
                  {result.message}
                </Alert>
              )}
            </CardBody>
          </Card>
        )}

        {/* Workflow Guide */}
        <Card>
          <CardHeader>
            <h6 className="mb-0">Workflow Guide</h6>
          </CardHeader>
          <CardBody>
            <div className="text-muted small">
              <div className="d-flex align-items-start gap-3 mb-3">
                <span className="badge rounded-pill bg-primary-subtle text-primary fw-semibold px-3 py-2">1</span>
                <div>
                  <div className="fw-medium text-dark">Production Complete</div>
                  <div>Product added with auto-generated QR code</div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-3">
                <span className="badge rounded-pill bg-warning-subtle text-warning fw-semibold px-3 py-2">2</span>
                <div>
                  <div className="fw-medium text-dark">Ship to Overseas</div>
                  <div>QR scan updates status to "In Transit"</div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-3">
                <span className="badge rounded-pill bg-success-subtle text-success fw-semibold px-3 py-2">3</span>
                <div>
                  <div className="fw-medium text-dark">Received at Destination</div>
                  <div>QR scan confirms arrival and updates inventory</div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <span className="badge rounded-pill bg-danger-subtle text-danger fw-semibold px-3 py-2">4</span>
                <div>
                  <div className="fw-medium text-dark">Product Disposed</div>
                  <div>Final scan removes item from active inventory</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default QRScanner;
