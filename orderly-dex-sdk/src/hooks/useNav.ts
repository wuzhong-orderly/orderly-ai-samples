import { useLocation, useNavigate } from "react-router";

/**
 * Navigation adapter hook for Orderly DEX routing
 * Provides navigation context for page transitions and URL routing
 */
export const useNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    navigate,
    currentPath: location.pathname,
    goTo: (path: string) => navigate(path),
    goBack: () => navigate(-1),
  };
};
