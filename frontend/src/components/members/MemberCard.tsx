import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Archive, Trash2, Mail, Phone, Calendar, Crown } from "lucide-react";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";
import { MemberStatusSwitch } from "./MemberStatusSwitch";

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => Promise<void>; // ✅ Added
  onDeactivate: (id: string) => Promise<void>; // ✅ Added
}

export function MemberCard({ member, onEdit, onArchive, onDelete, onActivate, onDeactivate }: MemberCardProps) {
  const getStatusVariant = (status: Member['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Inactive':
        return 'secondary';
      case 'Expiring Soon':
        return 'destructive';
      case 'Archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-accent text-accent-foreground';
      case 'Inactive':
        return 'bg-muted text-muted-foreground';
      case 'Expiring Soon':
        return 'bg-warning text-warning-foreground';
      case 'Archived':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const expiryDate = new Date(member.expiryDate);

  const daysUntilExpiry = Math.ceil(
    expiryDate.getTime() - new Date().getTime()
  ) / (1000 * 60 * 60 * 24);

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:scale-105 animate-scale-in",
      member.status === 'Expiring Soon' && "ring-2 ring-warning/50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={member.profilePicture} alt={member.name} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {member.name}
                {member.membershipType === '1 year' && (
                  <Crown className="w-4 h-4 text-warning" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {member.age} years • {member.gender}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("px-2 py-1", getStatusColor(member.status))}>
              {member.status}
            </Badge>
            <MemberStatusSwitch
              member={member}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              showLabel={false} // Set to false for compact display in card
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="w-4 h-4 mr-2" />
            {member.email}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="w-4 h-4 mr-2" />
            {member.phone}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Expires: {expiryDate.toLocaleDateString()}
            {daysUntilExpiry <= 2 && daysUntilExpiry > 0 && (
              <span className="ml-2 text-warning font-medium">
                ({daysUntilExpiry} days left)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={member.membershipType === '1 year' ? 'default' : 'secondary'}>
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
              className="hover:bg-muted/80"
            >
              <Archive className="w-4 h-4" />
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