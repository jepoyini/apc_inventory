import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  QrCode, 
  MapPin, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Tag
} from 'lucide-react';
import { EnhancedProduct } from '@/types/inventory';
import ImageGallery from './ImageGallery';
import TrackingHistory from './TrackingHistory';
import QuantityManager from './QuantityManager';
import QRCodeGenerator from './QRCodeGenerator';
const EnhancedProductCard: () => = ({ 
  product, 
  onEdit, 
  onDelete, 
  onUpdate 
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStockLevelColor = () => {
    if (product.availableQuantity === 0) return 'text-red-600';
    if (product.availableQuantity <= product.lowStockThreshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockLevelIcon = () => {
    if (product.availableQuantity === 0) return <AlertTriangle className="h-4 w-4" />;
    if (product.availableQuantity <= product.lowStockThreshold) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  const handleProductUpdate = (updatedProduct) => {
    if (onUpdate) {
      onUpdate(updatedProduct);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
                <Badge variant="outline" className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailsOpen(true)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Product Image */}
          {primaryImage && (
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setDetailsOpen(true)}
              />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SKU:</span>
              <span className="font-mono text-sm">{product.sku}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="font-semibold text-green-600">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock:</span>
              <div className={`flex items-center space-x-1 ${getStockLevelColor()}`}>
                {getStockLevelIcon()}
                <span className="font-medium">
                  {product.availableQuantity}/{product.totalQuantity}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Location:</span>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{product.warehouse}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <QRCodeGenerator product={product} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsOpen(true)}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{product.name}</span>
              <Badge variant="outline" className={getStatusColor(product.status)}>
                {product.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="quantity">Quantity</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="specifications">Specs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">SKU:</span>
                        <div className="font-mono">{product.sku}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Category:</span>
                        <div>{product.category}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Brand:</span>
                        <div>{product.brand || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Model:</span>
                        <div>{product.model || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Price:</span>
                        <div className="text-green-600 font-semibold">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Cost:</span>
                        <div>${product.cost?.toFixed(2) || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="text-sm mt-1">{product.description}</p>
                    </div>

                    {product.tags.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stock Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stock Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{product.totalQuantity}</div>
                        <div className="text-sm text-blue-700">Total</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{product.availableQuantity}</div>
                        <div className="text-sm text-green-700">Available</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{product.reservedQuantity}</div>
                        <div className="text-sm text-yellow-700">Reserved</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{product.lowStockThreshold}</div>
                        <div className="text-sm text-red-700">Low Stock Alert</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warehouse:</span>
                        <span>{product.warehouse}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locations:</span>
                        <span>{product.locations.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reorder Point:</span>
                        <span>{product.reorderPoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Stock:</span>
                        <span>{product.maxStockLevel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* QR Code Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">QR Code Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Generate and manage QR codes for this product
                      </p>
                      {product.qrCode && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last generated: {new Date(product.qrCode.lastGenerated).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <QRCodeGenerator product={product} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <ImageGallery
                images={product.images}
                onImagesChange={(images) => {
                  const updatedProduct = { ...product, images };
                  handleProductUpdate(updatedProduct);
                }}
                readonly={!onUpdate}
              />
            </TabsContent>

            {/* Quantity Tab */}
            <TabsContent value="quantity">
              <QuantityManager
                items={product.items}
                onItemsChange={(items) => {
                  const totalQuantity = items.length;
                  const availableQuantity = items.filter(item => item.status === 'available').length;
                  const reservedQuantity = items.filter(item => item.status === 'reserved').length;
                  
                  const updatedProduct = { 
                    ...product, 
                    items, 
                    totalQuantity, 
                    availableQuantity, 
                    reservedQuantity 
                  };
                  handleProductUpdate(updatedProduct);
                }}
                readonly={!onUpdate}
              />
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking">
              <TrackingHistory events={product.trackingHistory} />
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dimensions */}
                {product.dimensions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Length:</span>
                        <span>{product.dimensions.length} {product.dimensions.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Width:</span>
                        <span>{product.dimensions.width} {product.dimensions.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span>{product.dimensions.height} {product.dimensions.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span>{product.dimensions.weight} lbs</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Specifications */}
                {product.specifications && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span>{product.supplier || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufactured:</span>
                      <span>{product.manufacturerDate ? new Date(product.manufacturerDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Warranty:</span>
                      <span>{product.warranty || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedProductCard;