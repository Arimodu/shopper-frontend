import {
  Paper,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router";
import { List as ListCtx } from "../ListContext";
import { useSession } from "../SessionContext";
import { MoreVert } from "@mui/icons-material";
import React from "react";
import { useLists } from "../ListsContext";

interface ListTileProps {
  list: ListCtx;
}

export default function ListTile({ list }: ListTileProps) {
  const navigate = useNavigate();
  const { session } = useSession();
  const { updateList, removeList } = useLists();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleClick = () => {
    navigate(`/list/${list.listId}`);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: 250,
        height: 250,
        borderRadius: 2,
        padding: 2,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
      onClick={handleClick}
    >
      {list.owner === session!.user!.id! ? (
        <div>
          <IconButton
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            sx={{
              position: "absolute",
              right: "5%",
              top: "5%",
              zIndex: 1,
            }}
            onClick={menuClick}
          >
            <MoreVert />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              list: { "aria-labelledby": "basic-button" },
            }}
          >
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                updateList(list.listId, (l) => ({
                  ...l,
                  archived: !l.archived,
                }));
                setAnchorEl(null);
              }}
            >
              {list.archived ? "Un-Archive" : "Archive"}
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                removeList(list.listId);
                setAnchorEl(null);
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </div>
      ) : null}
      <List dense sx={{ flexGrow: 1, overflow: "hidden" }}>
        {list.items.slice(0, 3).map((item) => (
          <ListItem key={item.itemId}>
            <ListItemText primary={item.content} />
          </ListItem>
        ))}
        {list.items.length > 3 && (
          <ListItem>
            <ListItemText primary={`... and ${list.items.length - 3} more`} />
          </ListItem>
        )}
      </List>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 2,
          padding: 1,
        }}
      >
        <Stack justifyContent="space-between" alignItems="Left">
          <Typography variant="subtitle2">{list.name}</Typography>
          <Typography variant="caption" color="textSecondary" noWrap>
            Owner: {list.owner == session?.user?.id ? "you" : list.owner}
          </Typography>
        </Stack>
      </Paper>
    </Paper>
  );
}
