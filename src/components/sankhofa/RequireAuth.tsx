import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/api";

type Role = "CLIENT" | "SELLER" | "TRANSPORTER";

/**
 * Protège une route : redirige vers /auth si personne n'est connecté,
 * et redirige vers le bon tableau de bord si le rôle connecté ne
 * correspond pas à l'espace demandé (ex: un CLIENT qui tente d'ouvrir
 * /seller/dashboard est renvoyé vers /client/dashboard).
 */
export function RequireAuth({ allow, children }: { allow: Role[]; children: JSX.Element }) {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (!allow.includes(user.role)) {
    const home =
      user.role === "SELLER" ? "/seller/dashboard" : user.role === "TRANSPORTER" ? "/logistics/dashboard" : "/client/dashboard";
    return <Navigate to={home} replace />;
  }

  return children;
}
