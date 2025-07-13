// app/laptops/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LaptopManager } from '@/lib/laptop-management';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WipeLaptopButton } from '@/components/wipe-laptop-button';
import { CompleteRepairButton } from '@/components/complete-repair-button';
import { ArrowLeft, Calendar, User, Settings, Laptop } from 'lucide-react';
import Link from 'next/link';

// Type definitions for history items
interface StatusHistoryItem {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason?: string | null;
  changedBy?: string | null;
  changedAt: Date;
  notes?: string | null;
}

interface AssignmentHistoryItem {
  id: string;
  assignedAt: Date;
  unassignedAt?: Date | null;
  reason?: string | null;
  assignedBy?: string | null;
  notes?: string | null;
  staff: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

interface LaptopDetailsPageProps {
  params: {
    id: string;
  };
}

async function getLaptopDetails(id: string) {
  const laptop = await prisma.laptop.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          department: true,
        }
      }
    }
  });

  if (!laptop) {
    return null;
  }

  // Get laptop history
  const history = await LaptopManager.getLaptopHistory(id);

  return { laptop, history };
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'Available':
      return 'default';
    case 'Assigned':
      return 'secondary';
    case 'In Repair':
      return 'destructive';
    case 'Retired':
      return 'outline';
    case 'Returned':
      return 'secondary';
    default:
      return 'default';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Available':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Assigned':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'In Repair':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Retired':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'Returned':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export default async function LaptopDetailsPage({ params }: LaptopDetailsPageProps) {
  const { id } = await params;
  const data = await getLaptopDetails(id);

  if (!data) {
    notFound();
  }

  const { laptop, history } = data;

  // Combine and sort history items
  const allHistoryItems = [
    ...history.statusHistory.map((item: StatusHistoryItem) => ({
      type: 'status' as const,
      date: new Date(item.changedAt),
      title: `Status changed from ${item.fromStatus} to ${item.toStatus}`,
      description: item.reason || 'No reason provided',
      changedBy: item.changedBy,
      notes: item.notes,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
    })),
    ...history.assignmentHistory.map((item: AssignmentHistoryItem) => ({
      type: 'assignment' as const,
      date: new Date(item.assignedAt),
      title: item.unassignedAt 
        ? `Unassigned from ${item.staff.firstname} ${item.staff.lastname}`
        : `Assigned to ${item.staff.firstname} ${item.staff.lastname}`,
      description: item.reason || 'No reason provided',
      changedBy: item.assignedBy,
      notes: item.notes,
      staff: item.staff,
      unassignedAt: item.unassignedAt,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/laptops">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Laptops
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {laptop.make} {laptop.model}
            </h1>
            <p className="text-gray-600">Serial Number: {laptop.serialNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CompleteRepairButton 
            laptopId={laptop.id}
            laptopName={`${laptop.make} ${laptop.model}`}
            status={laptop.status}
            hasAssignment={!!laptop.assignedToId}
          />
          <WipeLaptopButton 
            laptopId={laptop.id}
            laptopName={`${laptop.make} ${laptop.model}`}
            status={laptop.status}
          />
          <Badge variant={getStatusBadgeVariant(laptop.status)} className="text-lg px-4 py-2">
            {laptop.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Laptop Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                Laptop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Make</label>
                  <p className="text-sm font-semibold">{laptop.make}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <p className="text-sm font-semibold">{laptop.model}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Serial Number</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {laptop.serialNumber}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Current Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(laptop.status)}`}>
                    {laptop.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{new Date(laptop.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{new Date(laptop.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Current Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {laptop.assignedTo ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <p className="text-sm font-semibold">
                      {laptop.assignedTo.firstname} {laptop.assignedTo.lastname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{laptop.assignedTo.email}</p>
                  </div>
                  {laptop.assignedTo.department && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <div className="mt-1">
                        <Badge variant="outline">{laptop.assignedTo.department}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No current assignment</p>
                  <p className="text-xs">This laptop is not assigned to anyone</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Laptop History
              </CardTitle>
              <CardDescription>
                Complete timeline of status changes and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allHistoryItems.length > 0 ? (
                <div className="space-y-6">
                  {allHistoryItems.map((item, index) => (
                    <div key={index} className="relative">
                      {/* Timeline line */}
                      {index < allHistoryItems.length - 1 && (
                        <div className="absolute left-4 top-10 w-px h-16 bg-gray-200" />
                      )}
                      
                      <div className="flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.type === 'status' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {item.type === 'status' ? (
                            <Settings className="h-4 w-4 text-white" />
                          ) : (
                            <User className="h-4 w-4 text-white" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {item.title}
                            </h4>
                            <Badge variant={item.type === 'status' ? 'default' : 'secondary'}>
                              {item.type === 'status' ? 'Status Change' : 'Assignment'}
                            </Badge>
                          </div>
                          
                          <p className="mt-1 text-sm text-gray-600">
                            {item.description}
                          </p>

                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString()}
                            </span>
                            {item.changedBy && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.changedBy}
                              </span>
                            )}
                          </div>

                          {item.type === 'assignment' && item.staff && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <span className="font-medium">Staff: </span>
                              {item.staff.firstname} {item.staff.lastname} ({item.staff.email})
                              {item.unassignedAt && (
                                <span className="block mt-1">
                                  <span className="font-medium">Returned: </span>
                                  {new Date(item.unassignedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}

                          {item.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <span className="font-medium">Notes: </span>
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No history available</p>
                  <p className="text-xs">This laptop has no recorded history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
