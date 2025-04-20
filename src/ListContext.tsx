import * as React from "react";
import { useSession } from "./SessionContext";
import { v4 as uuidv4 } from "uuid";
import { useLists } from "./ListsContext";

export interface ListItem {
  itemId: string;
  order: number;
  content: string;
  isComplete: boolean;
}

export interface List {
  listId: string;
  name: string;
  owner: string;
  archived: boolean;
  invitedUsers: string[];
  items: ListItem[];
}

export interface ListContextValue {
  list: List | null;
  setItemCompleted: (itemId: string) => void;
  setItemIncomplete: (itemId: string) => void;
  addItem: (content: string) => void;
  removeItem: (itemId: string) => void;
  editList: (name?: string, owner?: string) => void;
  setArchived: (archived: boolean) => void;
  addUser: (userId: string) => void;
  removeUser: (userId: string) => void;
  removeSelf: () => void;
  removeList: () => void;
  loading: boolean;
  error: string | null;
}

export const ListContext = React.createContext<ListContextValue>({
  list: null,
  setItemCompleted: () => {},
  setItemIncomplete: () => {},
  addItem: () => {},
  removeItem: () => {},
  editList: () => {},
  setArchived: () => {},
  addUser: () => {},
  removeUser: () => {},
  removeSelf: () => {},
  removeList: () => {},
  loading: true,
  error: null,
});

export function useList() {
  return React.useContext(ListContext);
}

export function ListProvider({
  listId,
  children,
}: {
  listId: string;
  children: React.ReactNode;
}) {
  const { lists, updateList, removeList: removeListFromContext, loading: listsLoading, error: listsError } = useLists();
  const list = lists.find((l) => l.listId === listId) || null;
  const { session } = useSession();

  const loading = listsLoading;
  const error = listsError || (list === null && !listsLoading ? "List not found" : null);

  const setItemCompleted = (itemId: string) => {
    if (!list) return;
    updateList(listId, (list) => ({
      ...list,
      items: list.items.map((item) =>
        item.itemId === itemId ? { ...item, isComplete: true } : item
      ),
    }));
  };

  const setItemIncomplete = (itemId: string) => {
    if (!list) return;
    updateList(listId, (list) => ({
      ...list,
      items: list.items.map((item) =>
        item.itemId === itemId ? { ...item, isComplete: false } : item
      ),
    }));
  };

  const addItem = (content: string) => {
    if (!list) return;
    const newItem: ListItem = {
      itemId: uuidv4(),
      order: list.items.length + 1,
      content,
      isComplete: false,
    };
    updateList(listId, (list) => ({
      ...list,
      items: [...list.items, newItem],
    }));
  };

  const removeItem = (itemId: string) => {
    if (!list) return;
    updateList(listId, (list) => ({
      ...list,
      items: list.items.filter((item) => item.itemId !== itemId),
    }));
  };

  const editList = (name?: string, owner?: string) => {
    if (!list || list.owner !== session?.user?.id) return;
    updateList(listId, (list) => ({
      ...list,
      name: name !== undefined ? name : list.name,
      owner: owner !== undefined ? owner : list.owner,
    }));
  };

  const setArchived = (archived: boolean) => {
    if (!list || list.owner !== session?.user?.id) return;
    updateList(listId, (list) => ({
      ...list,
      archived,
    }));
  };

  const addUser = (userId: string) => {
    if (!list || list.owner !== session?.user?.id) return;
    if (list.invitedUsers.includes(userId)) return;
    updateList(listId, (list) => ({
      ...list,
      invitedUsers: [...list.invitedUsers, userId],
    }));
  };

  const removeUser = (userId: string) => {
    if (!list || list.owner !== session?.user?.id) return;
    updateList(listId, (list) => ({
      ...list,
      invitedUsers: list.invitedUsers.filter((id) => id !== userId),
    }));
  };

  const removeSelf = () => {
    if (!list || !session?.user?.id || list.owner === session.user.id) return;
    updateList(listId, (list) => ({
      ...list,
      invitedUsers: list.invitedUsers.filter((id) => id !== session!.user!.id),
    }));
    // API will be called above, here we remove our own reference. 
    // This is only useful with mock data, the API handler will not return the list again as it is no longer associated with the current session 
    removeListFromContext(listId); 
  };

  const removeList = () => {
    if (!list || list.owner !== session?.user?.id) return;
    removeListFromContext(listId);
  };

  const value: ListContextValue = {
    list,
    setItemCompleted,
    setItemIncomplete,
    addItem,
    removeItem,
    editList,
    setArchived,
    addUser,
    removeUser,
    removeSelf,
    removeList,
    loading,
    error,
  };

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}