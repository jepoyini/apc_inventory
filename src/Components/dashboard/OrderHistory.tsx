
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Download, Eye, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock order data
type Order = {
  id: string;
  date: string;
  type: 'Basic Matrix' | 'Premium Matrix';
  amount: number;
  status: 'Completed' | 'Processing' | 'Refunded';
};

const mockOrders: Order[] = [
  {
    id: 'ORD-7896',
    date: '2023-07-15',
    type: 'Premium Matrix',
    amount: 100,
    status: 'Completed'
  },
  {
    id: 'ORD-7895',
    date: '2023-07-10',
    type: 'Basic Matrix',
    amount: 25,
    status: 'Completed'
  },
  {
    id: 'ORD-7894',
    date: '2023-07-01',
    type: 'Premium Matrix',
    amount: 100,
    status: 'Completed'
  },
  {
    id: 'ORD-7893',
    date: '2023-06-28',
    type: 'Basic Matrix',
    amount: 25,
    status: 'Completed'
  },
  {
    id: 'ORD-7892',
    date: '2023-06-20',
    type: 'Premium Matrix',
    amount: 100,
    status: 'Refunded'
  },
  {
    id: 'ORD-7891',
    date: '2023-06-15',
    type: 'Basic Matrix',
    amount: 25,
    status: 'Completed'
  },
  {
    id: 'ORD-7890',
    date: '2023-06-10',
    type: 'Premium Matrix',
    amount: 100,
    status: 'Completed'
  }
];

const OrderHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and paginate orders
  const filteredOrders = mockOrders.filter(order => {
    if (filter !== 'all' && order.type !== filter) {
      return false;
    }
    
    return order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.date.includes(searchTerm);
  });
  
  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Processing':
        return 'outline';
      case 'Refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Order History</CardTitle>
            <CardDescription>
              View all your matrix purchases
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8 w-full sm:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Basic Matrix">Basic Matrix</SelectItem>
                <SelectItem value="Premium Matrix">Premium Matrix</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="animate-slide-in">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {order.type === 'Premium Matrix' ? (
                        <div className="flex items-center">
                          {order.type}
                          <Check size={14} className="ml-1 text-primary" />
                        </div>
                      ) : (
                        order.type
                      )}
                    </TableCell>
                    <TableCell>${order.amount}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View details"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Download receipt"
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                    No orders found
                    {searchTerm && (
                      <div className="mt-2 text-sm">
                        Try a different search term
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredOrders.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, pageCount))}
                disabled={page === pageCount}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
