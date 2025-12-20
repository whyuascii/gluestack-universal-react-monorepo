import type {
  TAuthenticationResponse,
  TSignInRequest,
  TSignUpRequest,
} from "@app/service-contracts";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: async (credentials: TSignInRequest): Promise<TAuthenticationResponse> => {
      setLoading();
      const response = await fetch(`${API_URL}/v1/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message || "Login failed");
      }

      return response.json() as Promise<TAuthenticationResponse>;
    },
    onSuccess: (data) => {
      setAuth(data);
    },
  });
};

export const useSignup = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: async (data: TSignUpRequest): Promise<TAuthenticationResponse> => {
      setLoading();
      const response = await fetch(`${API_URL}/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message || "Signup failed");
      }

      return response.json() as Promise<TAuthenticationResponse>;
    },
    onSuccess: (data) => {
      setAuth(data);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const session = useAuthStore((state) => state.session);

  return useMutation({
    mutationFn: async () => {
      if (session?.token) {
        await fetch(`${API_URL}/v1/auth/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        });
      }
    },
    onSettled: () => {
      logout();
    },
  });
};
