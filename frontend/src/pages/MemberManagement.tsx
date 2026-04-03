import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Members } from "@/components/members/Members";
import { AddMemberForm } from "@/components/members/AddMemberForm";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData, useMembers } from "@/hooks/use-api";
import { useAuth } from "@/contexts/AuthContext";
import { Member } from "@/types/member";
import { useSearchParams } from "react-router-dom";

// Map UI filter labels → API status values
const STATUS_TO_API: Record<string, string | undefined> = {
  all:      undefined,
  active:   "ACTIVE",
  inactive: "INACTIVE",
  expiring: "EXPIRING_SOON",
  archived: "ARCHIVED",
  // display-name aliases sent by MemberFilters
  "All Members":   undefined,
  "Active":        "ACTIVE",
  "Inactive":      "INACTIVE",
  "Expiring Soon": "EXPIRING_SOON",
  "Archived":      "ARCHIVED",
};

export default function MemberManagement() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { stats } = useDashboardData();
  const {
    members,
    total,
    loading: membersLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: membersError,
    fetchMembers,
    addMember: apiAddMember,
    updateMember: apiUpdateMember,
    deleteMember: apiDeleteMember,
  } = useMembers();

  const [searchTerm, setSearchTerm]           = useState("");
  const [statusFilter, setStatusFilter]       = useState(searchParams.get("filter") || "all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember]     = useState<Member | null>(null);

  // Sync filter from URL on first load
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) setStatusFilter(filter);
  }, []);                                       // run once

  // Re-fetch from server whenever any filter changes
  useEffect(() => {
    const apiFilters: Record<string, string> = {};
    const apiStatus = STATUS_TO_API[statusFilter];
    if (apiStatus)                    apiFilters.status         = apiStatus;
    if (searchTerm.trim())            apiFilters.search         = searchTerm.trim();
    if (membershipFilter !== "all")   apiFilters.membershipType = membershipFilter;

    // Sort expiring members by urgency: expired first, then soonest to expire
    if (apiStatus === "EXPIRING_SOON") {
      apiFilters.sortBy    = "expiryDate";
      apiFilters.sortOrder = "asc";
    }

    fetchMembers(1, 10, apiFilters);
  }, [statusFilter, searchTerm, membershipFilter]);

  const handleStatusFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    setSearchTerm("");
    if (searchParams.get("filter")) setSearchParams({});
  };

  const memberCounts = useMemo(() => {
    if (!stats) return { total: 0, active: 0, inactive: 0, expiringSoon: 0, archived: 0 };
    return {
      total:        stats.totalMembers,
      active:       stats.activeMembers,
      inactive:     stats.inactiveMembers,
      expiringSoon: stats.expiringSoon,
      archived:     0,   // fetched from dashboard API; extend if needed
    };
  }, [stats]);

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

  return (
    <div className="space-y-8 space-x-8 mt-8 ml-4 mr-8">
      <Button variant="outline" size="sm" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      {/* Members Section */}
      <Members
        members={members}
        filteredMembers={members}
        total={total}
        membersLoading={membersLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={fetchNextPage}
        membersError={membersError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        membershipFilter={membershipFilter}
        setMembershipFilter={setMembershipFilter}
        memberCounts={memberCounts}
        onEdit={handleEditMember}
        onArchive={handleArchiveMember}
        onDelete={handleDeleteMember}
        onActivate={handleActivateMember}
        onDeactivate={handleDeactivateMember}
        onAdd={() => setIsAddMemberOpen(true)}
      />

      {/* Add/Edit Member Form */}
      {isAddMemberOpen && (
        <AddMemberForm
          isOpen={isAddMemberOpen}
          onClose={handleCloseForm}
          onSave={editingMember ? handleUpdateMember : handleAddMember}
          editingMember={editingMember}
        />
      )}
    </div>
  );
}