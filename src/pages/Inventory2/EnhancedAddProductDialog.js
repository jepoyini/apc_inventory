import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X, Tag'lucide-react';
import { EnhancedProduct, ProductImage, QuantityItem, TrackingEvent } from '@/types/inventory';
import { inventoryCategories, inventoryTags } from '@/lib/enhancedInventoryData';
import { mockWarehouses } from '@/lib/mockData';
import ImageGallery from './ImageGallery';
const EnhancedAddProductDialog: () => = ({ onAddProduct }) => {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [newProduct, setNewProduct] = useState<Partial<EnhancedProduct>>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    sku: '',
    barcode: '',
    price: 0,
    cost: 0,
    currency: 'USD',
    images: [],
    totalQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    items: [],
    warehouse: '',
    locations: [],
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      unit: 'inches'
    },
    specifications: {},
    trackingHistory: [],
    status: 'active',
    lowStockThreshold: 10,
    reorderPoint: 20,
    maxStockLevel: 100,
    tags: [],
    supplier: '',
    manufacturerDate: '',
    warranty: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newLocation, setNewLocation] = useState('');

  const handleSubmit = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.category || !newProduct.warehouse) {
      alert('Please fill in all required fields (Name, SKU, Category, Warehouse)');
      return;
    }

    // Create initial tracking event
    const initialTrackingEvent= {
      id: '1',
      type: 'created',
      timestamp: new Date().toISOString(),
      user: 'current_user',
      notes: 'Product created in system'
    };

    const productToAdd, 'id' | 'createdAt' | 'updatedAt'> = {
      ...newProduct'current_user',
      updatedBy: 'current_user'
    };

    onAddProduct(productToAdd);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      brand: '',
      model: '',
      sku: '',
      barcode: '',
      price: 0,
      cost: 0,
      currency: 'USD',
      images: [],
      totalQuantity: 0,
      availableQuantity: 0,
      reservedQuantity: 0,
      items: [],
      warehouse: '',
      locations: [],
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        unit: 'inches'
      },
      specifications: {},
      trackingHistory: [],
      status: 'active',
      lowStockThreshold: 10,
      reorderPoint: 20,
      maxStockLevel: 100,
      tags: [],
      supplier: '',
      manufacturerDate: '',
      warranty: ''
    });
    setCurrentTab('basic');
  };

  const addTag = () => {
    if (newTag && !newProduct.tags?.includes(newTag)) {
      setNewProduct(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewProduct(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setNewProduct(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpec.key]));
      setNewSpec({ key: '', value: '' });
    }
  };

  const removeSpecification = (keyToRemove) => {
    setNewProduct(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[keyToRemove];
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };

  const addLocation = () => {
    if (newLocation && !newProduct.locations?.includes(newLocation)) {
      setNewProduct(prev => ({
        ...prev,
        locations: [...(prev.locations || []), newLocation]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (locationToRemove) => {
    setNewProduct(prev => ({
      ...prev,
      locations: prev.locations?.filter(loc => loc !== locationToRemove) || []
    }));
  };

  const generateSKU = () => {
    const category = newProduct.category?.substring(0, 3).toUpperCase() || 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const sku = `${category}-${timestamp}`;
    setNewProduct(prev => ({ ...prev, sku }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={newProduct.name || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name))}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={newProduct.category || ''} 
                  onValueChange={(value) => setNewProduct(prev => ({ ...prev, category))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Input
                  value={newProduct.subcategory || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, subcategory))}
                  placeholder="Enter subcategory"
                />
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Input
                  value={newProduct.brand || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, brand))}
                  placeholder="Enter brand name"
                />
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={newProduct.model || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, model))}
                  placeholder="Enter model number"
                />
              </div>

              <div className="space-y-2">
                <Label>SKU *</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newProduct.sku || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sku))}
                    placeholder="Enter SKU"
                  />
                  <Button variant="outline" onClick={generateSKU}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input
                  value={newProduct.barcode || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, barcode))}
                  placeholder="Enter barcode"
                />
              </div>

              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newProduct.price || 0}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newProduct.cost || 0}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={newProduct.status || 'active'} 
                  onValueChange={(value: 'active' | 'inactive' | 'discontinued') => 
                    setNewProduct(prev => ({ ...prev, status))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newProduct.description || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description))}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newProduct.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <TagIcon className="h-3 w-3" />
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {inventoryTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (!newProduct.tags?.includes(tag)) {
                        setNewProduct(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), tag]
                        }));
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <ImageGallery
              images={newProduct.images || []}
              onImagesChange={(images) => setNewProduct(prev => ({ ...prev, images }))}
            />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Warehouse & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Warehouse *</Label>
                    <Select 
                      value={newProduct.warehouse || ''} 
                      onValueChange={(value) => setNewProduct(prev => ({ ...prev, warehouse))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockWarehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.name}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Storage Locations</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newProduct.locations?.map((location) => (
                        <Badge key={location} variant="secondary" className="flex items-center space-x-1">
                          <span>{location}</span>
                          <button
                            onClick={() => removeLocation(location)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g., A1-1, Shelf 5"
                        onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                      />
                      <Button variant="outline" onClick={addLocation}>
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Levels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Low Stock Threshold</Label>
                    <Input
                      type="number"
                      value={newProduct.lowStockThreshold || 10}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 10 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reorder Point</Label>
                    <Input
                      type="number"
                      value={newProduct.reorderPoint || 20}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 20 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Stock Level</Label>
                    <Input
                      type="number"
                      value={newProduct.maxStockLevel || 100}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, maxStockLevel: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Length</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newProduct.dimensions?.length || 0}
                        onChange={(e) => setNewProduct(prev => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            length: parseFloat(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newProduct.dimensions?.width || 0}
                        onChange={(e) => setNewProduct(prev => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            width: parseFloat(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newProduct.dimensions?.height || 0}
                        onChange={(e) => setNewProduct(prev => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            height: parseFloat(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newProduct.dimensions?.weight || 0}
                        onChange={(e) => setNewProduct(prev => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            weight: parseFloat(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select 
                      value={newProduct.dimensions?.unit || 'inches'} 
                      onValueChange={(value) => setNewProduct(prev => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          unit))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inches">Inches</SelectItem>
                        <SelectItem value="cm">Centimeters</SelectItem>
                        <SelectItem value="mm">Millimeters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Object.entries(newProduct.specifications || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={newSpec.key}
                        onChange={(e) => setNewSpec(prev => ({ ...prev, key))}
                        placeholder="Specification name"
                      />
                      <Input
                        value={newSpec.value}
                        onChange={(e) => setNewSpec(prev => ({ ...prev, value))}
                        placeholder="Specification value"
                      />
                    </div>
                    <Button variant="outline" onClick={addSpecification} className="w-full">
                      Add Specification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Additional Information Tab */}
          <TabsContent value="additional" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input
                  value={newProduct.supplier || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, supplier))}
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label>Manufacturer Date</Label>
                <Input
                  type="date"
                  value={newProduct.manufacturerDate || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, manufacturerDate))}
                />
              </div>

              <div className="space-y-2">
                <Label>Warranty</Label>
                <Input
                  value={newProduct.warranty || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, warranty))}
                  placeholder="e.g., 1 year, 6 months"
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={newProduct.currency || 'USD'} 
                  onValueChange={(value) => setNewProduct(prev => ({ ...prev, currency))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <div className="flex space-x-2">
            {currentTab !== 'basic' && (
              <Button variant="outline" onClick={() => {
                const tabs = ['basic', 'images', 'inventory', 'specifications', 'additional'];
                const currentIndex = tabs.indexOf(currentTab);
                if (currentIndex > 0) {
                  setCurrentTab(tabs[currentIndex - 1]);
                }
              }}>
                Previous
              </Button>
            )}
            {currentTab !== 'additional' ? (
              <Button onClick={() => {
                const tabs = ['basic', 'images', 'inventory', 'specifications', 'additional'];
                const currentIndex = tabs.indexOf(currentTab);
                if (currentIndex < tabs.length - 1) {
                  setCurrentTab(tabs[currentIndex + 1]);
                }
              }}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Add Product
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAddProductDialog;