import { getChecklistTemplates } from './actions'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateChecklistTemplateModal } from '@/components/create-checklist-template-modal'

export default async function ChecklistsPage() {
  const templates = await getChecklistTemplates()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">Checklist Management</h1>
          <p className="text-gray-600 mt-2">Manage onboarding and offboarding checklists</p>
        </div>
        <CreateChecklistTemplateModal>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </CreateChecklistTemplateModal>
      </div>
      
      <DataTable columns={columns} data={templates} />
    </div>
  )
}
