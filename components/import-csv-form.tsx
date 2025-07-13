"use client"

import { useRef } from "react"
import { importLaptopsFromCSV } from "@/app/laptops/actions"
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

interface ImportCSVFormProps {
  onSuccess?: () => void
}

export default function ImportCSVForm({ onSuccess }: ImportCSVFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    const result = await importLaptopsFromCSV(formData)

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
          <li><strong>make</strong> - Laptop manufacturer</li>
          <li><strong>model</strong> - Laptop model</li>
          <li><strong>serialnumber</strong> - Unique serial number</li>
          <li><strong>status</strong> - Available, Assigned, In Repair, or Retired</li>
          <li><strong>assignedto</strong> - Person assigned to (optional)</li>
        </ul>
        <p className="text-xs italic">
          Note: Existing laptops will be updated with new information.
        </p>
        <a 
          href="/sample-laptops.csv" 
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
