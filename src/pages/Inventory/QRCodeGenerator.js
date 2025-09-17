// ================================================================
// FILE: src/pages/Inventory/QRCodeGenerator.js
// ================================================================
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Modal, ModalHeader, ModalBody, Row, Col, Card, CardBody,
  Input, Label, Button, FormGroup
} from "reactstrap";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

/** ---------------- Label constants (50mm x 30mm landscape) ---------------- */
const LABEL_W_MM = 50;
const LABEL_H_MM = 30;
const INNER_PAD_MM = 0;
const QR_BOX_MM = 18;
const PRINT_QR_PX = 600;

/** Font sizes (in mm) */
const FONT_SKU_MM = 3.0;      // SKU text
const FONT_NAME_MM = 3.0;     // Product name
const FONT_CUSTOM_MM = 2.0;   // Custom text

/** For ZIP export (PNG) */
const EXPORT_SCALE = 4;
const CSS_PX_PER_MM = 96 / 25.4;
const mm2px = (mm) => Math.round(mm * CSS_PX_PER_MM);

const SPACER_TOP_MM = 1.5;
const SPACER_BOTTOM_MM = 1.0;

/** ---------------- Helpers ---------------- */
const clampMin = (val, min) => Math.max(Number(val) || min, min);
const sanitizeFileName = (s) =>
  String(s || "qr").replace(/[^a-z0-9\-_.]+/gi, "_").slice(0, 120) || "qr";

