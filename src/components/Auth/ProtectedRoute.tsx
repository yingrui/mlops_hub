import React from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        gap={3}
        p={3}
      >
        <Typography variant="h4" component="h1" textAlign="center">
          Authentication Required
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          maxWidth="md"
        >
          You need to be logged in to access this page. Please sign in with your
          account to continue.
        </Typography>
        <Button variant="contained" size="large" onClick={login} sx={{ mt: 2 }}>
          Sign In
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
