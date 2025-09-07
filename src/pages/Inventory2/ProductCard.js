import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Edit, Trash2 } from 'lucide-react';
import { Product } from '@/types';
const ProductCard: () => = ({ 
  product, 
  onEdit, 
  onDelete, 
  onShowQR 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'Disposed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuantityColor = (quantity) => {
    if (quantity === 0) return 'text-red-600';
    if (quantity < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </CardTitle>
          <Badge className={getStatusColor(product.status)} variant="secondary">
            {product.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">SKU:</span>
              <span className="ml-1 font-medium">{product.sku}</span>
            </div>
            <div>
              <span className="text-gray-500">QR:</span>
              <span className="ml-1 font-mono text-xs">{product.qrCode}</span>
            </div>
            <div>
              <span className="text-gray-500">Category:</span>
              <span className="ml-1">{product.category}</span>
            </div>
            <div>
              <span className="text-gray-500">Quantity:</span>
              <span className={`ml-1 font-medium ${getQuantityColor(product.quantity)}`}>
                {product.quantity}
              </span>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-500">Warehouse:</span>
            <span className="ml-1">{product.warehouse}</span>
          </div>
          
          <div className="text-xs text-gray-400">
            Created by {product.createdBy} on {new Date(product.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowQR?.(product)}
              className="flex items-center"
            >
              <QrCode className="mr-1 h-3 w-3" />
              QR Code
            </Button>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(product)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(product.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;