import { useState } from 'react';
import type { ReactNode } from 'react';
import Login, { getAuthToken, setAuthToken } from '../pages/Login';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => getAuthToken() !== null
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <>{children}</>;
};

export { setAuthToken };
export default ProtectedRoute;