const QRCodeGenerator = ({ products = [], open, onClose }) => {
  const [format, setFormat] = useState("sku"); // 'sku' | 'serial'
  const [size, setSize] = useState(200);
  const [includeText, setIncludeText] = useState(true);
  const [customText, setCustomText] = useState("");
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);

  const qrWrapperRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  /** Total qty across all products */
  const rawMaxQty = products.reduce((sum, p) => sum + (Number(p.available_qty) || 0), 0);
  const hasMax = rawMaxQty > 0;

  const scaleFactor = 2;
  const topSpacerPx = mm2px(SPACER_TOP_MM) * scaleFactor;
  const bottomSpacerPx = mm2px(SPACER_BOTTOM_MM) * scaleFactor;

  useEffect(() => {
    if (products.length > 0) {
      setCustomText("");
      setFormat("serial");
      setRangeFrom(1);
      setRangeTo(hasMax ? rawMaxQty : 1);
      setSize(200);
    }
  }, [products, hasMax, rawMaxQty]);

  /** Preview payload (use first product as example) */
  const previewData = useMemo(() => {
    if (!products.length) return "";
    const p = products[0];
    if (format === "sku") return p.sku;
    return `${p.sku}-${Date.now()}`;
  }, [products, format]);

  /** Generate QR */
  const generateQrDataUrl = useCallback(async (value, qrSize) => {
    try {
      return await QRCode.toDataURL(String(value), { width: qrSize, margin: 2 });
    } catch (err) {
      console.error("QR generation failed:", err);
      toast.error("QR generation failed.");
      return "";
    }
  }, []);

  /** Refresh preview */
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

  /** Build list of labels */
  const buildItemsList = useCallback(() => {
    if (!products.length) return [];

    const list = [];
    products.forEach((p) => {
      const qty = Number(p.available_qty) || 1;
      for (let i = 1; i <= qty; i++) {
        list.push({
          sku: p.sku,      // ✅ just the base SKU, no counter
          name: p.name,
          data: p.sku,     // QR encodes only the SKU
          customText,
        });
      }
    });
    return list;
  }, [products, customText]);

  /** Download preview */
  const handleDownload = async () => {
    if (!qrWrapperRef.current) return;
    const canvas = await html2canvas(qrWrapperRef.current, { scale: 2, backgroundColor: "#fff" });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    const fname = sanitizeFileName(products[0]?.sku || "qr") + "-preview.png";
    link.download = fname;
    link.click();
  };

  /** Print labels */
  const handlePrint = async () => {
    const list = buildItemsList();
    if (!list.length) {
      toast.warning("Nothing to print.");
      return;
    }

    const pages = [];
    for (const item of list) {
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
            .label { width: ${LABEL_W_MM}mm; height: ${LABEL_H_MM}mm; padding: ${INNER_PAD_MM}mm;
                     display: flex; flex-direction: column; align-items: center; page-break-after: always; }
            .label:last-child { page-break-after: auto; }
            .spacer-top { width: 100%; height: ${SPACER_TOP_MM}mm; }
            .spacer-bottom { width: 100%; height: ${SPACER_BOTTOM_MM}mm; }
            .qr { width: ${QR_BOX_MM}mm; height: ${QR_BOX_MM}mm; display: flex; align-items: center; justify-content: center; }
            .qr img { width: ${QR_BOX_MM}mm; height: ${QR_BOX_MM}mm; display: block; }
            .txt { width: 100%; text-align: center; flex: 0 0 auto; overflow: hidden; }
            .sku { font-weight: 400; font-size: ${FONT_SKU_MM}mm; line-height: 1.05;
                   white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                   font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
            .name { color: #333; font-size: ${FONT_NAME_MM}mm; line-height: 1.05;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .custom { color: #17803d; font-size: ${FONT_CUSTOM_MM}mm; line-height: 1.05;
                      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
                  <div class="sku">${item.sku}</div>
                  <div class="name">${item.name || ""}</div>
                  ${item.customText ? `<div class="custom">${item.customText}</div>` : ""}
                </div>` : ""}
            </div>`).join("")}
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

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0"; iframe.style.height = "0"; iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
  };

  /** ZIP export */
  const handleDownloadAll = async () => {
    const list = buildItemsList();
    if (!list.length) {
      toast.warning("Nothing to export.");
      return;
    }

    const zip = new JSZip();
    const host = document.createElement("div");
    host.style.position = "fixed"; host.style.left = "-99999px"; host.style.top = "0";
    document.body.appendChild(host);

    try {
      const labelW = mm2px(LABEL_W_MM);
      const labelH = mm2px(LABEL_H_MM);
      const padPx  = mm2px(INNER_PAD_MM);
      const qrPx   = mm2px(QR_BOX_MM);

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
        host.appendChild(wrapper);

// Top spacer
const topSpacer = document.createElement("div");
topSpacer.style.height = `${mm2px(SPACER_TOP_MM)}px`;
wrapper.appendChild(topSpacer);

// QR code
const qr = document.createElement("img");
qr.src = qrUrl;
qr.width = qrPx; qr.height = qrPx;
wrapper.appendChild(qr);

// Bottom spacer
const bottomSpacer = document.createElement("div");
bottomSpacer.style.height = `${mm2px(SPACER_BOTTOM_MM)}px`;
wrapper.appendChild(bottomSpacer);

// Text block
if (includeText) {
  const txt = document.createElement("div");
  txt.style.width = "100%";
  txt.style.textAlign = "center";

  const sku = document.createElement("div");
  sku.style.fontSize = `${mm2px(FONT_SKU_MM)}px`;
  sku.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  sku.textContent = item.sku;
  txt.appendChild(sku);

  if (item.name) {
    const name = document.createElement("div");
    name.style.fontSize = `${mm2px(FONT_NAME_MM)}px`;
    name.style.color = "#333";
    name.textContent = item.name;
    name.style.marginTop = "-5px"; 
    txt.appendChild(name);
  }

  if (item.customText) {
    const custom = document.createElement("div");
    custom.style.fontSize = `${mm2px(FONT_CUSTOM_MM)}px`;
    custom.style.color = "#17803d";
    custom.textContent = item.customText;
    txt.appendChild(custom);
  }

  wrapper.appendChild(txt);
}


        const canvas = await html2canvas(wrapper, { backgroundColor: "#fff", scale: EXPORT_SCALE });
        const url = canvas.toDataURL("image/png");
        const fname = sanitizeFileName(item.sku || "qr") + ".png";
        zip.file(fname, url.split(",")[1], { base64: true });

        host.removeChild(wrapper);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const baseName = sanitizeFileName(products[0]?.name || "labels");
      const productId = products[0]?.id || "item";
      saveAs(blob, `${productId}_${baseName}_50x30.zip`);

    } finally {
      if (host && host.parentNode) host.parentNode.removeChild(host);
    }
  };

  if (!products.length) return null;

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>
        QR Code Generator
      </ModalHeader>
      <ModalBody>
        <Row>
          {/* Right: Preview only */}
          <Col md={12}>
            <Card className="h-100">
              <CardBody className="text-center">
                <h5 className="mb-3">Preview</h5>
                <p className="text-muted mb-3">
                  Generating QR codes for <strong>{products.length}</strong> item{products.length > 1 ? "s" : ""}.
                </p>

                <div
                  ref={qrWrapperRef}
                  className="bg-white d-inline-flex flex-column align-items-center"
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 8,
                    width: `${mm2px(LABEL_W_MM) * scaleFactor}px`,
                    height: `${mm2px(LABEL_H_MM) * scaleFactor}px`,
                    padding: `${mm2px(INNER_PAD_MM) * scaleFactor}px`,
                  }}
                >
                  {/* Top spacer */}
                  <div style={{ height: `${topSpacerPx}px` }} />

                  {/* Content area */}
                  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        style={{
                          width: `${mm2px(QR_BOX_MM) * scaleFactor}px`,
                          height: `${mm2px(QR_BOX_MM) * scaleFactor}px`,
                          marginBottom: "4px",
                        }}
                        alt="QR Preview"
                      />
                    ) : (
                      <div
                        style={{
                          width: `${mm2px(QR_BOX_MM) * scaleFactor}px`,
                          height: `${mm2px(QR_BOX_MM) * scaleFactor}px`,
                          display: "grid",
                          placeItems: "center",
                          border: "1px dashed #ccc",
                          marginBottom: "4px",
                        }}
                      >
                        generating…
                      </div>
                    )}

                    {includeText && products[0] && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: `${mm2px(FONT_SKU_MM) * scaleFactor}px` }}>
                          {products[0].sku}
                        </div>
                        <div
                          className=""
                          style={{
                            marginTop: "2px",
                            fontSize: `${mm2px(FONT_NAME_MM) * scaleFactor}px`,
                          }}
                        >
                          {products[0].name}
                        </div>
                        {customText && (
                          <div
                            className="text-success"
                            style={{ fontSize: `${mm2px(FONT_CUSTOM_MM) * scaleFactor}px` }}
                          >
                            {customText}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom spacer */}
                  <div style={{ height: `${bottomSpacerPx}px` }} />
                </div>

                <div className="mt-3 d-flex justify-content-center gap-2 flex-wrap">
                  <Button color="light" onClick={handlePrint}>
                    <i className="ri-printer-line me-1" /> Print (50×30 mm)
                  </Button>
                  <Button color="dark" onClick={handleDownloadAll}>
                    <i className="ri-download-cloud-2-line me-1" /> Download
                  </Button>
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
