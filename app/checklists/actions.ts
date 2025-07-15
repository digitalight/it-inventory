'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Checklist Template Actions
export async function getChecklistTemplates() {
  try {
    return await prisma.checklistTemplate.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { instances: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Failed to fetch checklist templates:', error)
    return []
  }
}

export async function getActiveChecklistTemplates() {
  try {
    return await prisma.checklistTemplate.findMany({
      where: { isActive: true },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Failed to fetch active checklist templates:', error)
    return []
  }
}

export async function createChecklistTemplate(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string
    
    if (!name || !type) {
      return { error: 'Name and type are required' }
    }

    await prisma.checklistTemplate.create({
      data: {
        name,
        type,
        description: description || null
      }
    })

    revalidatePath('/checklists')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error creating checklist template:', error)
    const err = error as { code?: string }
    if (err.code === 'P2002') {
      return { error: 'A checklist template with this name already exists' }
    }
    return { error: 'Failed to create checklist template' }
  }
}

export async function updateChecklistTemplate(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string
    const isActive = formData.get('isActive') === 'true'
    
    if (!id || !name || !type) {
      return { error: 'ID, name and type are required' }
    }

    await prisma.checklistTemplate.update({
      where: { id },
      data: {
        name,
        type,
        description: description || null,
        isActive
      }
    })

    revalidatePath('/checklists')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating checklist template:', error)
    const err = error as { code?: string }
    if (err.code === 'P2002') {
      return { error: 'A checklist template with this name already exists' }
    }
    return { error: 'Failed to update checklist template' }
  }
}

export async function deleteChecklistTemplate(id: string) {
  try {
    // Check if template has instances
    const instanceCount = await prisma.checklistInstance.count({
      where: { templateId: id }
    })

    if (instanceCount > 0) {
      return { error: 'Cannot delete template with existing instances. Deactivate it instead.' }
    }

    await prisma.checklistTemplate.delete({
      where: { id }
    })

    revalidatePath('/checklists')
    return { success: true }
  } catch (error) {
    console.error('Error deleting checklist template:', error)
    return { error: 'Failed to delete checklist template' }
  }
}

// Checklist Item Actions
export async function addChecklistItem(formData: FormData) {
  try {
    const templateId = formData.get('templateId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const isRequired = formData.get('isRequired') === 'true'
    const estimatedTime = formData.get('estimatedTime') as string
    
    if (!templateId || !title) {
      return { error: 'Template ID and title are required' }
    }

    // Get the next order number
    const lastItem = await prisma.checklistItem.findFirst({
      where: { templateId },
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastItem?.order || 0) + 1

    await prisma.checklistItem.create({
      data: {
        templateId,
        title,
        description: description || null,
        category: category || null,
        isRequired,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        order: nextOrder
      }
    })

    revalidatePath('/checklists')
    return { success: true }
  } catch (error) {
    console.error('Error adding checklist item:', error)
    return { error: 'Failed to add checklist item' }
  }
}

export async function updateChecklistItem(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const isRequired = formData.get('isRequired') === 'true'
    const estimatedTime = formData.get('estimatedTime') as string
    
    if (!id || !title) {
      return { error: 'ID and title are required' }
    }

    await prisma.checklistItem.update({
      where: { id },
      data: {
        title,
        description: description || null,
        category: category || null,
        isRequired,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null
      }
    })

    revalidatePath('/checklists')
    return { success: true }
  } catch (error) {
    console.error('Error updating checklist item:', error)
    return { error: 'Failed to update checklist item' }
  }
}

export async function deleteChecklistItem(id: string) {
  try {
    await prisma.checklistItem.delete({
      where: { id }
    })

    revalidatePath('/checklists')
    return { success: true }
  } catch (error) {
    console.error('Error deleting checklist item:', error)
    return { error: 'Failed to delete checklist item' }
  }
}

export async function reorderChecklistItems(templateId: string, itemIds: string[]) {
  try {
    // Update the order for each item
    for (let i = 0; i < itemIds.length; i++) {
      await prisma.checklistItem.update({
        where: { id: itemIds[i] },
        data: { order: i + 1 }
      })
    }

    revalidatePath('/checklists')
    return { success: true }
  } catch (error) {
    console.error('Error reordering checklist items:', error)
    return { error: 'Failed to reorder checklist items' }
  }
}

// Checklist Instance Actions
export async function createChecklistInstance(staffId: string, templateId: string) {
  try {
    // Check if an instance already exists for this staff and template
    const existingInstance = await prisma.checklistInstance.findFirst({
      where: {
        staffId,
        templateId,
        status: { in: ['pending', 'in_progress'] }
      }
    })

    if (existingInstance) {
      return { error: 'An active checklist instance already exists for this staff member' }
    }

    // Get the template with items
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true }
    })

    if (!template) {
      return { error: 'Checklist template not found' }
    }

    // Create the instance
    const instance = await prisma.checklistInstance.create({
      data: {
        templateId,
        staffId,
        status: 'pending'
      }
    })

    // Create completion records for each item
    for (const item of template.items) {
      await prisma.checklistItemCompletion.create({
        data: {
          instanceId: instance.id,
          itemId: item.id,
          isCompleted: false
        }
      })
    }

    revalidatePath('/staff')
    revalidatePath('/checklists')
    return { success: true, instanceId: instance.id }
  } catch (error) {
    console.error('Error creating checklist instance:', error)
    return { error: 'Failed to create checklist instance' }
  }
}

export async function getStaffChecklistInstances(staffId: string) {
  try {
    return await prisma.checklistInstance.findMany({
      where: { staffId },
      include: {
        template: true,
        completions: {
          include: {
            item: true
          },
          orderBy: {
            item: { order: 'asc' }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Failed to fetch staff checklist instances:', error)
    return []
  }
}

export async function updateChecklistItemCompletion(completionId: string, isCompleted: boolean, notes?: string, completedBy?: string) {
  try {
    const completion = await prisma.checklistItemCompletion.update({
      where: { id: completionId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        completedBy: isCompleted ? completedBy : null,
        notes: notes || null
      }
    })

    // Check if all required items are completed and update instance status
    const instance = await prisma.checklistInstance.findUnique({
      where: { id: completion.instanceId },
      include: {
        completions: {
          include: { item: true }
        }
      }
    })

    if (instance) {
      const requiredItems = instance.completions.filter(c => c.item.isRequired)
      const completedRequiredItems = requiredItems.filter(c => c.isCompleted)
      
      let newStatus = instance.status
      
      if (completedRequiredItems.length === requiredItems.length) {
        newStatus = 'completed'
      } else if (instance.completions.some(c => c.isCompleted)) {
        newStatus = 'in_progress'
      }

      if (newStatus !== instance.status) {
        await prisma.checklistInstance.update({
          where: { id: instance.id },
          data: {
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date() : null,
            startedAt: newStatus === 'in_progress' && !instance.startedAt ? new Date() : instance.startedAt
          }
        })
      }
    }

    revalidatePath('/staff')
    revalidatePath('/checklists')
    return { success: true }
  } catch (error) {
    console.error('Error updating checklist item completion:', error)
    return { error: 'Failed to update checklist item completion' }
  }
}

export async function getChecklistInstance(instanceId: string) {
  try {
    return await prisma.checklistInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: true,
        staff: true,
        completions: {
          include: {
            item: true
          },
          orderBy: {
            item: { order: 'asc' }
          }
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch checklist instance:', error)
    return null
  }
}
