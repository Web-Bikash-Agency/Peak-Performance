import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Upload, User, CalendarCheck } from "lucide-react";
import { format, addMonths, addYears } from "date-fns";
import { cn } from "@/lib/utils";
import { Member } from "@/types/member";
import { useToast } from "@/hooks/use-toast";

interface AddMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember?: Member | null;
}

// Membership type → display label + price + duration for auto-expiry
const MEMBERSHIP_INFO: Record<string, { label: string; price: number; months: number }> = {
  ONE_MONTH:   { label: '1 Month',  price: 600,  months: 1  },
  THREE_MONTH: { label: '3 Months', price: 1600, months: 3  },
  SIX_MONTH:   { label: '6 Months', price: 3100, months: 6  },
  ONE_YEAR:    { label: '1 Year',   price: 6600, months: 12 },
};

function calcExpiry(joinDate: Date, membershipType: string): Date {
  const info = MEMBERSHIP_INFO[membershipType];
  if (!info) return joinDate;
  // addYears handles 1-year edge cases (e.g. leap year); addMonths handles rest
  return membershipType === 'ONE_YEAR'
    ? addYears(joinDate, 1)
    : addMonths(joinDate, info.months);
}

export function AddMemberForm({ isOpen, onClose, onSave, editingMember }: AddMemberFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name:           editingMember?.name           || '',
    age:            editingMember?.age            || '',
    gender:         editingMember?.gender         || '',
    phone:          editingMember?.phone          || '',
    membershipType: editingMember?.membershipType || '',
    joinDate:       editingMember?.joinDate ? new Date(editingMember.joinDate) : null as Date | null,
    profilePicture: editingMember?.profilePicture || '',
  });

  // Auto-calculate expiry whenever joinDate or membershipType changes
  const calculatedExpiry = useMemo<Date | null>(() => {
    if (!formData.joinDate || !formData.membershipType) return null;
    return calcExpiry(formData.joinDate, formData.membershipType);
  }, [formData.joinDate, formData.membershipType]);

  const selectedMembershipInfo = formData.membershipType
    ? MEMBERSHIP_INFO[formData.membershipType]
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.membershipType || !formData.joinDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (!calculatedExpiry) return;

    const memberData: Omit<Member, 'id'> = {
      name:           formData.name,
      age:            Number(formData.age),
      gender:         formData.gender as Member['gender'],
      phone:          formData.phone,
      membershipType: formData.membershipType as Member['membershipType'],
      joinDate:       formData.joinDate,
      expiryDate:     calculatedExpiry,   // auto-calculated
      status:         'ACTIVE',
      profilePicture: formData.profilePicture,
    };

    onSave(memberData);
    onClose();
    setFormData({
      name: '', age: '', gender: '', phone: '',
      membershipType: '', joinDate: null, profilePicture: '',
    });

    toast({
      title: editingMember ? "Member Updated" : "Member Added",
      description: `${formData.name} has been ${editingMember ? 'updated' : 'added'} successfully.`,
    });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Please select an image smaller than 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setFormData(f => ({ ...f, profilePicture: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-default">
            {editingMember ? "Edit Member" : "Add New Member"}
          </DialogTitle>
          <DialogDescription className="cursor-default">
            {editingMember ? "Update member information" : "Enter new member details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="w-20 h-20 ring-2 ring-primary/20">
              <AvatarImage src={formData.profilePicturePreview} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {formData.name
                  ? formData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>

            <Label htmlFor="picture" className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                <Upload className="w-4 h-4" />
                Upload Photo
              </div>
              <Input id="picture" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </Label>
          </div>

          {/* Name + Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(f => ({ ...f, age: e.target.value }))}
                placeholder="Age"
                min="16"
                max="100"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(v) => setFormData(f => ({ ...f, gender: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91-98000-00000"
              required
            />
          </div>

          {/* Membership Type + Join Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="membership">Membership *</Label>
              <Select
                value={formData.membershipType}
                onValueChange={(v) => setFormData(f => ({ ...f, membershipType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_MONTH">1 Month — ₹600</SelectItem>
                  <SelectItem value="THREE_MONTH">3 Months — ₹1,600</SelectItem>
                  <SelectItem value="SIX_MONTH">6 Months — ₹3,100</SelectItem>
                  <SelectItem value="ONE_YEAR">1 Year — ₹6,600</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Join Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.joinDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.joinDate ? format(formData.joinDate, "dd/MM/yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.joinDate || undefined}
                    onSelect={(date) => setFormData(f => ({ ...f, joinDate: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Auto-calculated expiry info */}
          {calculatedExpiry && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
              <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Expires on:</span>
              <span className="font-semibold text-foreground">
                {format(calculatedExpiry, "dd MMM yyyy")}
              </span>
              {selectedMembershipInfo && (
                <span className="ml-auto font-semibold text-primary">
                  ₹{selectedMembershipInfo.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="premium">
              {editingMember ? "Update Member" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
