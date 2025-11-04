import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Typography variant="body1" paragraph>
        This page will show user profile information and settings, including:
      </Typography>
      <ul>
        <li>Personal information and preferences</li>
        <li>Account settings and security</li>
        <li>API keys and access tokens</li>
        <li>Usage statistics and activity</li>
        <li>Notification preferences</li>
      </ul>
      <Button onClick={() => navigate('/')} variant="outlined">
        Back to Home
      </Button>
    </Box>
  );
};

export default Profile;
