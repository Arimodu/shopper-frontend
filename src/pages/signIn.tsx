"use client";
import * as React from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import type { Session } from "@toolpad/core/AppProvider";
import { useNavigate } from "react-router";
import { useSession } from "../SessionContext";
import { Alert, Stack } from "@mui/material";

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

function Title() {
  return <h2 style={{ marginBottom: 8 }}>Login</h2>;
}

function Subtitle() {
  return (
    <Stack>
      <Alert sx={{ mb: 2, px: 1, py: 0.25 }} severity="warning">
        Demo email is "demo@arimodu.dev"
      </Alert>
      <Alert sx={{ mb: 2, px: 1, py: 0.25 }} severity="warning">
        Demo password is "password"
      </Alert>
    </Stack>
  );
}

export default function SignIn() {
  const { setSession } = useSession();
  const navigate = useNavigate();

  const session = 
  { user: {
    id: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    name: "Arimodu Demo",
    email: "demo@arimodu.dev",
    image: "https://arimodu.dev/pfp.webp",
  }};
  setSession(session);
  navigate("/", { replace: true });
  return;
  return (
    <SignInPage
      providers={[{ id: "credentials", name: "Credentials" }]}
      signIn={async (provider, formData, callbackUrl) => {
        // Demo session
        try {
          console.log(JSON.stringify(formData));
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
      }}
      slots={{
        title: Title,
        subtitle: Subtitle,
      }}
    />
  );
}
