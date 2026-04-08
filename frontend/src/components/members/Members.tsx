import { useEffect, useRef } from "react";
import { Users, AlertTriangle, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MemberFilters } from "./MemberFilters";
import { MemberCard } from "./MemberCard";
import { Member } from "@/types/member";

interface MembersProps {
  members: Member[];
  filteredMembers: Member[];
  total: number;
  membersLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  membersError: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  membershipFilter: string;
  setMembershipFilter: (value: string) => void;
  memberCounts: any;
  onEdit: (m: Member) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onActivate: (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
}

export const Members = ({
  members,
  filteredMembers,
  total,
  membersLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  membersError,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  membershipFilter,
  setMembershipFilter,
  memberCounts,
  onEdit,
  onArchive,
  onDelete,
  onAdd,
  onActivate,
  onDeactivate,
}: MembersProps) => {
  // Sentinel element — triggers next page load when it scrolls into view
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) onLoadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 cursor-default">
        <Users className="w-6 h-6 text-primary" />
        Member Management
      </h2>

      <MemberFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        membershipFilter={membershipFilter}
        onMembershipFilterChange={setMembershipFilter}
        memberCounts={memberCounts}
      />

      {membersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : membersError ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load members</h3>
          <p className="text-muted-foreground">{membersError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onActivate={onActivate} 
              onDeactivate={onDeactivate} 
            />
          ))}
        </div>
      )}

      {/* Scroll sentinel — IntersectionObserver watches this to load next page */}
      {!membersLoading && !membersError && <div ref={sentinelRef} className="h-4" />}

      {/* Loading spinner while fetching next page */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Loaded-all indicator */}
      {!membersLoading && !membersError && !hasNextPage && filteredMembers.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          All {filteredMembers.length} members loaded
        </p>
      )}

      {!membersLoading && !membersError && filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No members found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" || membershipFilter !== "all"
              ? "Try adjusting your filters"
              : "Add your first member to get started"}
          </p>
          {!searchTerm && statusFilter === "all" && membershipFilter === "all" && (
            <Button onClick={onAdd} variant="premium">
              <Plus className="w-4 h-4 mr-2" />
              Add First Member
            </Button>
          )}
        </div>
      )}
    </section>
  );
};
