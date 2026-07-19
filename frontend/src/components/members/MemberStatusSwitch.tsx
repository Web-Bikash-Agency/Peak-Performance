import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import { Member } from "@/types/member";

interface MemberStatusSwitchProps {
  member: Member;
  onActivate: (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  disabled?: boolean;
  showLabel?: boolean;
}

export function MemberStatusSwitch({ 
  member, 
  onActivate, 
  onDeactivate, 
  disabled = false,
  showLabel = true 
}: MemberStatusSwitchProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (isUpdating) return;
    
    const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
    if (member.status === newStatus) return;
    
    setIsUpdating(true);
    try {
      if (checked) {
        await onActivate(member.id);
      } else {
        await onDeactivate(member.id);
      }
    } catch (error) {
      console.error('Failed to update member status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't show toggle for archived or expiring members
  if (member.status === 'ARCHIVED' || member.status === 'EXPIRING_SOON') {
    return showLabel ? (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 rounded-full bg-muted" />
        <span>{member.status === 'ARCHIVED' ? 'Archived' : 'Expiring Soon'}</span>
      </div>
    ) : null;
  }

  const isActive = member.status === 'ACTIVE';
  
  return (
    <div className="flex items-center gap-2">
      {isUpdating ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={disabled || isUpdating}
          className="data-[state=checked]:bg-green-600"
        />
      )}
      
      {showLabel && (
        <Label className="flex items-center gap-1 text-sm font-medium cursor-pointer">
          {isActive ? (
            <>
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Active</span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-red-600" />
              <span className="text-red-700">Inactive</span>
            </>
          )}
        </Label>
      )}
    </div>
  );
}