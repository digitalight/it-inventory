// app/laptops/edit-laptop-form.tsx
'use client';

import { updateLaptop } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { useRef } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Updating Laptop...' : 'Update Laptop'}
    </Button>
  );
}

type LaptopData = {
  id: string
  make: string
  model: string
  deviceName: string | null
  serialNumber: string
  status: string
  assignedTo: {
    email: string
  } | null
}

export default function EditLaptopForm({ 
  laptop, 
  onSuccess 
}: { 
  laptop: LaptopData
  onSuccess?: () => void 
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await updateLaptop(formData);

    if (result?.error) {
      toast.error('Error: ' + result.error);
    } else {
      toast.success('Laptop updated successfully.');
      onSuccess?.();
    }
  };

  return (
    <form action={handleSubmit} ref={formRef} className="grid grid-cols-1 gap-4">
      <input type="hidden" name="id" value={laptop.id} />
      
      <div>
        <Label htmlFor="make">Make</Label>
        <Input id="make" name="make" required className="mt-1" defaultValue={laptop.make} />
      </div>
      <div>
        <Label htmlFor="model">Model</Label>
        <Input id="model" name="model" required className="mt-1" defaultValue={laptop.model} />
      </div>
      <div>
        <Label htmlFor="deviceName">Device Name (Optional)</Label>
        <Input 
          id="deviceName" 
          name="deviceName" 
          placeholder="e.g., John's Laptop, Meeting Room 1" 
          className="mt-1" 
          defaultValue={laptop.deviceName || ''} 
        />
      </div>
      <div>
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input id="serialNumber" name="serialNumber" required className="mt-1" defaultValue={laptop.serialNumber} />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={laptop.status}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="In Repair">In Repair</SelectItem>
            <SelectItem value="Returned">Returned</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="assignedTo">Assigned To Email (Optional)</Label>
        <Input 
          id="assignedTo" 
          name="assignedTo" 
          type="email" 
          className="mt-1" 
          placeholder="staff.member@school.edu"
          defaultValue={laptop.assignedTo?.email || ''} 
        />
      </div>
      <SubmitButton />
    </form>
  );
}
