import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react';
import { QuantityItem } from '@/types/inventory';
const QuantityManager: () => = ({ items, onItemsChange, readonly = false }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<QuantityItem>>({
    serialNumber: '',
    batchNumber: '',
    location: '',
    condition: 'new',
    status: 'available',
    acquiredDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleAddItem = () => {
    if (!newItem.location) return;

    const item= {
      id: Date.now().toString(),
      serialNumber,
      location: newItem.location,
      condition: newItem.condition'condition'],
      status: newItem.status'status'],
      acquiredDate: newItem.acquiredDate,
      expiryDate,
      notes: newItem.notes || undefined
    };

    onItemsChange([...items, item]);
    setNewItem({
      serialNumber: '',
      batchNumber: '',
      location: '',
      condition: 'new',
      status: 'available',
      acquiredDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setAddDialogOpen(false);
  };

  const handleEditItem = () => {
    if (!editingItem) return;

    const updatedItems = items.map(item => 
      item.id === editingItem.id ? editingItem );
    onItemsChange(updatedItems);
    setEditingItem(null);
    setEditDialogOpen(false);
  };

  const handleDeleteItem = (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onItemsChange(items.filter(item => item.id !== itemId));
    }
  };

  const getStatusIcon = (status: QuantityItem['status']) => {
    switch (status) {
      case 'available'="h-4 w-4 text-green-500" />;
      case 'reserved'="h-4 w-4 text-yellow-500" />;
      case 'shipped'="h-4 w-4 text-blue-500" />;
      case 'returned'="h-4 w-4 text-orange-500" />;
      default="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: QuantityItem['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: QuantityItem['condition']) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-yellow-100 text-yellow-800';
      case 'refurbished': return 'bg-blue-100 text-blue-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableCount = items.filter(item => item.status === 'available').length;
  const reservedCount = items.filter(item => item.status === 'reserved').length;
  const shippedCount = items.filter(item => item.status === 'shipped').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Quantity Management</span>
            <Badge variant="outline">{items.length} items</Badge>
          </CardTitle>
          {!readonly && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Serial Number</Label>
                      <Input
                        value={newItem.serialNumber || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, serialNumber))}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Batch Number</Label>
                      <Input
                        value={newItem.batchNumber || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, batchNumber))}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input
                      value={newItem.location || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, location))}
                      placeholder="e.g., A1-1, Shelf 5, etc."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select 
                        value={newItem.condition} 
                        onValueChange={(value: QuantityItem['condition']) => 
                          setNewItem(prev => ({ ...prev, condition))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={newItem.status} 
                        onValueChange={(value: QuantityItem['status']) => 
                          setNewItem(prev => ({ ...prev, status))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Acquired Date</Label>
                      <Input
                        type="date"
                        value={newItem.acquiredDate || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, acquiredDate))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={newItem.expiryDate || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, expiryDate))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newItem.notes || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, notes))}
                      placeholder="Additional notes or comments"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem} disabled={!newItem.location}>
                      Add Item
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            <div className="text-sm text-green-700">Available</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{reservedCount}</div>
            <div className="text-sm text-yellow-700">Reserved</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{shippedCount}</div>
            <div className="text-sm text-blue-700">Shipped</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{items.length}</div>
            <div className="text-sm text-gray-700">Total</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial/Batch</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acquired</TableHead>
                {!readonly && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readonly ? 5 : 6} className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No items added yet</p>
                    {!readonly && <p className="text-sm mt-1">Click "Add Item" to get started</p>}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        {item.serialNumber && (
                          <div className="font-mono text-sm">{item.serialNumber}</div>
                        )}
                        {item.batchNumber && (
                          <div className="text-xs text-gray-500">Batch: {item.batchNumber}</div>
                        )}
                        {!item.serialNumber && !item.batchNumber && (
                          <div className="text-xs text-gray-400">No serial/batch</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getConditionColor(item.condition)}>
                        {item.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {new Date(item.acquiredDate).toLocaleDateString()}
                        </span>
                      </div>
                      {item.expiryDate && (
                        <div className="text-xs text-orange-600 mt-1">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    {!readonly && (
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input
                      value={editingItem.serialNumber || ''}
                      onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, serialNumber) )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch Number</Label>
                    <Input
                      value={editingItem.batchNumber || ''}
                      onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, batchNumber) )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editingItem.location}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, location) )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select 
                      value={editingItem.condition} 
                      onValueChange={(value: QuantityItem['condition']) => 
                        setEditingItem(prev => prev ? ({ ...prev, condition) )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={editingItem.status} 
                      onValueChange={(value: QuantityItem['status']) => 
                        setEditingItem(prev => prev ? ({ ...prev, status) )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, notes) )}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditItem}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuantityManager;