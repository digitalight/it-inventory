// app/staff/add-staff-form.tsx
'use client'; // This component has client-side interactivity

import { addStaff } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormStatus } from 'react-dom'; // From React, for pending state
import { toast } from 'sonner'; // For notifications
import { useRef } from 'react'; // To clear the form

function SubmitButton() {
  const { pending } = useFormStatus(); // Hook to get status of form submission
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding Staff...' : 'Add Staff'}
    </Button>
  );
}

export default function AddStaffForm({ onSuccess }: { onSuccess?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null); // To reset the form

  const handleSubmit = async (formData: FormData) => {
    const result = await addStaff(formData); // Call your server action!

    if (result?.error) {
      toast.error('Error: ' + result.error);
    } else {
      toast.success('Staff member added successfully.');
      formRef.current?.reset(); // Clear the form after successful submission
      onSuccess?.(); // Call the onSuccess callback if provided
    }
  };

  return (
    <form action={handleSubmit} ref={formRef} className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstname">First Name</Label>
          <Input id="firstname" name="firstname" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="lastname">Last Name</Label>
          <Input id="lastname" name="lastname" required className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="department">Department (Optional)</Label>
        <Input id="department" name="department" className="mt-1" placeholder="e.g., Mathematics, Science, Administration" />
      </div>
      <div>
        <Label htmlFor="isteacher">Role</Label>
        <Select name="isteacher" defaultValue="false">
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Teacher</SelectItem>
            <SelectItem value="false">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="leavingDate">Leaving Date (Optional)</Label>
          <Input id="leavingDate" name="leavingDate" type="date" className="mt-1" />
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
