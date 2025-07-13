// components/wipe-laptop-button.tsx
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WipeLaptopModal } from "@/components/wipe-laptop-modal";
import { HardDrive } from "lucide-react";

interface WipeLaptopButtonProps {
  laptopId: string;
  laptopName: string;
  status: string;
}

export function WipeLaptopButton({ laptopId, laptopName, status }: WipeLaptopButtonProps) {
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show button for Returned laptops
  if (!isMounted || status !== 'Returned') {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setWipeModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <HardDrive className="mr-2 h-4 w-4" />
        Wipe Laptop
      </Button>

      <WipeLaptopModal
        isOpen={wipeModalOpen}
        onClose={() => setWipeModalOpen(false)}
        laptopId={laptopId}
        laptopName={laptopName}
      />
    </>
  );
}
