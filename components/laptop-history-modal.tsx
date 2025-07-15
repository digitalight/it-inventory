// components/laptop-history-modal.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Settings } from "lucide-react";
import { getLaptopHistory } from "@/app/laptops/history-actions";

interface StatusHistoryItem {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason?: string | null;
  changedBy?: string | null;
  changedAt: Date;
}

interface AssignmentHistoryItem {
  id: string;
  assignedAt: Date;
  unassignedAt?: Date | null;
  reason?: string | null;
  assignedBy?: string | null;
  staff: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

interface LaptopHistoryModalProps {
  laptopId: string;
  laptopName: string;
  isOpen?: boolean;
  onClose?: () => void;
  triggerButton?: ReactNode;
}

interface HistoryItem {
  type: 'status' | 'assignment';
  date: Date;
  description: string;
  reason?: string;
  changedBy?: string;
  staff?: {
    firstname: string;
    lastname: string;
    email: string;
  };
  fromStatus?: string;
  toStatus?: string;
}

export function LaptopHistoryModal({ 
  laptopId, 
  laptopName, 
  isOpen, 
  onClose, 
  triggerButton 
}: LaptopHistoryModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Use internal state if no external state provided
  const isModalOpen = isOpen !== undefined ? isOpen : internalOpen;
  const handleClose = onClose || (() => setInternalOpen(false));

  // Load history when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const loadHistory = async () => {
        setLoading(true);
        try {
          const result = await getLaptopHistory(laptopId);
          
          if (result.success && result.data) {
            const { statusHistory, assignmentHistory } = result.data;
            
            // Convert status history to HistoryItem format
            const statusItems: HistoryItem[] = statusHistory.map((item: StatusHistoryItem) => ({
              type: 'status',
              date: new Date(item.changedAt),
              description: `Status changed from ${item.fromStatus} to ${item.toStatus}`,
              reason: item.reason || undefined,
              changedBy: item.changedBy || undefined,
              fromStatus: item.fromStatus,
              toStatus: item.toStatus
            }));

            // Convert assignment history to HistoryItem format
            const assignmentItems: HistoryItem[] = assignmentHistory.map((item: AssignmentHistoryItem) => ({
              type: 'assignment',
              date: new Date(item.assignedAt),
              description: item.unassignedAt 
                ? `Assigned to ${item.staff.firstname} ${item.staff.lastname} (returned on ${new Date(item.unassignedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })})`
                : `Assigned to ${item.staff.firstname} ${item.staff.lastname} (currently assigned)`,
              reason: item.reason || undefined,
              changedBy: item.assignedBy || undefined,
              staff: item.staff
            }));

            // Combine and sort by date (newest first)
            const allHistory = [...statusItems, ...assignmentItems]
              .sort((a, b) => b.date.getTime() - a.date.getTime());

            setHistory(allHistory);
          } else {
            console.error('Failed to load history:', result.error);
            setHistory([]);
          }
        } catch (error) {
          console.error('Failed to load history:', error);
          setHistory([]);
        } finally {
          setLoading(false);
        }
      };

      loadHistory();
    }
  }, [isModalOpen, laptopId]);

  // If triggerButton is provided, use DialogTrigger pattern
  if (triggerButton) {
    return (
      <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Laptop History: {laptopName}</DialogTitle>
            <DialogDescription>
              Complete history of status changes and assignments for this laptop.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {loading ? (
              <div className="text-center py-8">Loading history...</div>
            ) : history.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((item, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4 pb-4 relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-2 w-4 h-4 rounded-full ${
                      item.type === 'status' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === 'status' ? (
                            <Settings className="h-4 w-4 text-blue-500" />
                          ) : (
                            <User className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-medium text-gray-900">{item.description}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1 ml-6">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">
                              {item.date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} at {item.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Badge variant={item.type === 'status' ? 'default' : 'secondary'}>
                              {item.type === 'status' ? 'Status Change' : 'Assignment'}
                            </Badge>
                          </div>
                          
                          {item.reason && (
                            <div><span className="font-medium">Reason:</span> {item.reason}</div>
                          )}
                          
                          {item.changedBy && (
                            <div><span className="font-medium">Changed by:</span> {item.changedBy}</div>
                          )}
                          
                          {item.staff && (
                            <div><span className="font-medium">Staff:</span> {item.staff.firstname} {item.staff.lastname} ({item.staff.email})</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No history available for this laptop.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Laptop History: {laptopName}</DialogTitle>
          <DialogDescription>
            Complete history of status changes and assignments for this laptop.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-8">Loading history...</div>
          ) : history.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="border-l-4 border-gray-200 pl-4 pb-4 relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-2 w-4 h-4 rounded-full ${
                    item.type === 'status' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'status' ? (
                          <Settings className="h-4 w-4 text-blue-500" />
                        ) : (
                          <User className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium text-gray-900">{item.description}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 ml-6">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            {item.date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} at {item.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <Badge variant={item.type === 'status' ? 'default' : 'secondary'}>
                            {item.type === 'status' ? 'Status Change' : 'Assignment'}
                          </Badge>
                        </div>
                        
                        {item.reason && (
                          <div><span className="font-medium">Reason:</span> {item.reason}</div>
                        )}
                        
                        {item.changedBy && (
                          <div><span className="font-medium">Changed by:</span> {item.changedBy}</div>
                        )}
                        
                        {item.staff && (
                          <div><span className="font-medium">Staff:</span> {item.staff.firstname} {item.staff.lastname} ({item.staff.email})</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No history available for this laptop.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
