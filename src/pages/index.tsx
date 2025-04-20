import * as React from "react";
import Typography from "@mui/material/Typography";
import { PageContainer } from "@toolpad/core";
import { Stack, Button, Skeleton } from "@mui/material";
import { Outlet, useNavigate } from "react-router";
import { fetchAllLists, List } from "../ListContext";
import ListTileView from "../components/ListTileView";
import { useSession } from "../SessionContext";
import { useLists } from "../ListsContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { lists, loading, error } = useLists();

  if (loading) {
    return (
      <PageContainer>
        <Stack spacing={2}>
          <Typography variant="h4">Your Lists</Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {[...Array(6)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                width={200}
                height={200}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
          <Typography variant="h4">Invited Lists</Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {[...Array(2)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                width={200}
                height={200}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
        </Stack>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Stack spacing={2}>
          <Typography variant="h4">Your Lists</Typography>
          <Typography color="error">{error}</Typography>
        </Stack>
      </PageContainer>
    );
  }

  const ownedLists = lists.filter((list) => list.owner === session?.user?.id!);
  const invitedLists = lists.filter((list) => list.owner != session?.user?.id!);

  return (
    <PageContainer>
      <Stack spacing={2}>
        {ownedLists.length > 0 ? (
          <ListTileView lists={ownedLists} titleText="Your Lists" />
        ) : (
          <Typography>No lists found.</Typography>
        )}
        {invitedLists.length > 0 ? (
          <ListTileView lists={invitedLists} titleText="Invited Lists" />
        ) : (
          <Typography>No lists found.</Typography>
        )}
      </Stack>
      <Outlet />
    </PageContainer>
  );
}
