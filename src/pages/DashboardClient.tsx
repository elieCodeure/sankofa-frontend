import { DashboardLayout } from "@/components/sankhofa/DashboardLayout";
import { Overview, Orders, Shipping, Profile } from "./client";

interface DashboardClientProps {
  view?: "overview" | "orders" | "shipping" | "profile";
}

export default function DashboardClient({ view = "overview" }: DashboardClientProps) {
  const renderView = () => {
    switch (view) {
      case "overview":
        return <Overview />;
      case "orders":
        return <Orders />;
      case "shipping":
        return <Shipping />;
      case "profile":
        return <Profile />;
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout>
      {renderView()}
    </DashboardLayout>
  );
}
