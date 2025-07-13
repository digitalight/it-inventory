// app/laptops/add-laptop-form.tsx
'use client'; // This component has client-side interactivity

import { addLaptop } from './actions';
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
      {pending ? 'Adding Laptop...' : 'Add Laptop'}
    </Button>
  );
}

export default function AddLaptopForm({ onSuccess }: { onSuccess?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null); // To reset the form

  const handleSubmit = async (formData: FormData) => {
    const result = await addLaptop(formData); // Call your server action!

    if (result?.error) {
      toast.error('Error: ' + result.error);
    } else {
      toast.success('Laptop added successfully.');
      formRef.current?.reset(); // Clear the form after successful submission
      onSuccess?.(); // Call the onSuccess callback if provided
    }
  };

  return (
    <form action={handleSubmit} ref={formRef} className="grid grid-cols-1 gap-4">
      <div>
        <Label htmlFor="make">Make</Label>
        <Input id="make" name="make" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="model">Model</Label>
        <Input id="model" name="model" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input id="serialNumber" name="serialNumber" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue="Available">
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="In Repair">In Repair</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
        <Input id="assignedTo" name="assignedTo" className="mt-1" />
      </div>
      <SubmitButton />
    </form>
  );
}