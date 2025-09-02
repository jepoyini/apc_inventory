
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Layers, GemIcon, TrendingUp } from 'lucide-react';

// Mock data for the statistics
const statsData = {
  totalMembers: 125,
  activeMatrices: 42,
  totalRevenue: 5750,
  growthRate: 18.5
};

const StatisticCard = ({ 
  icon: Icon, 
  title, 
  value, 
  description,
  trend,
  color = "text-primary"
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  description?: string;
  trend?: { value: number; positive: boolean };
  color?: string;
}) => (
  <Card className="card-hover overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-md font-medium">{title}</CardTitle>
      <div className={`rounded-md p-2 ${color} bg-opacity-10`}>
        <Icon size={18} strokeWidth={2} className={color} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="statistic">
        <div className="statistic-value">{value}</div>
        {description && (
          <div className="statistic-label">{description}</div>
        )}
        {trend && (
          <div className={`text-xs mt-1 font-medium flex items-center ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
            <TrendingUp size={14} className={`mr-1 ${trend.positive ? '' : 'transform rotate-180'}`} />
            {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const Stats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      <StatisticCard
        icon={Users}
        title="Total Members"
        value={statsData.totalMembers}
        description="Active in your network"
        trend={{ value: 12.3, positive: true }}
      />
      
      <StatisticCard
        icon={Layers}
        title="Active Matrices"
        value={statsData.activeMatrices}
        description="Across your network"
        trend={{ value: 8.1, positive: true }}
        color="text-indigo-500"
      />
      
      <StatisticCard
        icon={GemIcon}
        title="Total Revenue"
        value={`$${statsData.totalRevenue}`}
        description="Lifetime earnings"
        trend={{ value: 23.5, positive: true }}
        color="text-emerald-500"
      />
      
      <StatisticCard
        icon={TrendingUp}
        title="Growth Rate"
        value={`${statsData.growthRate}%`}
        description="Month-over-month"
        color="text-amber-500"
      />
    </div>
  );
};

export default Stats;
