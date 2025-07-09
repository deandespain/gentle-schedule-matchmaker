import { Link, useLocation } from "wouter";
import { Users, UserCheck, Calendar, Sparkles, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/caregivers", label: "Caregivers", icon: Users },
  { path: "/clients", label: "Clients", icon: UserCheck },
  { path: "/schedule", label: "Schedule", icon: Sparkles },
  { path: "/calendar", label: "Calendar", icon: Calendar },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Vertical Sidebar */}
        <div className="w-64 min-h-screen bg-card border-r border-border p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Care Schedule
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Matchmaker
            </p>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-12",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};