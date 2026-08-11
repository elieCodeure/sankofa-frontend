import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Auth from "./pages/Auth.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ActivateAccount from "./pages/ActivateAccount.tsx";
import DashboardClient from "./pages/DashboardClient.tsx";
import DashboardSeller from "./pages/DashboardSeller.tsx";
import DashboardLogistics from "./pages/DashboardLogistics.tsx";
import NotFound from "./pages/NotFound.tsx";
import Shipping from "./pages/Shipping.tsx";
import { RequireAuth } from "./components/sankhofa/RequireAuth";

import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/activate/:uid/:token" element={<ActivateAccount />} />

            <Route path="/client/dashboard" element={<RequireAuth allow={["CLIENT"]}><DashboardClient /></RequireAuth>} />
            <Route path="/client/dashboard/orders" element={<RequireAuth allow={["CLIENT"]}><DashboardClient view="orders" /></RequireAuth>} />
            <Route path="/client/dashboard/shipping" element={<RequireAuth allow={["CLIENT"]}><DashboardClient view="shipping" /></RequireAuth>} />
            <Route path="/client/dashboard/profile" element={<RequireAuth allow={["CLIENT"]}><DashboardClient view="profile" /></RequireAuth>} />

            <Route path="/seller/dashboard" element={<RequireAuth allow={["SELLER"]}><DashboardSeller /></RequireAuth>} />
            <Route path="/seller/dashboard/stock" element={<RequireAuth allow={["SELLER"]}><DashboardSeller view="stock" /></RequireAuth>} />
            <Route path="/seller/dashboard/orders" element={<RequireAuth allow={["SELLER"]}><DashboardSeller view="orders" /></RequireAuth>} />
            <Route path="/seller/dashboard/shipping" element={<RequireAuth allow={["SELLER"]}><DashboardSeller view="shipping" /></RequireAuth>} />
            <Route path="/seller/dashboard/collab" element={<RequireAuth allow={["SELLER"]}><DashboardSeller view="collab" /></RequireAuth>} />
            <Route path="/seller/dashboard/profile" element={<RequireAuth allow={["SELLER"]}><DashboardSeller view="profile" /></RequireAuth>} />
            <Route path="/seller/dashboard/product/:id" element={<RequireAuth allow={["SELLER"]}><DashboardSeller view="productDetail" /></RequireAuth>} />

            <Route path="/logistics/dashboard" element={<RequireAuth allow={["TRANSPORTER"]}><DashboardLogistics /></RequireAuth>} />
            <Route path="/logistics/dashboard/routes" element={<RequireAuth allow={["TRANSPORTER"]}><DashboardLogistics view="routes" /></RequireAuth>} />
            <Route path="/logistics/dashboard/shipments" element={<RequireAuth allow={["TRANSPORTER"]}><DashboardLogistics view="shipments" /></RequireAuth>} />
            <Route path="/logistics/dashboard/profile" element={<RequireAuth allow={["TRANSPORTER"]}><DashboardLogistics view="profile" /></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
