import {
  Modal,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  useMediaQuery,
  Menu,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CompletedDropdown from "../components/CompletedDropdown";
import ItemListView from "../components/ItemListView";
import { useNavigate, useParams } from "react-router";
import {
  Delete,
  Edit,
  Logout,
  PersonAdd,
  Clear,
  ArrowBack,
  MoreVert,
} from "@mui/icons-material";
import { red } from "@mui/material/colors";
import { useApi } from "../ApiContext";

export default function ListDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { listId } = useParams();
  const {
    session,
    getList,
    setItemCompleted,
    setItemIncomplete,
    addItem,
    removeItem,
    editList,
    addUser,
    removeUser,
    removeSelf,
    removeList,
    loading,
    error,
  } = useApi();
  const list = getList(listId!);
  const [open, setOpen] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState(list?.name || "");
  const [newUserId, setNewUserId] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isFullScreen = useMediaQuery("(max-width:600px)");

  const menuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  const handleEditOpen = () => setEditDialogOpen(true);
  const handleEditClose = () => setEditDialogOpen(false);
  const handleEditSave = () => {
    editList(listId!, newListName);
    setEditDialogOpen(false);
  };

  const handleSharingOpen = () => setSharingDialogOpen(true);
  const handleSharingClose = () => setSharingDialogOpen(false);
  const handleAddUser = () => {
    if (newUserId.trim()) {
      addUser(listId!, newUserId.trim());
      setNewUserId("");
    }
  };
  const handleRemoveUser = (userId: string) => removeUser(listId!, userId);

  const handleLeaveOpen = () => setLeaveDialogOpen(true);
  const handleLeaveClose = () => setLeaveDialogOpen(false);
  const handleLeaveConfirm = () => {
    removeSelf(listId!);
    setLeaveDialogOpen(false);
    navigate(-1);
  };
  const handleDeleteConfirm = () => {
    removeList(listId!);
    setLeaveDialogOpen(false);
    navigate(-1);
  };

  const isOwner = session?.user?.id === list?.owner;

  const modalContent = () => {
    if (!listId) {
      return <Typography>{t("listDetail.errorNoId")}</Typography>;
    }

    if (loading) {
      return (
        <Stack>
          <Skeleton variant="rectangular" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </Stack>
      );
    }

    if (error || !list) {
      return <Typography color="error">{error || t("listDetail.listNotFound")}</Typography>;
    }

    return (
      <Stack>
        <Stack
          direction="row"
          sx={{
            justifyContent: isFullScreen ? "center" : "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          {isFullScreen && (
            <IconButton
              onClick={handleClose}
              sx={{ position: "absolute", left: 0 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: isFullScreen ? "center" : "flex-start",
            }}
          >
            <Typography variant="h5">{list.name}</Typography>
            {isOwner && !isFullScreen && (
              <IconButton onClick={handleEditOpen}>
                <Edit />
              </IconButton>
            )}
          </Stack>
          {isFullScreen && (
            <IconButton
              onClick={menuClick}
              sx={{ position: "absolute", right: 0 }}
            >
              <MoreVert />
            </IconButton>
          )}
          {isFullScreen && (
            <Menu
              id="basic-menu"
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              slotProps={{
                list: { "aria-labelledby": "basic-button" },
              }}
            >
              <Stack spacing={0}>
                <IconButton onClick={handleEditOpen}>
                  <Edit />
                </IconButton>
                <IconButton onClick={handleSharingOpen}>
                  <PersonAdd />
                </IconButton>
                <IconButton onClick={handleLeaveOpen}>
                  {isOwner ? (
                    <Delete sx={{ color: red[500] }} />
                  ) : (
                    <Logout sx={{ color: red[500] }} />
                  )}
                </IconButton>
              </Stack>
            </Menu>
          )}
          {!isFullScreen && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                endIcon={<PersonAdd />}
                onClick={handleSharingOpen}
              >
                {t("listDetail.sharing")}
              </Button>
              <IconButton onClick={handleLeaveOpen}>
                {isOwner ? (
                  <Delete sx={{ color: red[500] }} />
                ) : (
                  <Logout sx={{ color: red[500] }} />
                )}
              </IconButton>
            </Stack>
          )}
        </Stack>
        <ItemListView
          itemList={list.items.filter((item) => !item.isComplete)}
          showAddItem={true}
          onComplete={async (iid) => await setItemCompleted(listId, iid)}
          onRemove={async (iid) => await removeItem(listId, iid)}
          onAdd={async (cnt) => await addItem(listId, cnt)}
        />
        <CompletedDropdown
          itemList={list.items.filter((item) => item.isComplete)}
          onIncomplete={async (iid) => await setItemIncomplete(listId, iid)}
          onRemove={async (iid) => await removeItem(listId, iid)}
        />
      </Stack>
    );
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Paper
          variant="outlined"
          sx={{
            padding: 3,
            borderRadius: 2,
            width: "100%",
            maxWidth: "600px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            ...(isFullScreen && {
              maxWidth: "100%",
              height: "100vh",
              borderRadius: 0,
              top: 0,
              left: 0,
              transform: "none",
            }),
          }}
        >
          {modalContent()}
        </Paper>
      </Modal>

      {isOwner && (
        <Dialog open={editDialogOpen} onClose={handleEditClose}>
          <DialogTitle>{t("listDetail.editList")}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t("listDetail.listName")}
              fullWidth
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <TextField
              margin="dense"
              label={t("listDetail.owner")}
              fullWidth
              value={list?.owner || ""}
              disabled
              helperText={t("listDetail.ownerNotEditable")}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>{t("listDetail.cancel")}</Button>
            <Button onClick={handleEditSave} disabled={!newListName.trim()}>
              {t("listDetail.save")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={sharingDialogOpen} onClose={handleSharingClose}>
        <DialogTitle>{t("listDetail.sharingSettings")}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">
            {t("listDetail.owner")}:{!isOwner && list?.owner}
            {isOwner && (
              <Chip
                avatar={<Avatar src={session?.user?.image || ""} />}
                label={session?.user?.name}
                variant="outlined"
              />
            )}
          </Typography>
          <Typography variant="subtitle1">{t("listDetail.invitedUsers")}</Typography>
          <List>
            {list?.invitedUsers?.length! > 0 ? (
              list?.invitedUsers.map((userId) =>
                userId === session?.user?.id ? (
                  <ListItem key={userId}>
                    <Chip
                      avatar={<Avatar src={session?.user?.image || ""} />}
                      label={session?.user?.name || "You"}
                      variant="outlined"
                    />
                  </ListItem>
                ) : (
                  <ListItem
                    key={userId}
                    secondaryAction={
                      isOwner && (
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveUser(userId)}
                        >
                          <Clear />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText primary={userId} />
                  </ListItem>
                )
              )
            ) : (
              <ListItem>
                <ListItemText primary={t("listDetail.noInvitedUsers")} />
              </ListItem>
            )}
            <Typography sx={{ opacity: "50%" }}>
              {t("listDetail.apiNote")}
            </Typography>
          </List>
          {isOwner && (
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label={t("listDetail.userIdToInvite")}
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                fullWidth
              />
              <Button onClick={handleAddUser} disabled={!newUserId.trim()}>
                {t("listDetail.invite")}
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSharingClose}>{t("listDetail.close")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={leaveDialogOpen} onClose={handleLeaveClose}>
        <DialogTitle>{isOwner ? t("listDetail.deleteList") : t("listDetail.leaveList")}</DialogTitle>
        <DialogContent>
          <Typography>
            {isOwner
              ? t("listDetail.deleteConfirm")
              : t("listDetail.leaveConfirm")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLeaveClose}>{t("listDetail.cancel")}</Button>
          {isOwner ? (
            <Button onClick={handleDeleteConfirm} color="error">
              {t("listDetail.delete")}
            </Button>
          ) : (
            <Button onClick={handleLeaveConfirm} color="error">
              {t("listDetail.leave")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}