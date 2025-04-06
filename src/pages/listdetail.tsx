import {
  Modal,
  Paper,
  Stack,
  Typography,
  Container,
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
} from "@mui/material";
import { useSession } from "../SessionContext";
import { useState } from "react";
import CompletedDropdown from "../components/CompletedDropdown";
import ItemListView from "../components/ItemListView";
import { useList } from "../ListContext";
import { useNavigate, useParams } from "react-router";
import { Delete, Edit, Logout, PersonAdd, Clear } from "@mui/icons-material";
import { red } from "@mui/material/colors";

export default function ListDetail() {
  const navigate = useNavigate();
  const { listId } = useParams<{ listId: string }>();
  const { session } = useSession();
  const {
    list,
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
  } = useList();
  const [open, setOpen] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState(list?.name || "");
  const [newUserId, setNewUserId] = useState("");

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  const handleEditOpen = () => setEditDialogOpen(true);
  const handleEditClose = () => setEditDialogOpen(false);
  const handleEditSave = () => {
    editList(newListName);
    setEditDialogOpen(false);
  };

  const handleSharingOpen = () => setSharingDialogOpen(true);
  const handleSharingClose = () => setSharingDialogOpen(false);
  const handleAddUser = () => {
    if (newUserId.trim()) {
      addUser(newUserId.trim());
      setNewUserId("");
    }
  };
  const handleRemoveUser = (userId: string) => removeUser(userId);

  const handleLeaveOpen = () => setLeaveDialogOpen(true);
  const handleLeaveClose = () => setLeaveDialogOpen(false);
  const handleLeaveConfirm = () => {
    removeSelf();
    setLeaveDialogOpen(false);
    navigate(-1);
  };
  const handleDeleteConfirm = () => {
    removeList();
    setLeaveDialogOpen(false);
    navigate(-1);
  };

  if (!listId) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Container
          maxWidth="sm"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Paper variant="outlined" sx={{ padding: 3, borderRadius: 2 }}>
            <Typography>Error: No list ID provided</Typography>
          </Paper>
        </Container>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Container
          maxWidth="sm"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Paper variant="outlined" sx={{ padding: 3, borderRadius: 2 }}>
            <Stack>
              <Skeleton variant="rectangular" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Stack>
          </Paper>
        </Container>
      </Modal>
    );
  }

  if (error || !list) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Container
          maxWidth="sm"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Paper variant="outlined" sx={{ padding: 3, borderRadius: 2 }}>
            <Typography color="error">{error || "List not found"}</Typography>
          </Paper>
        </Container>
      </Modal>
    );
  }

  const isOwner = session?.user?.id === list.owner;

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Container
          maxWidth="sm"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Paper variant="outlined" sx={{ padding: 3, borderRadius: 2 }}>
            <Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography variant="h5">{list.name}</Typography>
                  {isOwner && (
                    <IconButton onClick={handleEditOpen}>
                      <Edit />
                    </IconButton>
                  )}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    endIcon={<PersonAdd />}
                    onClick={handleSharingOpen}
                  >
                    Sharing
                  </Button>
                  <IconButton onClick={handleLeaveOpen}>
                    {isOwner ? (
                      <Delete sx={{ color: red[500] }} />
                    ) : (
                      <Logout sx={{ color: red[500] }} />
                    )}
                  </IconButton>
                </Stack>
              </Stack>
              <ItemListView
                itemList={list.items.filter((item) => !item.isComplete)}
                showAddItem={true}
                onComplete={setItemCompleted}
                onRemove={removeItem}
                onAdd={addItem}
              />
              <CompletedDropdown
                itemList={list.items.filter((item) => item.isComplete)}
                onIncomplete={setItemIncomplete}
                onRemove={removeItem}
              />
            </Stack>
          </Paper>
        </Container>
      </Modal>

      {isOwner && (
        <Dialog open={editDialogOpen} onClose={handleEditClose}>
          <DialogTitle>Edit List</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="List Name"
              fullWidth
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Owner"
              fullWidth
              value={list.owner}
              disabled
              helperText="Transfer ownership not implemented"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={!newListName.trim()}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={sharingDialogOpen} onClose={handleSharingClose}>
        <DialogTitle>Sharing Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">
            Owner:{!isOwner && list.owner}
            {isOwner && (
              <Chip
                avatar={<Avatar src={session?.user?.image || ""} />}
                label={session?.user?.name}
                variant="outlined"
              />
            )}
          </Typography>
          <Typography variant="subtitle1">Invited Users:</Typography>
          <List>
            {list.invitedUsers.length > 0 ? (
              list.invitedUsers.map((userId) =>
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
                <ListItemText primary="No invited users" />
              </ListItem>
            )}
            <Typography sx={{ opacity: "50%" }}>
              Note: This dialog will call the /v1/users/ api to get usernames
              and images.
            </Typography>
          </List>
          {isOwner && (
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="User ID to Invite"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                fullWidth
              />
              <Button onClick={handleAddUser} disabled={!newUserId.trim()}>
                Invite
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSharingClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={leaveDialogOpen} onClose={handleLeaveClose}>
        <DialogTitle>{isOwner ? "Delete List" : "Leave List"}</DialogTitle>
        <DialogContent>
          <Typography>
            {isOwner
              ? "Are you sure you want to delete this list? This action cannot be undone."
              : "Are you sure you want to leave this list?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLeaveClose}>Cancel</Button>
          {isOwner ? (
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          ) : (
            <Button onClick={handleLeaveConfirm} color="error">
              Leave
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
