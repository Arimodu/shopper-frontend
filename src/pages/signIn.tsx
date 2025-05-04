"use client";
import * as React from "react";
import { AuthProvider, SignInPage } from "@toolpad/core/SignInPage";
import type { Session } from "@toolpad/core/AppProvider";
import { useNavigate } from "react-router";
import { Alert, FormControlLabel, Stack, Switch } from "@mui/material";
import { useApi } from "../ApiContext";

function Title() {
  return <h2 style={{ marginBottom: 8 }}>Login</h2>;
}

export default function SignIn() {
  const { setSession } = useApi();
  const navigate = useNavigate();
  const [apiEnabled, setApiState] = React.useState(true);

  // Lets just move this here ig...
  const handleSignIn = async (provider: AuthProvider, formData: FormData, callbackUrl?: string) => {
    if (!apiEnabled) {
      try {
        const session = await fakeAsyncGetSession(formData);
        if (session) {
          setSession(session);
          navigate(callbackUrl || "/", { replace: true });
          return {};
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "An error occurred",
        };
      }
      return {};
    }

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (response.ok) {
        const user = await response.json();
        const session: Session = {
          user: {
            id: user._id,
            name: user.name,
            email: formData.get("email") as string,
            image: "https://arimodu.dev/pfp.webp", // Placeholder, as API doesn't return images yet...
          },
        };
        setSession(session);
        navigate(callbackUrl || "/", { replace: true });
        return {};
      } else if (response.status === 404) {
        return { error: "User not found" };
      } else if (response.status === 401) {
        return { error: "Invalid password" };
      } else {
        throw new Error("Unexpected error occurred");
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to connect to the server",
      };
    }
  };
  
  const fakeAsyncGetSession = async (formData: any): Promise<Session> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (formData.get("password") === "password") {
          resolve({
            user: {
              id: "5629aaef-1a1e-4430-be02-9104cc7e5544",
              name: "Arimodu Demo",
              email: formData.get("email") || "demo@arimodu.dev",
              image: "https://arimodu.dev/pfp.webp",
            },
          });
        }
        reject(new Error("Incorrect credentials."));
      }, 1000);
    });
  };

  const subtitle = () => {
    return (
      <Stack>
        <FormControlLabel
          control={<Switch value={apiEnabled} onChange={(e, checked) => setApiState(checked)} />}
          label="Enable API"
          labelPlacement="start"
        />
        {!apiEnabled && (
          <div>
            <Alert sx={{ mb: 2, px: 1, py: 0.25 }} severity="warning">
              Demo email is "demo@arimodu.dev"
            </Alert>
            <Alert sx={{ mb: 2, px: 1, py: 0.25 }} severity="warning">
              Demo password is "password"
            </Alert>
          </div>
        )}
      </Stack>
    );
  }

  return (
    <SignInPage
      providers={[{ id: "credentials", name: "Credentials" }]}
      signIn={handleSignIn}
      slots={{
        title: Title,
        subtitle: subtitle,
      }}
    />
  );
}