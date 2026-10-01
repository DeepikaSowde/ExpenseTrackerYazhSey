import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings,
} from "lucide-react";

export const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "income",
    label: "Income",
    icon: ArrowDownToLine,
  },
  {
    id: "expense",
    label: "Expenses",
    icon: ArrowUpFromLine,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];