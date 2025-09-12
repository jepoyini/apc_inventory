// ================================================================
// FILE: src/pages/Inventory/QRCodeGenerator.js
// ================================================================
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Modal, ModalHeader, ModalBody, Row, Col, Card, CardBody,
  Input, Label, Button, FormGroup
} from "reactstrap";
import QRCode from "qrcode"; // programmatic generator (not a component)
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

/** ---------------- Label constants (50mm x 30mm landscape) ---------------- */
const LABEL_W_MM = 50;       // label width in millimeters
const LABEL_H_MM = 30;       // label height in millimeters
const INNER_PAD_MM = 1;      // inner padding all around
const QR_BOX_MM = 20;        // visual QR box size (square) inside label
const PRINT_QR_PX = 600;     // QR bitmap resolution for crisp PRINT (scaled down to 28mm via CSS)

/** For ZIP export (PNG), we render a label in the DOM at CSS px and rasterize with scale>1 */
const EXPORT_SCALE = 4;      // html2canvas scale multiplier for sharper PNGs
const CSS_PX_PER_MM = 96 / 25.4; // ~3.7795 CSS px per mm (browser "96dpi" world)
const mm2px = (mm) => Math.round(mm * CSS_PX_PER_MM);

const SPACER_TOP_MM = 1.5;     // was flex:1 — now fixed, smaller
const SPACER_BOTTOM_MM = 1.0;  // space between QR and text

/** ---------------- Helpers ---------------- */
const clampMin = (val, min) => Math.max(Number(val) || min, min);
const sanitizeFileName = (s) =>
  String(s || "qr").replace(/[^a-z0-9\-_.]+/gi, "_").slice(0, 120) || "qr";

