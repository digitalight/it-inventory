import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Users, AlertCircle, Edit, Plus } from 'lucide-react'
import Link from 'next/link'
import { EditChecklistTemplateModal } from '@/components/edit-checklist-template-modal'

interface ChecklistTemplateDetailsProps {
  params: Promise<{ id: string }>
}

async function getChecklistTemplate(id: string) {
  try {
    return await prisma.checklistTemplate.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' }
        },
        instances: {
          include: {
            staff: true,
            completions: {
              include: {
                item: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch checklist template:', error)
    return null
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    default:
      return <Badge variant="outline">Pending</Badge>
  }
}

function getProgressStats(instance: { completions: Array<{ isCompleted: boolean; item: { isRequired: boolean } }> }) {
  const totalItems = instance.completions.length
  const completedItems = instance.completions.filter((c: { isCompleted: boolean }) => c.isCompleted).length
  const requiredItems = instance.completions.filter((c: { item: { isRequired: boolean } }) => c.item.isRequired).length
  const completedRequiredItems = instance.completions.filter((c: { isCompleted: boolean; item: { isRequired: boolean } }) => c.isCompleted && c.item.isRequired).length
  
  return {
    totalItems,
    completedItems,
    requiredItems,
    completedRequiredItems,
    percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }
}

export default async function ChecklistTemplateDetailsPage({ params }: ChecklistTemplateDetailsProps) {
  const { id } = await params
  const template = await getChecklistTemplate(id)

  if (!template) {
    notFound()
  }

  const totalEstimatedTime = template.items.reduce((sum: number, item: { estimatedTime?: number }) => sum + (item.estimatedTime || 0), 0)
  const requiredItemsCount = template.items.filter((item: { isRequired: boolean }) => item.isRequired).length
  const categories = [...new Set(template.items.map((item: { category?: string }) => item.category).filter(Boolean))] as string[]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/checklists">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Checklists
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={template.type === "onboarding" ? "default" : "secondary"}>
                {template.type === "onboarding" ? "Onboarding" : "Offboarding"}
              </Badge>
              <Badge variant={template.isActive ? "default" : "outline"}>
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <EditChecklistTemplateModal template={template}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Template
          </Button>
        </EditChecklistTemplateModal>
      </div>

      {template.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">{template.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Statistics */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="font-medium">{template.items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Required Items</span>
                <span className="font-medium">{requiredItemsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Optional Items</span>
                <span className="font-medium">{template.items.length - requiredItemsCount}</span>
              </div>
              {totalEstimatedTime > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Time</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.round(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Categories</span>
                <span className="font-medium">{categories.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Instances</span>
                <span className="font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {template.instances.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category as string} variant="outline">
                      {category as string}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Checklist Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Checklist Items</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/checklists/${template.id}/items`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Items
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Items in this checklist template, ordered by sequence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {template.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No items in this checklist template</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href={`/checklists/${template.id}/items`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Items
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {template.items.map((item: { id: string; title: string; description?: string; isRequired: boolean; estimatedTime?: number; category?: string }, index: number) => (
                    <div key={item.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {item.title}
                              {item.isRequired && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {item.estimatedTime && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {item.estimatedTime}m
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Instances */}
      {template.instances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Instances</CardTitle>
            <CardDescription>
              Staff members who have been assigned this checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.instances.slice(0, 10).map((instance: { 
                id: string; 
                createdAt: Date; 
                completedAt?: Date;
                status: string;
                staff: { firstName: string; lastName: string; email: string }; 
                completions: Array<{ isCompleted: boolean; item: { isRequired: boolean } }> 
              }) => {
                const stats = getProgressStats(instance)
                
                return (
                  <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">
                          {instance.staff.firstName} {instance.staff.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {instance.staff.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(instance.status)}
                        <div className="text-sm text-muted-foreground">
                          {stats.completedItems}/{stats.totalItems} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Created {new Date(instance.createdAt).toLocaleDateString()}</div>
                      {instance.completedAt && (
                        <div>Completed {new Date(instance.completedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {template.instances.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All {template.instances.length} Instances
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
