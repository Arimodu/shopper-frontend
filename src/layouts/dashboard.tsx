import * as React from "react";
import { Outlet, Navigate, useLocation } from "react-router";
import {
  Stack,
  Tooltip,
  IconButton,
  TextField,
  ToggleButton,
} from "@mui/material";
import { Save as SaveIcon, Edit as EditIcon } from "@mui/icons-material";
import ApiIcon from "../assets/ApiIcon";
import ApiOffIcon from "../assets/ApiOffIcon";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useApi } from "../ApiContext";

function ToolbarActionsAPI() {
  const [selected, setSelected] = React.useState(false); // Temporary for now, later will be replaced with API state hook

  return (
    <Stack direction="row">
      <ThemeSwitcher />
    </Stack>
  );
}

export default function Layout() {
  const { session } = useApi();
  const location = useLocation();

  if (!session) {
    // Add the `callbackUrl` search parameter
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;

    return <Navigate to={redirectTo} replace />;
  }

  return (
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
  );
}

/* Just leaving this here, will move this somewhere else at some point
<Tooltip title="API Connection" enterDelay={1000}>
        <div>
          <IconButton
            type="button"
            aria-label="search"
            sx={{
              display: { xs: "inline", md: "none" },
            }}
          >
            <EditIcon />
          </IconButton>
        </div>
      </Tooltip>
      <TextField
        label="API Address"
        variant="outlined"
        size="small"
        placeholder="api.shopper.arimodu.dev"
        slotProps={{
          input: {
            endAdornment: (
              <IconButton type="button" aria-label="save-changes" size="small">
                <SaveIcon />
              </IconButton>
            ),
            sx: { pr: 0.5 },
          },
        }}
        sx={{ display: { xs: "none", md: "inline-block" }, mr: 1 }}
      />
      <ToggleButton
        value="check"
        selected={selected}
        onChange={() => setSelected((prevSelected) => !prevSelected)}
        size="small"
      >
        {selected ? <ApiIcon /> : <ApiOffIcon />}
      </ToggleButton>
      */