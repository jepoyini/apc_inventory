// ================================================================
// FILE: src/pages/Inventory/QRCodeGenerator.js
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, Row, Col, Card, CardBody,
  Input, Label, Button, FormGroup, Badge
} from "reactstrap";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import ReactDOMServer from "react-dom/server";
import * as ReactDOM from "react-dom/client";

const QRCodeGenerator = ({ product, open, onClose }) => {
  const [format, setFormat] = useState("sku"); // sku or serial
  const [size, setSize] = useState(200);
  const [includeText, setIncludeText] = useState(true);
  const [customText, setCustomText] = useState("");
  const [mode, setMode] = useState("product"); // product or items
  const [serials, setSerials] = useState([]);

  const qrWrapperRef = useRef(null);

  useEffect(() => {
    if (product) {
      setCustomText("");
      setFormat("sku");
      setMode("product");
      // simulate fetching serials if in "items" mode
      setSerials(product.items || []);
    }
  }, [product]);

  const qrValue = () => {
    if (!product) return "";
    if (format === "sku") return product.sku;
    return `${product.sku}-${Date.now()}`; // fallback serial value
  };

  const handleDownload = async () => {
    if (!qrWrapperRef.current) return;
    const canvas = await html2canvas(qrWrapperRef.current, { scale: 2 });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product.sku}-qr.png`;
    link.click();
  };

const handlePrint = async () => {
  if (!qrWrapperRef.current) return;

  // Capture the QR area with labels
  const canvas = await html2canvas(qrWrapperRef.current, { scale: 2 });
  const url = canvas.toDataURL("image/png");

  // Open a new print window
  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Print QR Code</title>
        <style>
          body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; }
          img { max-width:100%; max-height:100%; }
        </style>
      </head>
      <body>
        <img id="qrPrint" src="${url}" />
      </body>
    </html>
  `);

  // Wait for the image to load before printing
  const img = win.document.getElementById("qrPrint");
  img.onload = () => {
    win.focus();
    win.print();
    win.close();
  };
};



const handleDownloadAll = async () => {
  let list = [];
debugger; 
  if (mode === "items" && product?.available_qty) {
    list = Array.from({ length: product.available_qty }, (_, idx) => ({
      sku: `${product.sku}-${idx + 1}`,
      name: product.name,
      data: `${product.sku}-${idx + 1}`,
      customText,
    }));
  } else if (mode === "product" && product) {
    list = [
      {
        sku: product.sku,
        name: product.name,
        data: product.sku,
        customText,
      },
    ];
  }

  if (!list.length) {
    toast.warning("No data to export");
    return;
  }

  const zip = new JSZip();

  for (const item of list) {
    // Temporary container
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.padding = "10px";
    wrapper.style.textAlign = "center";
    wrapper.style.fontFamily = "sans-serif";
    wrapper.style.background = "#fff";

    const qrNode = document.createElement("div");
    wrapper.appendChild(qrNode);
    document.body.appendChild(wrapper);

    const root = ReactDOM.createRoot(qrNode);
    root.render(<QRCodeCanvas value={item.data} size={200} includeMargin />);

    // Wait a moment for QR to render
    await new Promise((r) => setTimeout(r, 300));

    // Labels
    const sku = document.createElement("div");
    sku.style.fontWeight = "bold";
    sku.style.marginTop = "5px";
    sku.innerText = item.sku;
    wrapper.appendChild(sku);

    if (item.name) {
      const name = document.createElement("div");
      name.style.fontSize = "12px";
      name.style.color = "#555";
      name.innerText = item.name;
      wrapper.appendChild(name);
    }

    if (item.customText) {
      const custom = document.createElement("div");
      custom.style.fontSize = "11px";
      custom.style.color = "green";
      custom.innerText = item.customText;
      wrapper.appendChild(custom);
    }

    const canvas = await html2canvas(wrapper, { scale: 2 });
    const url = canvas.toDataURL("image/png");
    zip.file(`${item.sku || "qr"}.png`, url.split(",")[1], { base64: true });

    document.body.removeChild(wrapper);
    root.unmount();
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "qrcodes.zip");
};



  if (!product) return null;

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>
        QR Code Generator - {product.name}
      </ModalHeader>
      <ModalBody>
        <Row>
          {/* Left: Settings */}
          <Col md={4}>
            <Card className="h-100">
              <CardBody>
                <h5 className="mb-3">QR Code Settings</h5>
                <FormGroup>
                  <Label>Mode</Label>
                  <Input
                    type="select"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="product">Product (1 QR)</option>
                    <option value="items">Items (each unit)</option>
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label>Format</Label>
                  <Input
                    type="select"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="sku">Standard (SKU)</option>
                    <option value="serial">Serial</option>
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label>Size</Label>
                  <Input
                    type="select"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  >
                    <option value={150}>Small (150px)</option>
                    <option value={200}>Medium (200px)</option>
                    <option value={250}>Large (250px)</option>
                  </Input>
                </FormGroup>

                <FormGroup check className="mb-3">
                  <Input
                    type="checkbox"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                  />{" "}
                  Include text below QR
                </FormGroup>

                <FormGroup>
                  <Label>Custom Text (optional)</Label>
                  <Input
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Additional text"
                  />
                </FormGroup>

                <div className="mt-3">
                  <Label>QR Data Preview</Label>
                  <Input
                    type="textarea"
                    value={qrValue()}
                    readOnly
                  />
                  <Button
                    color="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigator.clipboard.writeText(qrValue())}
                  >
                    Copy Data
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Right: Preview */}
          <Col md={8}>
            <Card className="h-100">
              <CardBody className="text-center">
                <h5 className="mb-3">Preview</h5>
                <div ref={qrWrapperRef} className="p-3 d-inline-block bg-white">
                  <QRCodeCanvas value={qrValue()} size={size} />
                  {includeText && (
                    <>
                      <div className="fw-bold mt-2">{product.sku}</div>
                      <div className="text-muted">{product.name}</div>
                      {customText && (
                        <div className="text-success">{customText}</div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-3 d-flex justify-content-center gap-2">
                  <Button color="warning" onClick={() => {}}>
                    <i className="ri-refresh-line me-1" /> Generate
                  </Button>
                  <Button color="light" onClick={handleDownload}>
                    <i className="ri-download-2-line me-1" /> Download
                  </Button>
                  <Button color="light" onClick={handlePrint}>
                    <i className="ri-printer-line me-1" /> Print
                  </Button>
                  {mode === "items" && (
                    <Button color="dark" onClick={handleDownloadAll}>
                      <i className="ri-download-cloud-2-line me-1" /> Download All
                    </Button>
                  )}
                </div>

                <div className="mt-4 text-start">
                  <h6>Product Info</h6>
                  <div><strong>SKU:</strong> {product.sku}</div>
                  <div><strong>Name:</strong> {product.name}</div>
                  <div><strong>Category:</strong> {product.category}</div>
                  <div><strong>Warehouse:</strong> {product.warehouse_name}</div>
                  <div><strong>Total Quantity:</strong> {product.total_qty}</div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default QRCodeGenerator;