const QRCodeGenerator = ({ product, open, onClose }) => {
  const [format, setFormat] = useState("sku"); // 'sku' | 'serial'
  const [size, setSize] = useState(200);       // preview QR size in px (UI only)
  const [includeText, setIncludeText] = useState(true);
  const [customText, setCustomText] = useState("");
  const [mode, setMode] = useState("product"); // 'product' | 'items'
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);

  const qrWrapperRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  /** product.available_qty may be missing; we don't block Items mode if absent */
  const rawMaxQty = Number(product?.available_qty);
  const hasMax = Number.isFinite(rawMaxQty) && rawMaxQty > 0;
  const maxQty = hasMax ? rawMaxQty : null;

  useEffect(() => {
    if (product) {
      setCustomText("");
      setFormat("sku");
      setMode("product");
      setRangeFrom(1);
      setRangeTo(hasMax ? rawMaxQty : 1);
      setSize(200);
    }
 
  }, [product]);

  /** Single preview payload */
  const previewData = useMemo(() => {
    if (!product) return "";
    if (format === "sku") return product.sku;
    // 'serial' (unique-ish for preview)
    return `${product.sku}-${Date.now()}`;
  }, [product, format]);

  /** Programmatic QR -> base64 PNG */
  const generateQrDataUrl = useCallback(async (value, qrSize) => {
    try {
      return await QRCode.toDataURL(String(value), { width: qrSize, margin: 2 });
    } catch (err) {
      console.error("QR generation failed:", err);
      toast.error("QR generation failed.");
      return "";
    }
  }, []);

  /** Refresh preview image */
  const refreshPreview = useCallback(async () => {
    if (!previewData) {
      setPreviewUrl("");
      return;
    }
    const url = await generateQrDataUrl(previewData, size);
    setPreviewUrl(url);
  }, [previewData, size, generateQrDataUrl]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  /** Build list for printing/exporting */
  const buildItemsList = useCallback(() => {
    if (!product) return [];

    if (mode !== "items") {
      return [{ sku: product.sku, name: product.name, data: product.sku, customText }];
    }

    // Use user's range regardless of available_qty; enforce >=1 and From<=To.
    const from = clampMin(rangeFrom, 1);
    const to = Math.max(from, clampMin(rangeTo, 1));

    // Encode per unit as `${sku}-${num}`
    const list = Array.from({ length: to - from + 1 }, (_, idx) => {
      const num = from + idx;
      return {
        sku: `${product.sku}-${num}`,
        name: product.name,
        data: `${product.sku}-${num}`,
        customText,
      };
    });

    return list;
  }, [product, mode, rangeFrom, rangeTo, customText]);

  /** Download current preview as PNG (simple preview tile) */
  const handleDownload = async () => {
    if (!qrWrapperRef.current) return;
    const canvas = await html2canvas(qrWrapperRef.current, { scale: 2, backgroundColor: "#fff" });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFileName(product?.sku)}-preview.png`;
    link.click();
  };

  /** ---------------- PRINT: 50mm x 30mm label (landscape), one label per page ---------------- */
  const handlePrint = async () => {
    const list = buildItemsList();
    if (!list.length) {
      toast.warning("Nothing to print.");
      return;
    }

    // High-DPI QR first
    const pages = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const qrUrl = await generateQrDataUrl(item.data, PRINT_QR_PX);
      pages.push({ item, qrUrl });
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Labels</title>
          <style>
            @page { size: ${LABEL_W_MM}mm ${LABEL_H_MM}mm; margin: 0; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            html, body { width: ${LABEL_W_MM}mm; height: ${LABEL_H_MM}mm; margin: 0; padding: 0; }
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }


              .label {
                width: ${LABEL_W_MM}mm;
                height: ${LABEL_H_MM}mm;
                padding: ${INNER_PAD_MM}mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                page-break-after: always;
              }
              .label:last-child { page-break-after: auto; }

              .spacer-top {
                width: 100%;
                height: ${SPACER_TOP_MM}mm;   /* smaller fixed top spacer */
              }
              .spacer-bottom {
                width: 100%;
                height: ${SPACER_BOTTOM_MM}mm; /* smaller fixed bottom spacer */
              }

              .qr {
                width: ${QR_BOX_MM}mm;
                height: ${QR_BOX_MM}mm;
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 ${QR_BOX_MM}mm;
              }            


            .qr img { width: ${QR_BOX_MM}mm; height: ${QR_BOX_MM}mm; display: block; }

            .txt {
              width: 100%;
              text-align: center;
              flex: 0 0 auto;
              overflow: hidden;
            }
            .sku {
              font-weight: 400;
              font-size: 4.0mm;
              line-height: 1.05;
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            }
            .name, .custom {
              font-size: 2.4mm;
              line-height: 1.05;
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .name { color: #333; }
            .custom { color: #17803d; }
          </style>
        </head>
        <body>
          ${pages.map(({ item, qrUrl }) => `
            <div class="label">
              <div class="spacer-top"></div>
              <div class="qr"><img src="${qrUrl}" alt="QR" /></div>
              <div class="spacer-bottom"></div>
              ${includeText ? `
                <div class="txt">
                  <div class="sku" style="font-weight:400">${item.sku}</div>
                  <div class="name">${item.name || ""}</div>
                  ${item.customText ? `<div class="custom">${item.customText}</div>` : ""}
                </div>` : ""}
            </div>

          `).join("")}
          <script>
            (function () {
              function waitAllImages() {
                var imgs = Array.prototype.slice.call(document.images);
                if (imgs.length === 0) return Promise.resolve();
                return Promise.all(imgs.map(function (img) {
                  if (img.decode) { return img.decode().catch(function(){}) }
                  if (img.complete) { return Promise.resolve(); }
                  return new Promise(function (res) { img.onload = res; img.onerror = res; });
                }));
              }
              function doPrint(){ try{window.focus()}catch(e){} setTimeout(function(){ window.print() }, 0); }
              if (document.readyState === "complete") { waitAllImages().then(doPrint); }
              else { window.addEventListener("load", function(){ waitAllImages().then(doPrint); }); }
            })();
          <\/script>
        </body>
      </html>
    `;

    // Hidden iframe printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0"; iframe.style.bottom = "0";
    iframe.style.width = "0"; iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();

    const cleanup = () => setTimeout(() => {
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
    if (iframe.contentWindow) {
      iframe.contentWindow.onafterprint = cleanup;
      iframe.contentWindow.addEventListener("visibilitychange", () => {
        if (iframe.contentDocument.visibilityState !== "visible") cleanup();
      });
    } else {
      setTimeout(cleanup, 5000);
    }
  };


  /** ---------------- ZIP export: per-item label PNG (50mm x 30mm layout) ---------------- */
  const handleDownloadAll = async () => {


    const list = buildItemsList();
    if (!list.length) {
      toast.warning("Nothing to export.");
      return;
    }

    const zip = new JSZip();

    // Hidden host for accurate html2canvas layout
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-99999px";
    host.style.top = "0";
    host.style.width = "0";
    host.style.height = "0";
    host.style.overflow = "hidden";
    document.body.appendChild(host);

    try {
      const labelW = mm2px(LABEL_W_MM);
      const labelH = mm2px(LABEL_H_MM);
      const padPx  = mm2px(INNER_PAD_MM);
      const qrPx   = mm2px(QR_BOX_MM);
      const topH = mm2px(SPACER_TOP_MM);
      const botH = mm2px(SPACER_BOTTOM_MM);
      for (const item of list) {
        const qrUrl = await generateQrDataUrl(item.data, PRINT_QR_PX);

        const wrapper = document.createElement("div");
        wrapper.style.width = `${labelW}px`;
        wrapper.style.height = `${labelH}px`;
        wrapper.style.padding = `${padPx}px`;
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.background = "#fff";
        wrapper.style.boxSizing = "border-box";
        host.appendChild(wrapper);

        // Top spacer (was flex:1)
        const spacerTop = document.createElement("div");
        spacerTop.style.width = "100%";
        spacerTop.style.height = `${topH}px`;   // fixed smaller height
        wrapper.appendChild(spacerTop);

        const qr = document.createElement("div");
        qr.style.width = `${qrPx}px`;
        qr.style.height = `${qrPx}px`;
        qr.style.display = "flex";
        qr.style.alignItems = "center";
        qr.style.justifyContent = "center";
        qr.style.flex = `0 0 ${qrPx}px`;
        wrapper.appendChild(qr);

        const img = document.createElement("img");
        img.src = qrUrl;
        img.width = qrPx;
        img.height = qrPx;
        img.style.display = "block";
        qr.appendChild(img);

        // Bottom spacer (was flex:1)
        const spacerBottom = document.createElement("div");
        spacerBottom.style.width = "100%";
        spacerBottom.style.height = `${botH}px`; // fixed smaller height
        wrapper.appendChild(spacerBottom);

        if (includeText) {
          const txt = document.createElement("div");
          txt.style.width = "100%";
          txt.style.textAlign = "center";
          txt.style.flex = "0 0 auto";
          txt.style.overflow = "hidden";
          wrapper.appendChild(txt);

          const toPxFont = (mm) => `${(mm2px(mm) / (96/25.4))}px`; // mm → px (font-size context)

          const sku = document.createElement("div");
          sku.textContent = item.sku;
          sku.style.fontWeight = "400";
          sku.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
          sku.style.fontSize = toPxFont(3.0);
          sku.style.lineHeight = "1.05";
          sku.style.whiteSpace = "nowrap";
          sku.style.overflow = "hidden";
          sku.style.textOverflow = "ellipsis";
          txt.appendChild(sku);

          const name = document.createElement("div");
          name.textContent = item.name || "";
          name.style.color = "#333";
          name.style.fontSize = toPxFont(2.4);
          name.style.lineHeight = "1.05";
          name.style.whiteSpace = "nowrap";
          name.style.overflow = "hidden";
          name.style.textOverflow = "ellipsis";
          txt.appendChild(name);

          if (item.customText) {
            const custom = document.createElement("div");
            custom.textContent = item.customText;
            custom.style.color = "#17803d";
            custom.style.fontSize = toPxFont(2.4);
            custom.style.lineHeight = "1.05";
            custom.style.whiteSpace = "nowrap";
            custom.style.overflow = "hidden";
            custom.style.textOverflow = "ellipsis";
            txt.appendChild(custom);
          }
        }

        // Wait for QR to decode before rasterizing
        if (img.decode) { try { await img.decode(); } catch (_) {} }
        else if (!img.complete) { await new Promise((res) => { img.onload = res; img.onerror = res; }); }

        const canvas = await html2canvas(wrapper, { backgroundColor: "#fff", scale: EXPORT_SCALE });
        const url = canvas.toDataURL("image/png");
        const fname = sanitizeFileName(item.sku || "qr") + ".png";
        zip.file(fname, url.split(",")[1], { base64: true });

        host.removeChild(wrapper); // free memory
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "labels-50x30mm.zip");
    } catch (err) {
      console.error(err);
      toast.error("Failed to build ZIP.");
    } finally {
      if (host && host.parentNode) host.parentNode.removeChild(host);
    }
  };


  if (!product) return null;

  /** ---------------- UI handlers ---------------- */
  const onModeChange = (e) => {
    const v = e.target.value;
    setMode(v);
    if (v === "items") {
      setRangeFrom((prev) => clampMin(prev, 1));
      setRangeTo((prev) => clampMin(hasMax ? rawMaxQty : prev, 1));
    }
  };
  const onRangeFromChange = (e) => {
    const v = clampMin(e.target.value, 1);
    setRangeFrom(v);
    if (v > rangeTo) setRangeTo(v);
  };
  const onRangeToChange = (e) => {
    const v = clampMin(e.target.value, 1);
    setRangeTo(Math.max(v, rangeFrom));
  };

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
                  <Input type="select" value={mode} onChange={onModeChange}>
                    <option value="product">Product (1 QR)</option>
                    <option value="items">Items (each unit)</option>
                  </Input>
                </FormGroup>

                {mode === "items" && (
                  <FormGroup>
                    <Label>Quantity Range</Label>
                    <div className="d-flex gap-2 align-items-center">
                      <Input
                        type="number"
                        min="1"
                        {...(hasMax ? { max: maxQty } : {})}
                        value={rangeFrom}
                        onChange={onRangeFromChange}
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        min="1"
                        {...(hasMax ? { max: maxQty } : {})}
                        value={rangeTo}
                        onChange={onRangeToChange}
                      />
                    </div>
                    <small className="text-muted">
                      Available: {hasMax ? maxQty : "n/a"}
                    </small>
                  </FormGroup>
                )}

                <FormGroup>
                  <Label>Format</Label>
                  <Input type="select" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="sku">Standard (SKU)</option>
                    <option value="serial">Serial (unique)</option>
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label>Preview Size</Label>
                  <Input type="select" value={size} onChange={(e) => setSize(Number(e.target.value))}>
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
                  Include text on label
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
                  <Input type="textarea" value={previewData} readOnly />
                  <div className="d-flex gap-2 mt-2">
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(previewData)}
                    >
                      Copy Data
                    </Button>
                    <Button color="warning" size="sm" onClick={refreshPreview}>
                      <i className="ri-refresh-line me-1" />
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <small className="text-muted">
                    Print layout: <strong>50mm × 30mm</strong> (landscape).
                  </small>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Right: Preview */}
          <Col md={8}>
            <Card className="h-100">
              <CardBody className="text-center">
                <h5 className="mb-3">Preview</h5>

                <div
                  ref={qrWrapperRef}
                  className="p-3 d-inline-block bg-white"
                  style={{ border: "1px solid #eee", borderRadius: 8 }}
                >
                  {previewUrl ? (
                    <img src={previewUrl} width={size} height={size} alt="QR Preview" />
                  ) : (
                    <div
                      style={{
                        width: size,
                        height: size,
                        display: "grid",
                        placeItems: "center",
                        border: "1px dashed #ccc",
                      }}
                    >
                      generating…
                    </div>
                  )}

                  {/* Preview text block (just for UI) */}
                  <>
                    {includeText && (
                      <>
                        <div className="mt-2">{product.sku}</div> {/* no fw-bold */}
                        <div className="text-muted">{product.name}</div>
                        {customText && <div className="text-success">{customText}</div>}
                      </>
                    )}
                  </>
                </div>

                <div className="mt-3 d-flex justify-content-center gap-2 flex-wrap">
                  <Button color="light" onClick={handleDownload}>
                    <i className="ri-download-2-line me-1" /> Download
                  </Button>
                  <Button color="light" onClick={handlePrint}>
                    <i className="ri-printer-line me-1" /> Print (50×30 mm)
                  </Button>
                  {mode === "items" && (
                    <Button color="dark" onClick={handleDownloadAll}>
                      <i className="ri-download-cloud-2-line me-1" /> Download All (labels)
                    </Button>
                  )}
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
