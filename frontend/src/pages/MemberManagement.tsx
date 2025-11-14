import { useState, useMemo, useEffect } from "react";
import { Members } from "@/components/members/Members";
import { AddMemberForm } from "@/components/members/AddMemberForm";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/use-api";
import { useAuth } from "@/contexts/AuthContext";
import { Member } from "@/types/member";
import { useSearchParams } from "react-router-dom";
import { membersAPI } from "@/services/api";

export default function MemberManagement() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { stats, monthlyStats, loading: dashboardLoading, error: dashboardError } = useDashboardData();
  

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "all");
  
  // Handle local filter state updates
  const handleStatusFilterChange = (newFilter: string) => {
    
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

  

  // Pagination + server-driven members state
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchPage = async (page = 1, reset = false) => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const params: any = { page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter && statusFilter !== 'all') {
        // Map UI status values to backend enum values
        const statusMap: Record<string, string> = {
          active: 'ACTIVE',
          inactive: 'INACTIVE',
          expiring: 'EXPIRING_SOON',
          archived: 'ARCHIVED'
        };
        params.status = statusMap[statusFilter] || statusFilter;
      }
      if (membershipFilter && membershipFilter !== 'all') params.membershipType = membershipFilter;

      const res = await membersAPI.getAll(params);
      const returnedMembers = (res.data as any).members || [];
      // Normalize backend enum statuses (UPPERCASE) to UI-friendly values
      const statusNormalize: Record<string, string> = {
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        EXPIRING_SOON: 'Expiring Soon',
        ARCHIVED: 'Archived'
      };

      const normalizedMembers = returnedMembers.map((m: any) => ({
        ...m,
        status: statusNormalize[m.status] || m.status
      }));
      const returnedPagination = (res.data as any).pagination || { page, limit: pagination.limit, total: returnedMembers.length, pages: 1 };

      if (reset) {
        setMembers(normalizedMembers);
      } else {
        setMembers(prev => [...prev, ...normalizedMembers]);
      }

      setPagination(returnedPagination);
    } catch (err: any) {
      setMembersError(err?.message || String(err));
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    // Reset and load first page when filters/search change
    setMembers([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, membershipFilter]);

  const handleLoadMore = async () => {
    if (membersLoading) return;
    if (pagination.page >= pagination.pages) return;
    const next = pagination.page + 1;
    await fetchPage(next, false);
  };

  const memberCounts = useMemo(() => {
    if (!stats) return { total: 0, active: 0, inactive: 0, expiringSoon: 0, archived: 0 };
    
    // Calculate archived count from members data since stats might not include it
    const archivedCount = members.filter(m => m.status === "Archived").length;
    
    return {
      total: stats.totalMembers,
      active: stats.activeMembers,
      inactive: stats.inactiveMembers,
      expiringSoon: stats.expiringSoon,
      archived: archivedCount // ✅ Add archived count
    };
  }, [stats, members]);

  const filteredMembers = useMemo(() => {
    
    const filtered = members.filter(member => {
      // Search term matching
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      
      // ✅ Status matching with correct uppercase database values
      let matchesStatus = true;
      
      if (statusFilter === "all") {
        // Show all members except archived (keep current behavior for "All")
        matchesStatus = member.status !== "Archived";
      } else if (statusFilter === "active") {
        matchesStatus = member.status === "Active";
      } else if (statusFilter === "inactive") {
        matchesStatus = member.status === "Inactive";
      } else if (statusFilter === "expiring") {
        matchesStatus = member.status === "Expiring Soon";
      } else if (statusFilter === "archived") {
        // ✅ Show only archived members
        matchesStatus = member.status === "Archived";
      } else {
        // Fallback for any unmapped values
        console.warn("⚠️ Unmapped filter value:", statusFilter, "- showing all members");
        matchesStatus = true;
      }
      
      const matchesMembership = membershipFilter === "all" || member.membershipType === membershipFilter;
      
      return matchesSearch && matchesStatus && matchesMembership;
    });
    
    return filtered;
  }, [members, searchTerm, statusFilter, membershipFilter]);

  const handleAddMember = async (memberData: Omit<Member, 'id'>) => {
    try {
      await membersAPI.create(memberData);
      toast({ title: "Member Added", description: "New member has been added successfully." });
      setIsAddMemberOpen(false);
      // refresh
      fetchPage(1, true);
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
        await membersAPI.update(editingMember.id, memberData);
        toast({ title: "Member Updated", description: "Member has been updated successfully." });
        setEditingMember(null);
        setIsAddMemberOpen(false);
        fetchPage(1, true);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to update member" });
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
  try {
    // Find the member to check its status before deletion
    const memberToDelete = members.find(member => member.id === id);

    await membersAPI.delete(id);

    // Show appropriate message based on whether it was archived or not
    const message = memberToDelete?.status === "Archived" 
      ? "Member has been permanently deleted."
      : "Member has been moved to archived; to permanently delete, delete from Archived";

    toast({ 
      title: "Success", 
      description: message,
      variant: "default" // Use default variant for success
    });
    // refresh
    fetchPage(1, true);
  } catch (error) {
    toast({ 
      variant: "destructive", 
      title: "Error", 
      description: error instanceof Error ? error.message : "Failed to delete member" 
    });
  }
};
  const handleArchiveMember = async (id: string) => {
  const member = members.find(m => m.id === id);
  if (!member) return;

  try {
    if (member.status === 'Archived') {
      // Unarchive - set back to Active
      await membersAPI.update(id, { status: 'Active' });
      toast({ 
        title: "Member Unarchived", 
        description: "Member has been restored successfully." 
      });
    } else {
      // Archive
      await membersAPI.update(id, { status: 'Archived' });
      toast({ 
        title: "Member Archived", 
        description: "Member has been archived successfully." 
      });
    }
  } catch (error) {
    toast({ 
      variant: "destructive", 
      title: "Error", 
      description: error instanceof Error ? error.message : "Failed to update member status" 
    });
  }
};

  // ✅ New handlers for activating/deactivating members
  const handleActivateMember = async (id: string) => {
    try {
      await membersAPI.update(id, { status: 'Active' });
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
      await membersAPI.update(id, { status: 'Inactive' });
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
        onLoadMore={handleLoadMore}
        hasMore={pagination.page < pagination.pages}
      />

      {/* Add/Edit Member Form */}
{isAddMemberOpen && (
  <AddMemberForm
    isOpen={isAddMemberOpen}           // ✅ Correct prop name
    onClose={handleCloseForm}          // ✅ Correct prop name  
    onSave={editingMember ? handleUpdateMember : handleAddMember} // ✅ Correct prop name
    editingMember={editingMember}      // ✅ Correct prop name
  />
)}
    </div>
  );
}