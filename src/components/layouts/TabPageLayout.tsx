import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Grid, { GridContentPanel } from "@/components/grid";

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
  decorativeImages?: {
    clipboard?: string;
    deco1?: string;
    deco2?: string;
  };
}

const TabPageLayout: React.FC<TabPageLayoutProps> = ({
  title,
  tabs,
  currentTab,
  onNext,
  onBack,
  children,
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
                currentTab === tab.id ? "font-semibold text-foreground text-xl" : "text-muted-foreground"
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
          <div className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="flex items-center justify-center rounded-full w-10 h-10 border border-input text-muted-foreground hover:bg-accent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={onNext}
              className="flex items-center justify-center space-x-1 rounded-full px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>Next</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
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