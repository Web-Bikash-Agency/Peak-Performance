import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Archive, Trash2, Phone, Calendar, Crown } from "lucide-react";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";
import { MemberStatusSwitch } from "./MemberStatusSwitch";
import { format } from "date-fns";

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => Promise<void>; // ✅ Added
  onDeactivate: (id: string) => Promise<void>; // ✅ Added
}

const STATUS_LABEL: Record<Member['status'], string> = {
  ACTIVE:        'Active',
  INACTIVE:      'Inactive',
  EXPIRING_SOON: 'Expiring Soon',
  ARCHIVED:      'Archived',
};

const GENDER_LABEL: Record<Member['gender'], string> = {
  MALE:   'Male',
  FEMALE: 'Female',
  OTHER:  'Other',
};

const STATUS_COLOR: Record<Member['status'], string> = {
  ACTIVE:        'bg-accent text-accent-foreground',
  INACTIVE:      'bg-muted text-muted-foreground',
  EXPIRING_SOON: 'bg-warning text-warning-foreground',
  ARCHIVED:      'bg-destructive/20 text-destructive',
};

export function MemberCard({ member, onEdit, onArchive, onDelete, onActivate, onDeactivate }: MemberCardProps) {
  const expiryDate    = new Date(member.expiryDate);
  const now           = new Date();
  const msLeft        = expiryDate.getTime() - now.getTime();
  const daysLeft      = msLeft / (1000 * 60 * 60 * 24);
  const isExpired     = daysLeft < 0;
  const isExpiringSoon = member.status === 'EXPIRING_SOON';

  const urgencyLabel = () => {
    if (!isExpiringSoon) return null;
    if (isExpired)        return <span className="ml-2 text-destructive font-semibold">Expired</span>;
    if (daysLeft < 1)     return <span className="ml-2 text-destructive font-medium">Expires today</span>;
    const days = Math.ceil(daysLeft);
    return <span className="ml-2 text-warning font-medium">{days} day{days > 1 ? 's' : ''} left</span>;
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:scale-105 animate-scale-in",
      isExpired && isExpiringSoon && "ring-2 ring-destructive",
      !isExpired && isExpiringSoon && "ring-2 ring-warning/60"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={member.profilePicture} alt={member.name} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {member.name}
                {member.membershipType === 'ONE_YEAR' && (
                  <Crown className="w-4 h-4 text-warning" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {member.age} years • {GENDER_LABEL[member.gender]}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("px-2 py-1", STATUS_COLOR[member.status])}>
              {STATUS_LABEL[member.status]}
            </Badge>
            <MemberStatusSwitch
              member={member}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              showLabel={false}
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="w-4 h-4 mr-2" />
            {member.phone}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Expires: {expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            {urgencyLabel()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={member.membershipType === 'ONE_YEAR' ? 'default' : 'secondary'}>
            {member.membershipType}
          </Badge>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(member)}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(member.id)}
              className={
                member.status === "ARCHIVED"
                  ? "hover:bg-green-50 hover:text-green-600"
                  : "hover:bg-muted/80"
              }
              title={
                member.status === "ARCHIVED"
                  ? "Unarchive Member"
                  : "Archive Member"
              }
            >
              {member.status === "ARCHIVED" ? (
                <Archive className="w-4 h-4 rotate-180" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(member.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
