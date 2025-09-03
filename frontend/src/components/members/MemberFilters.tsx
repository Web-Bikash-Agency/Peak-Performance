import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, UserCheck, UserX, AlertTriangle, Archive } from "lucide-react";
import { Member } from "@/types/member";

interface MemberFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  membershipFilter: string;
  onMembershipFilterChange: (type: string) => void;
  memberCounts: {
    total: number;
    active: number;
    inactive: number;
    expiringSoon: number;
    archived: number;
  };
}

export function MemberFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  membershipFilter,
  onMembershipFilterChange,
  memberCounts
}: MemberFiltersProps) {
  const filterButtons = [
    {
      label: "All Members",
      value: "All Members", // ✅ Consistent capitalized format
      count: memberCounts.total,
      icon: Users,
      variant: "outline" as const
    },
    {
      label: "Active",
      value: "Active",
      count: memberCounts.active,
      icon: UserCheck,
      variant: "success" as const
    },
    {
      label: "Inactive",
      value: "Inactive",
      count: memberCounts.inactive,
      icon: UserX,
      variant: "secondary" as const
    },
    {
      label: "Expiring Soon",
      value: "Expiring Soon",
      count: memberCounts.expiringSoon,
      icon: AlertTriangle,
      variant: "warning" as const
    },
    {
      label: "Archived",
      value: "Archived",
      count: memberCounts.archived,
      icon: Archive, // ✅ Better icon for archived
      variant: "destructive" as const // ✅ Better variant for archived
    }
  ];

  // ✅ Helper function to check if a filter is active
  const isFilterActive = (filterValue: string) => {
    // Handle the mapping between display values and internal values
    const filterMap: { [key: string]: string } = {
      "All Members": "all",
      "Active": "active",
      "Inactive": "inactive", 
      "Expiring Soon": "expiring",
      "Archived": "archived"
    };
    
    const mappedValue = filterMap[filterValue] || filterValue.toLowerCase();
    const mappedStatusFilter = filterMap[statusFilter] || statusFilter.toLowerCase();
    
    return mappedValue === mappedStatusFilter;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search and Selects */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search members by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={membershipFilter} onValueChange={onMembershipFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ONE_MONTH">1 Month</SelectItem> {/* ✅ Match database values */}
            <SelectItem value="THREE_MONTH">3 Month</SelectItem>
            <SelectItem value="SIX_MONTH">6 Month</SelectItem>
            <SelectItem value="ONE_YEAR">1 Year</SelectItem> {/* ✅ Match database values */}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((filter) => {
          const Icon = filter.icon;
          const isActive = isFilterActive(filter.value);
          
          return (
            <Button
              key={filter.value}
              variant={isActive ? filter.variant : "outline"}
              onClick={() => onStatusFilterChange(filter.value)}
              className="flex items-center gap-2 transition-all duration-200"
            >
              <Icon className="w-4 h-4" />
              {filter.label}
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {filter.count}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}