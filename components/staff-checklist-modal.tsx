"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Users, Plus, AlertCircle } from "lucide-react"
import { 
  getStaffChecklistInstances, 
  getActiveChecklistTemplates, 
  createChecklistInstance,
  updateChecklistItemCompletion 
} from "@/app/checklists/actions"
import { toast } from "sonner"

interface StaffChecklistModalProps {
  isOpen: boolean
  onClose: () => void
  staffId: string
  staffName: string
  staffType: 'joining' | 'leaving' | 'current'
}

interface ChecklistInstance {
  id: string
  status: string
  startedAt: Date | null
  completedAt: Date | null
  notes: string | null
  template: {
    id: string
    name: string
    type: string
    description: string | null
  }
  completions: Array<{
    id: string
    isCompleted: boolean
    completedBy: string | null
    completedAt: Date | null
    notes: string | null
    item: {
      id: string
      title: string
      description: string | null
      category: string | null
      isRequired: boolean
      estimatedTime: number | null
      order: number
    }
  }>
}

interface ChecklistTemplate {
  id: string
  name: string
  type: string
  description: string | null
  items: Array<{
    id: string
    title: string
    isRequired: boolean
  }>
}

export function StaffChecklistModal({ isOpen, onClose, staffId, staffName, staffType }: StaffChecklistModalProps) {
  const [instances, setInstances] = useState<ChecklistInstance[]>([])
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, staffId])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [instancesData, templatesData] = await Promise.all([
        getStaffChecklistInstances(staffId),
        getActiveChecklistTemplates()
      ])
      setInstances(instancesData)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Failed to load checklist data:', error)
      toast.error("Failed to load checklist data")
    } finally {
      setIsLoading(false)
    }
  }, [staffId])

  const handleCreateInstance = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a checklist template")
      return
    }

    setIsCreating(true)
    try {
      const result = await createChecklistInstance(staffId, selectedTemplateId)
      
      if (result?.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success('Checklist created successfully')
        setSelectedTemplateId("")
        loadData() // Reload data
      }
    } catch (error) {
      console.error('Failed to create checklist instance:', error)
      toast.error("Failed to create checklist instance")
    } finally {
      setIsCreating(false)
    }
  }

  const handleItemCompletion = async (completionId: string, isCompleted: boolean, notes?: string) => {
    try {
      const result = await updateChecklistItemCompletion(completionId, isCompleted, notes, 'User')
      
      if (result?.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success(isCompleted ? 'Item marked as completed' : 'Item marked as incomplete')
        loadData() // Reload data
      }
    } catch (error) {
      console.error('Failed to update item completion:', error)
      toast.error("Failed to update item completion")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getProgressStats = (instance: ChecklistInstance) => {
    const totalItems = instance.completions.length
    const completedItems = instance.completions.filter(c => c.isCompleted).length
    const requiredItems = instance.completions.filter(c => c.item.isRequired).length
    const completedRequiredItems = instance.completions.filter(c => c.isCompleted && c.item.isRequired).length
    
    return {
      totalItems,
      completedItems,
      requiredItems,
      completedRequiredItems,
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    }
  }

  // Filter templates based on staff type
  const relevantTemplates = templates.filter(template => {
    if (staffType === 'joining') return template.type === 'onboarding'
    if (staffType === 'leaving') return template.type === 'offboarding'
    return true // For current staff, show both types
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Checklists for {staffName}
          </DialogTitle>
          <DialogDescription>
            Manage onboarding and offboarding checklists for this staff member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Checklist Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="template">Select Template</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a checklist template" />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {template.type} • {template.items.length} items
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateInstance}
                  disabled={!selectedTemplateId || isCreating}
                  className="mt-6"
                >
                  {isCreating ? 'Creating...' : 'Create Checklist'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Checklists */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Checklists</h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading checklists...</div>
            ) : instances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No checklists found for this staff member</p>
              </div>
            ) : (
              instances.map((instance) => {
                const stats = getProgressStats(instance)
                
                return (
                  <Card key={instance.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{instance.template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(instance.status)}
                            <Badge variant="outline">
                              {instance.template.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {stats.completedItems}/{stats.totalItems} completed ({stats.percentage}%)
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {stats.completedRequiredItems}/{stats.requiredItems} required
                          </div>
                        </div>
                      </div>
                      {instance.template.description && (
                        <p className="text-sm text-muted-foreground">
                          {instance.template.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {instance.completions.map((completion) => (
                          <div key={completion.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Checkbox
                              checked={completion.isCompleted}
                              onCheckedChange={(checked) => 
                                handleItemCompletion(completion.id, checked as boolean)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {completion.item.title}
                                    {completion.item.isRequired && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                    {completion.item.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {completion.item.category}
                                      </Badge>
                                    )}
                                  </div>
                                  {completion.item.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {completion.item.description}
                                    </p>
                                  )}
                                </div>
                                {completion.item.estimatedTime && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {completion.item.estimatedTime}m
                                  </div>
                                )}
                              </div>
                              
                              {completion.isCompleted && (
                                <div className="text-xs text-muted-foreground">
                                  Completed {completion.completedAt && new Date(completion.completedAt).toLocaleDateString()}
                                  {completion.completedBy && ` by ${completion.completedBy}`}
                                </div>
                              )}
                              
                              {completion.notes && (
                                <div className="text-sm bg-gray-50 p-2 rounded">
                                  <strong>Notes:</strong> {completion.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
