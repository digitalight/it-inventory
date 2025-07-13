// components/part-history-modal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface PartHistoryEntry {
  id: string;
  partId: string;
  changeType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  changedBy?: string;
  notes?: string;
  changedAt: Date;
}

interface PartHistoryModalProps {
  partId: string;
  partName: string;
  triggerButton?: React.ReactNode;
}

export function PartHistoryModal({ 
  partId, 
  partName,
  triggerButton 
}: PartHistoryModalProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<PartHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/parts/${partId}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch part history:', error);
    } finally {
      setLoading(false);
    }
  }, [partId]);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, fetchHistory]);

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <History className="mr-2 h-4 w-4" />
      History
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Stock History: {partName}</DialogTitle>
          <DialogDescription>
            Complete history of stock changes for this part
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                Loading history...
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No stock history found for this part
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {entry.changeType === 'IN' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <Badge 
                        variant={entry.changeType === 'IN' ? 'default' : 'destructive'}
                        className="font-mono"
                      >
                        {entry.changeType === 'IN' ? '+' : '-'}{entry.quantity}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {entry.previousStock} → {entry.newStock}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Reason:</span> {entry.reason || 'No reason provided'}
                    </div>
                    <div>
                      <span className="font-medium">Changed by:</span> {entry.changedBy}
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes:</span> {entry.notes}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    {format(new Date(entry.changedAt), 'PPP p')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
