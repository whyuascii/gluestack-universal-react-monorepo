import React from "react";
import { Avatar, AvatarImage, AvatarFallbackText } from "../avatar";
import { Heading } from "../heading";
import { HStack } from "../hstack";

interface AppHeaderProps {
  title: string;
  user?: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, user }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <HStack className="justify-between items-center p-4 bg-white border-b border-outline-200">
      <Heading size="xl" className="text-typography-900">
        {title}
      </Heading>
      {user && (
        <Avatar size="md">
          {user.image ? (
            <AvatarImage source={{ uri: user.image }} alt={user.name} />
          ) : (
            <AvatarFallbackText>{getInitials(user.name)}</AvatarFallbackText>
          )}
        </Avatar>
      )}
    </HStack>
  );
};
