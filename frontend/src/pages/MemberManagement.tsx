import { useState, useMemo, useEffect } from "react";
import { Members } from "@/components/members/Members";
import { AddMemberForm } from "@/components/members/AddMemberForm";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData, useMembers } from "@/hooks/use-api";
import { useAuth } from "@/contexts/AuthContext";
import { Member } from "@/types/member";
import { useSearchParams } from "react-router-dom";

export default function MemberManagement() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "all");
  
  // Handle local filter state updates
  const handleStatusFilterChange = (newFilter: string) => {
    console.log("Filter changed to:", newFilter);
    
    // ✅ Map display names from Members component to internal filter values
    const filterMap: { [key: string]: string } = {
      "All Members": "all",
      "Active": "active", 
      "Inactive": "inactive",
      "Expiring Soon": "expiring",
      "Archived": "archived", // ✅ Added archived mapping
      // Also handle lowercase values from URL parameters
      "all": "all",
      "active": "active",
      "inactive": "inactive", 
      "expiring": "expiring",
      "archived": "archived"
    };
    
    const mappedFilter = filterMap[newFilter] || newFilter.toLowerCase();
    console.log("Mapped filter value:", mappedFilter);
    
    setStatusFilter(mappedFilter);
    setSearchTerm(""); // Clear search when changing filters
    // Clear URL params when using local filters
    if (searchParams.get("filter")) {
      setSearchParams({});
    }
  };
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      setStatusFilter(filter);
    }
  }, [searchParams]);

  

  const memberCounts = useMemo(() => {
    if (!stats) return { total: 0, active: 0, inactive: 0, expiringSoon: 0, archived: 0 };
    
    // Calculate archived count from members data since stats might not include it
    const archivedCount = members.filter(m => m.status === "ARCHIVED").length;
    
    return {
      total: stats.totalMembers,
      active: stats.activeMembers,
      inactive: stats.inactiveMembers,
      expiringSoon: stats.expiringSoon,
      archived: archivedCount // ✅ Add archived count
    };
  }, [stats, members]);

  const filteredMembers = useMemo(() => {
    console.log("🔍 FILTERING - Current statusFilter:", statusFilter);
    
    const filtered = members.filter(member => {
      // Search term matching
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      
      // ✅ Status matching with correct uppercase database values
      let matchesStatus = true;
      
      if (statusFilter === "all") {
        // Show all members except archived (keep current behavior for "All")
        matchesStatus = member.status !== "ARCHIVED";
      } else if (statusFilter === "active") {
        matchesStatus = member.status === "ACTIVE";
      } else if (statusFilter === "inactive") {
        matchesStatus = member.status === "INACTIVE";
      } else if (statusFilter === "expiring") {
        matchesStatus = member.status === "EXPIRING_SOON";
      } else if (statusFilter === "archived") {
        // ✅ Show only archived members
        matchesStatus = member.status === "ARCHIVED";
      } else {
        // Fallback for any unmapped values
        console.warn("⚠️ Unmapped filter value:", statusFilter, "- showing all members");
        matchesStatus = true;
      }
      
      const matchesMembership = membershipFilter === "all" || member.membershipType === membershipFilter;
      
      return matchesSearch && matchesStatus && matchesMembership;
    });
    
    console.log(`✅ FILTERING RESULT: ${filtered.length}/${members.length} members match filter "${statusFilter}"`);
    
    // Log which members are shown for debugging
    if (filtered.length > 0) {
      console.log("Members shown:", filtered.map(m => `${m.name} (${m.status})`));
    }
    
    return filtered;
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

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsAddMemberOpen(true);
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

  const handleArchiveMember = async (id: string) => {
    try {
      await apiUpdateMember(id, { status: 'ARCHIVED' });
      toast({ title: "Member Archived", description: "Member has been archived successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to archive member" });
    }
  };

  // ✅ New handlers for activating/deactivating members
  const handleActivateMember = async (id: string) => {
    try {
      await apiUpdateMember(id, { status: 'ACTIVE' });
      toast({ 
        title: "Member Activated", 
        description: "Member status has been set to active.",
        variant: "default"
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to activate member" 
      });
      throw error; // Re-throw so the switch component can handle the error
    }
  };

  const handleDeactivateMember = async (id: string) => {
    try {
      await apiUpdateMember(id, { status: 'INACTIVE' });
      toast({ 
        title: "Member Deactivated", 
        description: "Member status has been set to inactive.",
        variant: "default"
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to deactivate member" 
      });
      throw error; // Re-throw so the switch component can handle the error
    }
  };

  const handleCloseForm = () => {
    setIsAddMemberOpen(false);
    setEditingMember(null);
  };

  const handleCardClick = (filter: string) => {
    console.log("Local filter button clicked:", filter);
    setStatusFilter(filter);
    setSearchTerm("");
    // Clear URL parameter when using local filters
    if (searchParams.get("filter")) {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-8 space-x-8 mt-8 ml-4 mr-8">
      {/* Members Section */}
      <Members
        members={members}
        filteredMembers={filteredMembers}
        membersLoading={membersLoading}
        membersError={membersError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange} // ✅ Use the new handler
        membershipFilter={membershipFilter}
        setMembershipFilter={setMembershipFilter}
        memberCounts={memberCounts}
        onEdit={handleEditMember}
        onArchive={handleArchiveMember}
        onDelete={handleDeleteMember}
        onActivate={handleActivateMember} // ✅ New prop
        onDeactivate={handleDeactivateMember} // ✅ New prop
        onAdd={() => setIsAddMemberOpen(true)}
      />

      {/* Add/Edit Member Form */}
      {isAddMemberOpen && (
        <AddMemberForm
          member={editingMember}
          onSubmit={editingMember ? handleUpdateMember : handleAddMember}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}