import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Grid, { GridContentPanel } from "@/components/grid";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Tab {
  id: string;
  label: string;
}

interface TabPageLayoutProps {
  title: string;
  tabs: Tab[];
  currentTab: string;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
  nextButtonText?: string;
  isNextLoading?: boolean;
  decorativeImages: {
    clipboard: string;
    deco1: string;
    deco2: string;
  };
}

const TabPageLayout: React.FC<TabPageLayoutProps> = ({
  title,
  tabs,
  currentTab,
  onNext,
  onBack,
  children,
  nextButtonText = "Next",
  isNextLoading = false,
  decorativeImages,
}) => {
  return (
    <Grid className="h-full grid items-center">
      {/* Left Section: Heading + Nav */}
      <div className="">
        <h1 className="text-5xl font-medium mb-6">{title}</h1>

        <nav className="space-y-4">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={`#${tab.id}`}
              className={cn(
                "block py-2 text-lg",
                currentTab === tab.id
                  ? "font-semibold text-foreground text-xl"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right Section: Form + Illustration */}
      <div className="relative col-span-2">
        <GridContentPanel>
          {/* Main Content */}
          {children}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext} disabled={isNextLoading}>
              {isNextLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {nextButtonText}
            </Button>
          </div>
        </GridContentPanel>

        {/* Decorative Images */}
        {decorativeImages?.clipboard && (
          <div className="absolute top-0 -right-20 transform pointer-events-none hidden lg:block">
            <img
              src={decorativeImages.clipboard}
              alt="Clipboard Check"
              className="w-36"
            />
          </div>
        )}

        {decorativeImages?.deco1 && (
          <div className="absolute bottom-0 -right-20 pointer-events-none hidden lg:block">
            <img
              src={decorativeImages.deco1}
              alt="decorative 1"
              className="w-36"
            />
          </div>
        )}

        {decorativeImages?.deco2 && (
          <div className="absolute bottom-0 -left-16 pointer-events-none hidden lg:block">
            <img
              src={decorativeImages.deco2}
              alt="decorative 2"
              className="w-36"
            />
          </div>
        )}
      </div>
      <div />
    </Grid>
  );
};

export default TabPageLayout;
