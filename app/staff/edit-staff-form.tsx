// app/staff/edit-staff-form.tsx
'use client';

import { updateStaff } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { useRef, useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Updating Staff...' : 'Update Staff'}
    </Button>
  );
}

type StaffData = {
  id: string
  email: string
  firstname: string
  lastname: string
  department: string | null
  isteacher: boolean
  startDate: Date
  leavingDate: Date | null
}

export default function EditStaffForm({ 
  staff, 
  onSuccess 
}: { 
  staff: StaffData
  onSuccess?: () => void 
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isTeacher, setIsTeacher] = useState(staff.isteacher);

  const handleSubmit = async (formData: FormData) => {
    formData.set('isteacher', isTeacher.toString());
    const result = await updateStaff(formData);

    if (result?.error) {
      toast.error('Error: ' + result.error);
    } else {
      toast.success('Staff updated successfully.');
      onSuccess?.();
    }
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <form action={handleSubmit} ref={formRef} className="grid grid-cols-1 gap-4">
      <input type="hidden" name="id" value={staff.id} />
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1" defaultValue={staff.email} />
      </div>
      <div>
        <Label htmlFor="firstname">First Name</Label>
        <Input id="firstname" name="firstname" required className="mt-1" defaultValue={staff.firstname} />
      </div>
      <div>
        <Label htmlFor="lastname">Last Name</Label>
        <Input id="lastname" name="lastname" required className="mt-1" defaultValue={staff.lastname} />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" className="mt-1" defaultValue={staff.department || ''} />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isteacher" 
          checked={isTeacher}
          onCheckedChange={(checked) => setIsTeacher(checked === true)}
        />
        <Label htmlFor="isteacher">Is Teacher</Label>
      </div>
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input 
          id="startDate" 
          name="startDate" 
          type="date" 
          className="mt-1" 
          defaultValue={formatDateForInput(staff.startDate)}
        />
      </div>
      <div>
        <Label htmlFor="leavingDate">Leaving Date (Optional)</Label>
        <Input 
          id="leavingDate" 
          name="leavingDate" 
          type="date" 
          className="mt-1" 
          defaultValue={formatDateForInput(staff.leavingDate)}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
