
import React, { useState } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarIcon, DollarSign, TrendingUp, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Mock earnings data
const earningsData = {
  total: 725,
  pending: 150,
  available: 575,
  referralCount: 14,
  
  monthly: [
    { month: 'Jan', earnings: 0 },
    { month: 'Feb', earnings: 0 },
    { month: 'Mar', earnings: 25 },
    { month: 'Apr', earnings: 100 },
    { month: 'May', earnings: 200 },
    { month: 'Jun', earnings: 300 },
    { month: 'Jul', earnings: 100 },
  ],
  
  transactions: [
    { id: 'TR001', date: '2023-07-10', description: 'Commission from John D.', amount: 25 },
    { id: 'TR002', date: '2023-07-05', description: 'Matrix completion bonus', amount: 50 },
    { id: 'TR003', date: '2023-06-28', description: 'Commission from Sarah L.', amount: 25 },
    { id: 'TR004', date: '2023-06-25', description: 'Commission from Mike T.', amount: 100 },
    { id: 'TR005', date: '2023-06-20', description: 'Direct referral bonus', amount: 75 },
  ]
};

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded-md shadow-sm text-xs">
        <p className="font-medium">{payload[0].payload.month}</p>
        <p className="text-primary">
          ${payload[0].value}
        </p>
      </div>
    );
  }

  return null;
};

const Earnings = () => {
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState('6months');
  
  // Filter chart data based on selected period
  const getFilteredChartData = () => {
    switch (period) {
      case '3months':
        return earningsData.monthly.slice(-3);
      case '6months':
        return earningsData.monthly.slice(-6);
      case 'year':
        return earningsData.monthly;
      default:
        return earningsData.monthly;
    }
  };

  return (
    <div className="grid gap-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="statistic">
              <div className="statistic-value flex items-center">
                <DollarSign className="h-5 w-5 text-primary mr-1" />
                ${earningsData.total}
              </div>
              <div className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +25% from last month
              </div>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-10">
              <DollarSign className="h-16 w-16 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="statistic">
              <div className="statistic-value">
                ${earningsData.available}
              </div>
              <Button className="mt-2" size="sm">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="statistic">
              <div className="statistic-value">
                ${earningsData.pending}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Processing in 7-14 days
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="statistic">
              <div className="statistic-value flex items-center">
                <BadgeCheck className="h-5 w-5 text-primary mr-1" />
                {earningsData.referralCount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Earning commissions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Earnings chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Your earnings over time
              </CardDescription>
            </div>
            <Select
              value={period}
              onValueChange={setPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getFilteredChartData()}
                margin={{ 
                  top: 20, 
                  right: 30, 
                  left: isMobile ? 0 : 20, 
                  bottom: 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                  width={isMobile ? 30 : 40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="earnings" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your most recent earnings activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earningsData.transactions.map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-lg">+${transaction.amount}</div>
                    <div className="text-xs text-emerald-500">Commission</div>
                  </div>
                </div>
                {index < earningsData.transactions.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;
