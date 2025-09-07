import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QrCode, Download, Printer, Copy, RefreshCw } from 'lucide-react';
import { QRCodeData, EnhancedProduct } from '@/types/inventory';
const QRCodeGenerator: () => = ({ product, onQRGenerated }) => {
  const [open, setOpen] = useState(false);
  const [qrConfig, setQRConfig] = useState({
    format: 'standard' as 'standard' | 'detailed' | 'minimal',
    size: 'medium' as 'small' | 'medium' | 'large',
    includeText,
    customText: '',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000'
  });

  const qrRef = useRef(null);

  const generateQRData = () => {
    let qrData = product.sku;
    
    if (qrConfig.format === 'detailed') {
      const data = {
        id,
        ...(qrConfig.includeSerial && { serial: 'AUTO' }),
        ...(qrConfig.includeBatch && { batch: 'AUTO' })
      };
      qrData = JSON.stringify(data);
    } else if (qrConfig.format === 'minimal') {
      qrData = product.id;
    }

    return qrData;
  };

  const handleGenerate = () => {
    const qrData= {
      productId,
      generatedAt: new Date().toISOString(),
      format,
      includeText: qrConfig.includeText
    };

    if (onQRGenerated) {
      onQRGenerated(qrData);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrRef.current) {
      const qrContent = qrRef.current.innerHTML;
      const productName = product.name.replace(/['"]/g, '');
      const productSku = product.sku.replace(/['"]/g, '');
      
      printWindow.document.write(
        '<html>' +
        '<head>' +
        '<title>QR Code - ' + productName + '</title>' +
        '<style>' +
        'body { font-family, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: white; }' +
        '.qr-print { text-align: center; page-break-inside: avoid; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }' +
        '.qr-code { margin: 20px 0; }' +
        '.product-info { margin-top: 15px; font-size: 12px; color: #666; }' +
        '@media print { body { margin: 0; } .qr-print { border: none; } }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="qr-print">' +
        qrContent +
        '<div class="product-info">' +
        '<div><strong>' + productName + '</strong></div>' +
        '<div>SKU: ' + productSku + '</div>' +
        '<div>Generated: ' + new Date().toLocaleString() + '</div>' +
        '</div>' +
        '</div>' +
        '</body>' +
        '</html>'
      );
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = qrConfig.size === 'small' ? 200 === 'large' ? 400 : 300;
    canvas.width = size;
    canvas.height = size + (qrConfig.includeText ? 60 : 0);

    ctx.fillStyle = qrConfig.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = qrConfig.foregroundColor;
    const qrSize = size * 0.8;
    const qrX = (size - qrSize) / 2;
    const qrY = 10;

    const moduleSize = qrSize / 25;
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(qrX + i * moduleSize, qrY + j * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    if (qrConfig.includeText) {
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.sku, canvas.width / 2, canvas.height - 30);
      ctx.font = '12px Arial';
      ctx.fillText(product.name, canvas.width / 2, canvas.height - 10);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qr-' + product.sku + '.png';
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleCopyData = () => {
    navigator.clipboard.writeText(generateQRData());
  };

  const getSizePixels = () => {
    switch (qrConfig.size) {
      case 'small': return 150;
      case 'large': return 300;
      default: return 200;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          Generate QR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>QR Code Generator - {product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select 
                    value={qrConfig.format} 
                    onValueChange={(value: 'standard' | 'detailed' | 'minimal') => 
                      setQRConfig(prev => ({ ...prev, format))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal (ID only)</SelectItem>
                      <SelectItem value="standard">Standard (SKU)</SelectItem>
                      <SelectItem value="detailed">Detailed (JSON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select 
                    value={qrConfig.size} 
                    onValueChange={(value: 'small' | 'medium' | 'large') => 
                      setQRConfig(prev => ({ ...prev, size))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (150px)</SelectItem>
                      <SelectItem value="medium">Medium (200px)</SelectItem>
                      <SelectItem value="large">Large (300px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={qrConfig.includeText}
                    onCheckedChange={(checked) => 
                      setQRConfig(prev => ({ ...prev, includeText))
                    }
                  />
                  <Label>Include text below QR code</Label>
                </div>

                {qrConfig.format === 'detailed' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={qrConfig.includeSerial}
                        onCheckedChange={(checked) => 
                          setQRConfig(prev => ({ ...prev, includeSerial))
                        }
                      />
                      <Label>Include serial number</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={qrConfig.includeBatch}
                        onCheckedChange={(checked) => 
                          setQRConfig(prev => ({ ...prev, includeBatch))
                        }
                      />
                      <Label>Include batch number</Label>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Custom Text (optional)</Label>
                  <Input
                    value={qrConfig.customText}
                    onChange={(e) => setQRConfig(prev => ({ ...prev, customText))}
                    placeholder="Additional text to display"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generateQRData()}
                  readOnly
                  className="font-mono text-sm"
                  rows={4}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyData}
                  className="mt-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Data
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={qrRef} className="text-center space-y-4">
                  <div 
                    className="mx-auto border-2 border-dashed border-gray-300 flex items-center justify-center bg-white"
                    style={{ 
                      width: getSizePixels(), 
                      height: getSizePixels(),
                      backgroundColor="text-center">
                      <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">QR Code Preview</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {qrConfig.size} • {qrConfig.format}
                      </p>
                    </div>
                  </div>

                  {qrConfig.includeText && (
                    <div className="space-y-1">
                      <div className="font-mono font-bold">{product.sku}</div>
                      <div className="text-sm text-gray-600">{product.name}</div>
                      {qrConfig.customText && (
                        <div className="text-xs text-gray-500">{qrConfig.customText}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button onClick={handleGenerate} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>SKU:</strong> {product.sku}</div>
                <div><strong>Name:</strong> {product.name}</div>
                <div><strong>Category:</strong> {product.category}</div>
                <div><strong>Warehouse:</strong> {product.warehouse}</div>
                <div><strong>Total Quantity:</strong> {product.totalQuantity}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;