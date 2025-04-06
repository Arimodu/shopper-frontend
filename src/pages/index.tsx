import * as React from "react";
import Typography from "@mui/material/Typography";
import { PageContainer } from "@toolpad/core";
import { Stack, Button } from "@mui/material";
import { Outlet, useNavigate } from 'react-router';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Stack spacing={2} maxWidth={400}>
      <Typography>Main Logged-In Page</Typography>
      <Typography>Placeholder for list overview...</Typography>
      <Button variant='outlined' onClick={ () => navigate("list/f34e3fa8-e0d9-4637-ab6d-b86b3a23c515")}>Go to owned list mock</Button>
      <Button variant='outlined' onClick={ () => navigate("list/cd22c016-8b7e-405f-8201-f47718fac216")}>Go to invited list mock</Button>
      </Stack>
      <Outlet />
    </PageContainer>
  );
}
