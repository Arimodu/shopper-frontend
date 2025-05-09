import { ApiProvider, useApi } from "./ApiContext";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { CssBaseline, Box } from "@mui/material";
import enTranslation from "./localization/en.json";
import esTranslation from "./localization/es.json";
import csTranslation from "./localization/cs.json";
import deTranslation from "./localization/de.json";
import { Outlet, Navigate, useLocation } from "react-router";
import { MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useState } from "react";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
    cs: { translation: csTranslation },
    de: { translation: deTranslation },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

function ToolbarActionsAPI() {
  const [language, setLanguage] = useState("en");
  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", height: 70, left: 10 }}
    >
      <Select value={language} onChange={handleLanguageChange} sx={{ mb: 2 }}>
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="cs">Čeština</MenuItem>
        <MenuItem value="de">Deutsch</MenuItem>
      </Select>
      <ThemeSwitcher />
    </Stack>
  );
}

const BRANDING = {
  title: "Shopper Web",
};

export default function App() {
  const { session, signOut } = useApi();
  const location = useLocation();

  const signIn = () => {
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace />;
  };

  if (!session && !location.pathname.includes("sign-in")) {
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <CssBaseline />

      <Box sx={{ p: 0 }}>
        <ReactRouterAppProvider
          branding={BRANDING}
          session={session}
          authentication={{ signIn, signOut }}
        >
          {!session ? (
            <Outlet />
          ) : (
            <DashboardLayout
              slots={{
                toolbarActions: ToolbarActionsAPI,
              }}
              hideNavigation
              disableCollapsibleSidebar
            >
              <PageContainer>
                <Outlet />
              </PageContainer>
            </DashboardLayout>
          )}
        </ReactRouterAppProvider>
      </Box>
    </I18nextProvider>
  );
}
