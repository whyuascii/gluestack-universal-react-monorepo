import React from "react";
import { Box } from "../box";
import { Card } from "../card";

interface AuthCardProps {
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children }) => {
  return (
    <Box className="w-full max-w-md mx-auto p-4">
      <Card className="p-6 bg-white rounded-2xl shadow-lg">{children}</Card>
    </Box>
  );
};
