import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { StaffMember } from "@/hooks/use-staff-selection"

interface StaffSelectorProps {
  selectedStaffId: string
  onStaffChange: (staffId: string) => void
  staffMembers: StaffMember[]
  isLoading: boolean
  label?: string
  placeholder?: string
  noStaffMessage?: string
}

export function StaffSelector({
  selectedStaffId,
  onStaffChange,
  staffMembers,
  isLoading,
  label = "Staff Member",
  placeholder = "Select a staff member",
  noStaffMessage = "No staff members available for assignment."
}: StaffSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="staff">{label}</Label>
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading staff members...</div>
      ) : staffMembers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {noStaffMessage}
        </div>
      ) : (
        <Select value={selectedStaffId} onValueChange={onStaffChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                <div className="flex flex-col">
                  <div className="font-medium">
                    {staff.lastname}, {staff.firstname}
                  </div>
                  <div className="text-xs text-gray-500">
                    {staff.email}
                    {staff.department && ` • ${staff.department}`}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
