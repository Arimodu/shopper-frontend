import {
  List,
  ListItem,
  Checkbox,
  IconButton,
  TextField,
  Stack,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import { Add, Clear } from "@mui/icons-material";
import { ListItem as apiListItem } from "../ApiContext";
import { useTranslation } from "react-i18next";

export interface ItemListViewProps {
  itemList: apiListItem[];
  showAddItem?: boolean;
  onComplete: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onAdd: (content: string) => void;
}

function ItemListView({
  itemList,
  showAddItem = true,
  onComplete,
  onRemove,
  onAdd,
}: ItemListViewProps) {
  const { t } = useTranslation();
  const [newItemContent, setNewItemContent] = useState("");

  const handleAddItem = () => {
    if (newItemContent.trim()) {
      onAdd(newItemContent.trim());
      setNewItemContent("");
    }
  };

  return (
    <List>
      {itemList.map((item: apiListItem) => (
        <ListItem
          key={item.itemId}
          secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => onRemove(item.itemId)}>
              <Clear sx={{ opacity: "50%" }} />
            </IconButton>
          }
        >
          <Checkbox
            id={`item-list-checkbox-${item.itemId}`}
            edge="start"
            checked={item.isComplete}
            onChange={() => onComplete(item.itemId)}
            tabIndex={-1}
          />
          <ListItemText id={`item-list-label-${item.itemId}`} primary={item.content} />
        </ListItem>
      ))}
      {showAddItem ? (
        <ListItem>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "left" }}>
            <IconButton onClick={handleAddItem}>
              <Add />
            </IconButton>
            <TextField
              variant="standard"
              label={t("itemListView.newItem")}
              margin="normal"
              size="small"
              value={newItemContent}
              helperText=" " // Fix spacing
              onChange={(e) => setNewItemContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
          </Stack>
        </ListItem>
      ) : null}
    </List>
  );
}

export default ItemListView;