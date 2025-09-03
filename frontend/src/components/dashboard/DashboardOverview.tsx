import { Activity, AlertTriangle, TrendingUp, Users, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface DashboardOverviewProps {
  memberCounts: {
    total: number;
    active: number;
    inactive: number;
    expiringSoon: number;
  };
  monthlyStats: any[];
  loading: boolean;
  error: string | null;
}

export const DashboardOverview = ({ memberCounts, monthlyStats, loading, error }: DashboardOverviewProps) => {
  const navigate = useNavigate();

  const handleCardClick = (filter: string) => {
    // Navigate to member management with filter as URL parameter
    navigate(`/member-management?filter=${filter}`);
  };


  useEffect(() => {
  console.log('Monthly stats received:', monthlyStats);
  console.log('Data length:', monthlyStats?.length);
  console.log('First item:', monthlyStats?.[0]);
}, [monthlyStats]);


  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 cursor-default">
          <Activity className="w-6 h-6 text-primary" />
          Dashboard Overview
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
                title="Total Members"
                value={memberCounts.total}
                icon={Users}
                trend="+12% from last month"
                variant="primary"
                onClick={() => handleCardClick("all")}
            />
            <StatsCard 
                title="Active Members" 
                value={memberCounts.active} 
                icon={Users} 
                trend="+5% from last month" 
                variant="success" 
                onClick={() => handleCardClick("active")}
            />
            <StatsCard 
                title="Inactive Members" 
                value={memberCounts.inactive} 
                icon={Users} 
                trend="-2% from last month" 
                onClick={() => handleCardClick("inactive")}
            />
            <StatsCard 
                title="Expiring Soon" 
                value={memberCounts.expiringSoon} 
                icon={AlertTriangle} 
                trend="Next 2 days" 
                variant="warning" 
                onClick={() => handleCardClick("expiring")}
            />
          </div>
        )}
      </section>

      {/* Analytics Chart */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 cursor-default">
          <TrendingUp className="w-6 h-6 text-primary" />
          Monthly Analytics
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading analytics...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <MonthlyChart data={monthlyStats} />
        )}
      </section>
    </div>
  );
};