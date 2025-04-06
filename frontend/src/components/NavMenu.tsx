import * as React from "react";

import { cn } from "../lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Advanced Demand Forecasting & Stock Management",
    href: "/docs/advanced-demand-forecasting",
    description:
      "Implement AI-powered surplus prediction, category-based forecasting, and expiration-based prioritization.",
  },
  {
    title: "Supply Chain Integration",
    href: "/docs/supply-chain-integration",
    description:
      "Utilize IoT & RFID integration, automated expiry alerts, and real-time inventory syncing.",
  },
  {
    title: "Optimized Bulk Donations with Smart Categorization",
    href: "/docs/optimized-bulk-donations",
    description:
      "Enable pre-sorted donations, custom donation categories, and AI-powered image recognition.",
  },
  {
    title: "Improved Coordination Between Grocery Stores and Food Banks",
    href: "/docs/improved-coordination",
    description:
      "Implement real-time tracking, instant notifications, and blockchain for transparency.",
  },
  {
    title: "User-Centric Platform Enhancements for Grocery Stores",
    href: "/docs/user-centric-enhancements",
    description:
      "Provide custom dashboards, mobile app features, and instant status updates.",
  },
  {
    title: "Enhanced Food Bank Support & Collaboration",
    href: "/docs/enhanced-food-bank-support",
    description:
      "Improve inventory management, meal planning, community collaboration, and volunteer coordination.",
  },
  {
    title: "AI-Powered Sustainability & Waste Reduction",
    href: "/docs/ai-powered-sustainability",
    description:
      "Implement smart expiry predictions, temperature & humidity monitoring, and sustainability reporting.",
  },
];

export function DropDownNavbar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-green-400/75 p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-left">
                      FreshBay
                    </div>
                    <p className="text-sm leading-tight text-neutral-600 text-left">
                      Optimizing surplus food donation for grocery stores and food banks.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs/introduction" title="Introduction">
                Learn about FreshBay and its mission to reduce food waste.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install and set up FreshBay for your store.
              </ListItem>
              <ListItem href="/docs/features" title="Features">
                Explore the features and functionalities of FreshBay.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 text-left leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-left text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
