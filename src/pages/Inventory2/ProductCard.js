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


    </Card>
  );
};

export default ProductCard;