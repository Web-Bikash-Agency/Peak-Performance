import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, LogOut } from "lucide-react";
import { AddMemberForm } from "@/components/members/AddMemberForm";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData, useMembers } from "@/hooks/use-api";
import { useAuth } from "@/contexts/AuthContext";
import { Member } from "@/types/member";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

const Index = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const { stats, monthlyStats, loading: dashboardLoading, error: dashboardError } = useDashboardData();
  const { 
    members, 
    loading: membersLoading, 
    error: membersError, 
    addMember: apiAddMember,
    updateMember: apiUpdateMember,
    deleteMember: apiDeleteMember
  } = useMembers();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const memberCounts = useMemo(() => {
    if (!stats) return { total: 0, active: 0, inactive: 0, expiringSoon: 0 };
    return {
      total: stats.totalMembers,
      active: stats.activeMembers,
      inactive: stats.inactiveMembers,
      expiringSoon: stats.expiringSoon
    };
  }, [stats]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      const matchesMembership = membershipFilter === "all" || member.membershipType === membershipFilter;
      return matchesSearch && matchesStatus && matchesMembership;
    });
  }, [members, searchTerm, statusFilter, membershipFilter]);

  const handleAddMember = async (memberData: Omit<Member, 'id'>) => {
    try {
      await apiAddMember(memberData);
      toast({ title: "Member Added", description: "New member has been added successfully." });
      setIsAddMemberOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to add member" });
    }
  };


  const handleUpdateMember = async (memberData: Omit<Member, 'id'>) => {
    if (editingMember) {
      try {
        await apiUpdateMember(editingMember.id, memberData);
        toast({ title: "Member Updated", description: "Member has been updated successfully." });
        setEditingMember(null);
        setIsAddMemberOpen(false);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to update member" });
      }
    }
  };


  const handleDeleteMember = async (id: string) => {
    try {
      await apiDeleteMember(id);
      toast({ variant: "destructive", title: "Member Deleted", description: "Member has been deleted permanently." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to delete member" });
    }
  };

  const handleCloseForm = () => {
    setIsAddMemberOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="min-h-screen bg-background px-3">
      {/* Header */}
<header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
  <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
      
      {/* Logo and Title Section */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <div className="bg-gradient-primary p-1.5 sm:p-2 rounded-lg shadow-glow flex-shrink-0">
          <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate cursor-default">
            FitCulture Admin
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground hidden sm:block cursor-default">
            Gym Management System
          </p>
          <p className="text-xs text-muted-foreground sm:hidden cursor-default">
            Gym Management
          </p>
        </div>
      </div>
      
      {/* Action Buttons Section */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
        <Button 
          onClick={() => setIsAddMemberOpen(true)} 
          variant="premium" 
          className="shadow-primary flex-1 sm:flex-none"
          size="sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Add Member</span>
          <span className="xs:hidden">Add</span>
        </Button>
        <Button 
          onClick={logout} 
          variant="outline" 
          size="sm"
          className="flex-shrink-0"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  </div>
</header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <DashboardOverview
          memberCounts={memberCounts}
          monthlyStats={monthlyStats}
          loading={dashboardLoading}
          error={dashboardError}
        />
      </main>

      <AddMemberForm
        isOpen={isAddMemberOpen}
        onClose={handleCloseForm}
        onSave={editingMember ? handleUpdateMember : handleAddMember}
        editingMember={editingMember}
      />
    </div>
  );
};

export default Index;
