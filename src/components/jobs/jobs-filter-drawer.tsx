"use client";

import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function JobsFilterDrawer({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[92vw] max-w-sm overflow-y-auto border-slate-200 bg-white">
        <SheetHeader className="border-b border-slate-100">
          <SheetTitle>Filter jobs</SheetTitle>
          <SheetDescription>Refine public job listings by role, salary, work mode, and trust signals.</SheetDescription>
        </SheetHeader>
        <div className="p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
