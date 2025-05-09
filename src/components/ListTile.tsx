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
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router";
import { List as apiList, useApi } from "../ApiContext";
import { MoreVert } from "@mui/icons-material";
import React from "react";
import { useTranslation } from "react-i18next";

interface ListTileProps {
  list: apiList;
}

export default function ListTile({ list }: ListTileProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, updateList, removeList } = useApi();
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
        width: theme => `clamp(150px, calc(50% - ${theme.spacing(1)}), 250px)`,
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
              {list.archived ? t("listTile.unArchive") : t("listTile.archive")}
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                removeList(list.listId);
                setAnchorEl(null);
              }}
            >
              {t("listTile.delete")}
            </MenuItem>
          </Menu>
        </div>
      ) : null}
      <List dense sx={{ flexGrow: 1, overflow: "hidden" }}>
        {list.items
          .slice() // Create a copy to avoid mutating original array
          .sort((a, b) =>
            a.isComplete === b.isComplete ? 0 : a.isComplete ? 1 : -1
          )
          .slice(0, 3)
          .map((item) => (
            <ListItem key={item.itemId}>
              <Checkbox
                disabled={true}
                checked={item.isComplete}
                sx={{
                  padding: 0,
                  margin: 0,
                }}
              />
              <ListItemText primary={item.content} />
            </ListItem>
          ))}
        {list.items.length > 3 && (
          <ListItem>
            <ListItemText primary={t("listTile.moreItems", { count: list.items.length - 3 })} />
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
          {t("listTile.owner")}: {list.owner == session?.user?.id ? t("listTile.you") : list.owner}
          </Typography>
        </Stack>
      </Paper>
    </Paper>
  );
}
