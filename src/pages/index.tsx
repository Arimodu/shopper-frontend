import Typography from "@mui/material/Typography";
import { PageContainer } from "@toolpad/core";
import { Stack, Button, Skeleton, IconButton, Fab } from "@mui/material";
import { Outlet, useNavigate } from "react-router";
import ListTileView from "../components/ListTileView";
import { Add } from "@mui/icons-material";
import { useApi } from "../ApiContext";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, lists, addList, removeList, updateList, loading, error } = useApi();

  if (loading) {
    return (
      <PageContainer>
        <Stack spacing={2}>
          <Typography variant="h4">{t("dashboardPage.yourLists")}</Typography>
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
          <Typography variant="h4">{t("dashboardPage.invitedLists")}</Typography>
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
          <Typography variant="h4">{t("dashboardPage.yourLists")}</Typography>
          <Typography color="error">{error}</Typography>
        </Stack>
      </PageContainer>
    );
  }

  const ownedLists = lists.filter((list) => list.owner === session?.user?.id! && !list.archived);
  const invitedLists = lists.filter((list) => list.owner != session?.user?.id! && !list.archived); // No need to check if user is invited, if they are not the owner they must be invited, as the API will not return lists the user is not asociated with
  const archivedLists = lists.filter((list) => list.archived);

  return (
    <PageContainer>
      <Stack spacing={4}>
        {ownedLists.length > 0 ? (
          <ListTileView lists={ownedLists} titleText={t("dashboardPage.yourLists")}/>
        ) : (
          <Typography>{t("dashboardPage.noListsFound")}</Typography>
        )}
        {invitedLists.length > 0 ? (
          <ListTileView lists={invitedLists} titleText={t("dashboardPage.invitedLists")}/>
        ) : null}
        {archivedLists.length > 0 ? (
          <ListTileView lists={archivedLists} titleText={t("dashboardPage.archivedLists")} defaultCollapsed={true}/>
        ) : null}
      </Stack>
      <Outlet />
      <Fab 
      size="large" 
      color="primary"
      onClick={async () => {
        const newListId = await addList();
        navigate(`/list/${newListId}`);
      }}
      sx={{
        position: "absolute",
        right: "3%",
        bottom: "5%",
      }}>
        <Add />
      </Fab>
    </PageContainer>
  );
}
