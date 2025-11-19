import { useState, useEffect } from "react";
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
import { CalendarIcon, Upload, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Member } from "@/types/member";
import { useToast } from "@/hooks/use-toast";

interface AddMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember?: Member | null;
}

export function AddMemberForm({ isOpen, onClose, editingMember }: AddMemberFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    membershipType: "",
    expiryDate: null as Date | null,
    profilePictureFile: null as File | null,
    profilePicturePreview: "",
  });

  // ⭐ FIXED useEffect (clean + correct)
  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name,
        age: editingMember.age.toString(),
        gender: editingMember.gender,
        email: editingMember.email || "",
        phone: editingMember.phone,
        membershipType: editingMember.membershipType,
        expiryDate: new Date(editingMember.expiryDate),
        profilePicturePreview: editingMember.profilePicture || "",
        profilePictureFile: null,
      });
    } else {
      setFormData({
        name: "",
        age: "",
        gender: "",
        email: "",
        phone: "",
        membershipType: "",
        expiryDate: null,
        profilePicturePreview: "",
        profilePictureFile: null,
      });
    }
  }, [editingMember, isOpen]);

  // ⭐ Handle Image Upload (File + Preview)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      profilePictureFile: file,
      profilePicturePreview: URL.createObjectURL(file),
    }));
  };

  // ⭐ FINAL handleSubmit (FormData logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.membershipType || !formData.expiryDate) {
      toast({ variant: "destructive", title: "Missing fields" });
      return;
    }

    const token = localStorage.getItem("authToken");

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("age", formData.age.toString());
    fd.append("gender", formData.gender.toUpperCase());
    fd.append("email", formData.email || "");
    fd.append("phone", formData.phone);
    fd.append("membershipType", formData.membershipType);
    fd.append("expiryDate", formData.expiryDate.toISOString());

    if (formData.profilePictureFile) {
      fd.append("profilePicture", formData.profilePictureFile);
    }

    const url = editingMember
      ? `${import.meta.env.VITE_API_URL}/members/${editingMember.id}`
      : `${import.meta.env.VITE_API_URL}/members`;

    const method = editingMember ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });

    toast({
      title: editingMember ? "Member Updated" : "Member Added",
      description: `${formData.name} has been ${
        editingMember ? "updated" : "added"
      } successfully.`,
    });

    onClose();
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
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Label>
          </div>

          {/* Name + Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="16"
                max="100"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <Label>Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <Label>Phone *</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {/* Membership + Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Membership Type *</Label>
              <Select
                value={formData.membershipType}
                onValueChange={(value) =>
                  setFormData({ ...formData, membershipType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_MONTH">1 Month</SelectItem>
                  <SelectItem value="THREE_MONTH">3 Month</SelectItem>
                  <SelectItem value="SIX_MONTH">6 Month</SelectItem>
                  <SelectItem value="ONE_YEAR">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expiry Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiryDate
                      ? format(formData.expiryDate, "dd/MM/yy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate || undefined}
                    onSelect={(date) =>
                      setFormData({ ...formData, expiryDate: date || null })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

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
