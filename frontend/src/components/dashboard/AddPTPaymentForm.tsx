import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { membersAPI } from "@/services/api";
import { Member } from "@/types/member";
import { useToast } from "@/hooks/use-toast";

interface AddPTPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { memberId: string; amount: number; notes?: string }) => Promise<unknown>;
  saving: boolean;
}

const DEFAULT_PT_FEE = 2500;

export function AddPTPaymentForm({ isOpen, onClose, onSave, saving }: AddPTPaymentFormProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [amount, setAmount] = useState(String(DEFAULT_PT_FEE));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    membersAPI
      .getAll({ search: search || undefined, limit: 20, status: "ACTIVE" })
      .then(r => setMembers(r.data.members))
      .catch(() => {});
  }, [search, isOpen]);

  const reset = () => {
    setSelectedMember(null);
    setSearch("");
    setAmount(String(DEFAULT_PT_FEE));
    setNotes("");
    setOpen(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      toast({ variant: "destructive", title: "Select a member", description: "Please choose the member taking PT." });
      return;
    }
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Enter a valid PT fee." });
      return;
    }
    await onSave({ memberId: selectedMember.id, amount: parsed, notes: notes || undefined });
    toast({ title: "PT Recorded", description: `₹${parsed.toLocaleString("en-IN")} PT payment recorded for ${selectedMember.name}.` });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-default">
            <Dumbbell className="w-5 h-5 text-primary" />
            Record PT Payment
          </DialogTitle>
          <DialogDescription className="cursor-default">
            Instantly records a paid Personal Training session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Member picker */}
          <div className="space-y-1">
            <Label>Member *</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal"
                >
                  {selectedMember ? (
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{selectedMember.name}</span>
                      <span className="text-xs text-muted-foreground">{selectedMember.phone}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Search member…</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Type name or phone…"
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList onWheel={e => e.stopPropagation()}>
                    <CommandEmpty>No active members found.</CommandEmpty>
                    <CommandGroup>
                      {members.map(m => (
                        <CommandItem
                          key={m.id}
                          value={m.id}
                          onSelect={() => {
                            setSelectedMember(m);
                            setOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedMember?.id === m.id ? "opacity-100" : "opacity-0")} />
                          <span>{m.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{m.phone}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* PT Fee */}
          <div className="space-y-1">
            <Label htmlFor="pt-amount">PT Fee (₹) *</Label>
            <Input
              id="pt-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="2500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="pt-notes">Notes</Label>
            <Input
              id="pt-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Monthly PT package"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="premium" disabled={saving}>
              {saving ? "Recording…" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
