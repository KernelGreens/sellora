"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open dashboard navigation"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[86vw] max-w-xs border-r bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle asChild>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              KaraCarta
            </Link>
          </SheetTitle>
          <SheetDescription>
            Move between dashboard areas on mobile.
          </SheetDescription>
        </SheetHeader>

        <div className="px-3 py-4">
          <DashboardNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
