import { useState } from "react";
import { Collapse, Button, ListItem, Checkbox, IconButton, ListItemText } from "@mui/material";
import { Clear } from "@mui/icons-material";
import { ListItem as apiListItem } from "../ApiContext";
import { useTranslation } from "react-i18next";

interface CompletedDropdownProps {
  itemList: apiListItem[];
  onIncomplete: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

function CompletedDropdown({ itemList, onIncomplete, onRemove }: CompletedDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(!open)}>
        {open ? t("completedDropdown.hideCompleted") : t("completedDropdown.showCompleted", { count: itemList.length })}
      </Button>
      <Collapse in={open}>
        {itemList.map((item) => (
          <ListItem
            key={item.itemId}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => onRemove(item.itemId)}>
                <Clear sx={{ opacity: "50%" }} />
              </IconButton>
            }
          >
            <Checkbox
              edge="start"
              checked={item.isComplete}
              onChange={() => onIncomplete(item.itemId)}
              tabIndex={-1}
            />
            <ListItemText primary={item.content} />
          </ListItem>
        ))}
      </Collapse>
    </div>
  );
}

export default CompletedDropdown;