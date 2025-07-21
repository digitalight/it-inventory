"use client"

import { useRef } from "react"
import { importStaffFromCSV } from "@/app/staff/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Importing...' : 'Import CSV'}
    </Button>
  )
}

interface ImportStaffCSVFormProps {
  onSuccess?: () => void
}

export default function ImportStaffCSVForm({ onSuccess }: ImportStaffCSVFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    const result = await importStaffFromCSV(formData)

    if (result?.error) {
      toast.error('Import Error: ' + result.error)
    } else if (result?.success) {
      toast.success(result.message || 'CSV imported successfully!')
      formRef.current?.reset()
      onSuccess?.()
    }
  }

  return (
    <form action={handleSubmit} ref={formRef} className="space-y-4">
      <div>
        <Label htmlFor="csvFile">CSV File</Label>
        <Input 
          id="csvFile" 
          name="csvFile" 
          type="file" 
          accept=".csv" 
          required 
          className="mt-1" 
        />
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        <p className="font-medium">Required CSV columns:</p>
        <ul className="list-disc list-inside text-xs space-y-0.5">
          <li><strong>email</strong> - Email address (required)</li>
          <li><strong>firstname</strong> - First name (required)</li>
          <li><strong>lastname</strong> - Last name (required)</li>
          <li><strong>department</strong> - Department (optional)</li>
          <li><strong>isteacher</strong> - true for Teacher, false for Staff (optional)</li>
          <li><strong>startdate</strong> - Start date in DD/MM/YYYY format (optional)</li>
          <li><strong>leavingdate</strong> - Leaving date in DD/MM/YYYY format (optional)</li>
        </ul>
        <p className="text-xs italic">
          Note: Existing staff members (by email) will be updated with new information.
        </p>
        <p className="text-xs text-orange-600">
          <strong>Date format:</strong> Use DD/MM/YYYY (e.g., 15/03/2024 for March 15, 2024)
        </p>
        <a 
          href="/sample-staff.csv" 
          download 
          className="text-blue-600 hover:text-blue-800 text-xs underline inline-block mt-2"
        >
          Download sample CSV template
        </a>
      </div>
      
      <SubmitButton />
    </form>
  )
}
