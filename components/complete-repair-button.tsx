// components/complete-repair-button.tsx
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CompleteRepairModal } from "@/components/complete-repair-modal";
import { Wrench } from "lucide-react";

interface CompleteRepairButtonProps {
  laptopId: string;
  laptopName: string;
  status: string;
  hasAssignment: boolean;
}

export function CompleteRepairButton({ 
  laptopId, 
  laptopName, 
  status, 
  hasAssignment 
}: CompleteRepairButtonProps) {
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show button for In Repair laptops
  if (!isMounted || status !== 'In Repair') {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setRepairModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Wrench className="mr-2 h-4 w-4" />
        Complete Repair
      </Button>

      <CompleteRepairModal
        isOpen={repairModalOpen}
        onClose={() => setRepairModalOpen(false)}
        laptopId={laptopId}
        laptopName={laptopName}
        hasAssignment={hasAssignment}
      />
    </>
  );
}
