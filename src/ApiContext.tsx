"use client";
import * as React from "react";
import type { Session } from "@toolpad/core/AppProvider";
import { v4 as uuidv4 } from "uuid";

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

interface User {
  _id: string;
  name: string;
}

interface UserMeResponse {
  user: User;
  lists: {
    owned: List[];
    invited: List[];
  };
}

interface ApiContextValue {
  apiEnabled: boolean;
  setApiEnabled: (enabled: boolean) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  login: (name: string, password: string) => Promise<Session>;
  register: (name: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  updateUser: (name?: string, password?: string) => Promise<User>;
  deleteUser: () => Promise<void>;
  lists: List[];
  addList: () => Promise<string>;
  getListById: (listId: string) => Promise<List>;
  removeList: (listId: string) => Promise<void>;
  updateList: (listId: string, updater: (list: List) => List) => Promise<void>;
  getList: (listId: string) => List | null;
  setItemCompleted: (listId: string, itemId: string) => Promise<void>;
  setItemIncomplete: (listId: string, itemId: string) => Promise<void>;
  addItem: (listId: string, content: string) => Promise<void>;
  removeItem: (listId: string, itemId: string) => Promise<void>;
  getItem: (itemId: string) => Promise<ListItem>;
  editList: (listId: string, name?: string, owner?: string) => Promise<void>;
  setArchived: (listId: string, archived: boolean) => Promise<void>;
  addUser: (listId: string, userId: string) => Promise<void>;
  removeUser: (listId: string, userId: string) => Promise<void>;
  removeSelf: (listId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const ApiContext = React.createContext<ApiContextValue>({
  apiEnabled: true,
  setApiEnabled: () => {},
  session: null,
  setSession: () => {},
  login: async () => ({ user: { id: "", name: "", email: "" } }),
  register: async () => ({ user: { id: "", name: "", email: "" } }),
  logout: async () => {},
  updateUser: async () => ({ _id: "", name: "" }),
  deleteUser: async () => {},
  lists: [],
  addList: async () => "",
  getListById: async () => ({
    listId: "",
    name: "",
    owner: "",
    archived: false,
    invitedUsers: [],
    items: [],
  }),
  removeList: async () => {},
  updateList: async () => {},
  getList: () => null,
  setItemCompleted: async () => {},
  setItemIncomplete: async () => {},
  addItem: async () => {},
  removeItem: async () => {},
  getItem: async () => ({
    itemId: "",
    order: 0,
    content: "",
    isComplete: false,
  }),
  editList: async () => {},
  setArchived: async () => {},
  addUser: async () => {},
  removeUser: async () => {},
  removeSelf: async () => {},
  loading: true,
  error: null,
});

export function useApi() {
  return React.useContext(ApiContext);
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [apiEnabled, setApiEnabled] = React.useState(true);
  const [session, setSession] = React.useState<Session | null>(null);
  const [lists, setLists] = React.useState<List[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load lists when session changes
  React.useEffect(() => {
    const loadLists = async () => {
      if (!session?.user?.id) {
        setLists([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const {
          lists: { owned, invited },
        } = await getUserMe();
        setLists([...owned, ...invited]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lists");
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, [session?.user?.id]);

  const login = async (name: string, password: string): Promise<Session> => {
    if (!apiEnabled) {
      console.log("Using mock login");
      return mockLogin(name, password);
    }

    console.log("Attempting API login with:", { name });
    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) throw new Error("User not found");
        if (response.status === 401) throw new Error("Invalid password");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const newSession: Session = {
        user: {
          id: data._id,
          name: data.name,
          email: name, // Backend doesn't implement email... not high priority... too bad
          image: "https://arimodu.dev/pfp.webp",
        },
      };
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name: string, password: string): Promise<Session> => {
    if (!apiEnabled) {
      console.log("Using mock register");
      return mockLogin(name, password); // Reuse mockLogin
    }

    console.log("Attempting API register with:", { name });
    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        }
      );

      if (!response.ok) {
        if (response.status === 409) throw new Error("Username already exists");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const newSession: Session = {
        user: {
          id: data._id,
          name: data.name,
          email: name, // Backend doesn't implement email... too bad
          image: "https://arimodu.dev/pfp.webp",
        },
      };
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock logout");
      setSession(null);
      setLists([]);
      return;
    }

    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/auth/logout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("User not logged in");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      setSession(null);
      setLists([]);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUser = async (
    name?: string,
    password?: string
  ): Promise<User> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock updateUser");
      const updatedUser: User = {
        _id: session.user.id,
        name: (name || session.user.name) ?? "unknown",
      };
      setSession({
        ...session,
        user: {
          ...session.user,
          name: name || session.user.name,
          email: name || session.user.email,
        },
      });
      return updatedUser;
    }

    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/user/me",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("User not logged in");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const user = await response.json();
      setSession({
        ...session,
        user: { ...session.user, name: user.name, email: user.name },
      });
      return user;
    } catch (error) {
      console.error("updateUser error:", error);
      throw error;
    }
  };

  const deleteUser = async (): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock deleteUser");
      setSession(null);
      setLists([]);
      return;
    }

    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/user/me",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("User not logged in");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      setSession(null);
      setLists([]);
    } catch (error) {
      console.error("deleteUser error:", error);
      throw error;
    }
  };

  const getUserMe = async (): Promise<UserMeResponse> => {
    if (!apiEnabled) {
      console.log("Using mock getUserMe");
      return mockGetUserMe();
    }

    console.log("Fetching user data from API");
    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/user/me",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("User is not logged in");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const normalizeList = (list: any): List => ({
        listId: list._id,
        name: list.name,
        owner: list.owner,
        archived: list.archived,
        invitedUsers: list.invitedUsers || [],
        items: (list.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      });

      return {
        user: data.user,
        lists: {
          owned: (data.lists.owned || []).map(normalizeList),
          invited: (data.lists.invited || []).map(normalizeList),
        },
      };
    } catch (error) {
      console.error("getUserMe error:", error);
      throw error;
    }
  };

  const addList = async (): Promise<string> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock addList");
      const listId = uuidv4();
      const newList: List = {
        listId,
        name: "New List",
        owner: session.user.id,
        archived: false,
        invitedUsers: [],
        items: [],
      };
      setLists((prev) => [...prev, newList]);
      return listId;
    }

    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/list/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listName: "New List" }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("User not logged in");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const list = await response.json();
      const newList: List = {
        listId: list._id,
        name: list.name,
        owner: list.owner,
        archived: list.archived,
        invitedUsers: list.invitedUsers || [],
        items: (list.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
      setLists((prev) => [...prev, newList]);
      return newList.listId;
    } catch (error) {
      console.error("addList error:", error);
      throw error;
    }
  };

  const getListById = async (listId: string): Promise<List> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock getListById");
      const list = mockData.find((l) => l.listId === listId);
      if (!list) throw new Error("List not found");
      return list;
    }

    try {
      const response = await fetch(
        `https://shopper.arimodu.dev/api/v1/list/${listId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("List not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const list = await response.json();
      return {
        listId: list._id,
        name: list.name,
        owner: list.owner,
        archived: list.archived,
        invitedUsers: list.invitedUsers || [],
        items: (list.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
    } catch (error) {
      console.error("getListById error:", error);
      throw error;
    }
  };

  const removeList = async (listId: string): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock removeList");
      setLists((prev) => prev.filter((list) => list.listId !== listId));
      return;
    }

    try {
      const response = await fetch(
        `https://shopper.arimodu.dev/api/v1/list/${listId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("List not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      setLists((prev) => prev.filter((list) => list.listId !== listId));
    } catch (error) {
      console.error("removeList error:", error);
      throw error;
    }
  };

  const updateList = async (
    listId: string,
    updater: (list: List) => List
  ): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    const list = lists.find((l) => l.listId === listId);
    if (!list) throw new Error("List not found");

    const updatedList = updater(list);
    if (!apiEnabled) {
      console.log("Using mock updateList");
      setLists((prev) =>
        prev.map((l) => (l.listId === listId ? updatedList : l))
      );
      return;
    }

    try {
      const response = await fetch(
        `https://shopper.arimodu.dev/api/v1/list/${listId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updatedList.name,
            owner: updatedList.owner,
            archived: updatedList.archived,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("List not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const normalizedList: List = {
        listId: data._id,
        name: data.name,
        owner: data.owner,
        archived: data.archived,
        invitedUsers: data.invitedUsers || [],
        items: (data.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
      setLists((prev) =>
        prev.map((l) => (l.listId === listId ? normalizedList : l))
      );
    } catch (error) {
      console.error("updateList error:", error);
      throw error;
    }
  };

  const getList = (listId: string): List | null => {
    return lists.find((l) => l.listId === listId) || null;
  };

  const setItemCompleted = async (
    listId: string,
    itemId: string
  ): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock setItemCompleted");
      await updateList(listId, (list) => ({
        ...list,
        items: list.items.map((item) =>
          item.itemId === itemId ? { ...item, isComplete: true } : item
        ),
      }));
      return;
    }

    try {
      const response = await fetch(
        `https://shopper.arimodu.dev/api/v1/item/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isComplete: true }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("Item not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const normalizedList: List = {
        listId: data._id,
        name: data.name,
        owner: data.owner,
        archived: data.archived,
        invitedUsers: data.invitedUsers || [],
        items: (data.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
      setLists((prev) =>
        prev.map((l) => (l.listId === listId ? normalizedList : l))
      );
    } catch (error) {
      console.error("setItemCompleted error:", error);
      throw error;
    }
  };

  const setItemIncomplete = async (
    listId: string,
    itemId: string
  ): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock setItemIncomplete");
      await updateList(listId, (list) => ({
        ...list,
        items: list.items.map((item) =>
          item.itemId === itemId ? { ...item, isComplete: false } : item
        ),
      }));
      return;
    }

    try {
      const response = await fetch(
        `https://shopper.arimodu.dev/api/v1/item/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isComplete: false }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("Item not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const normalizedList: List = {
        listId: data._id,
        name: data.name,
        owner: data.owner,
        archived: data.archived,
        invitedUsers: data.invitedUsers || [],
        items: (data.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
      setLists((prev) =>
        prev.map((l) => (l.listId === listId ? normalizedList : l))
      );
    } catch (error) {
      console.error("setItemIncomplete error:", error);
      throw error;
    }
  };

  const addItem = async (listId: string, content: string): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    const list = lists.find((l) => l.listId === listId);
    if (!list) throw new Error("List not found");

    const newItem: ListItem = {
      itemId: uuidv4(),
      order: list.items.length + 1,
      content,
      isComplete: false,
    };

    if (!apiEnabled) {
      console.log("Using mock addItem");
      await updateList(listId, (list) => ({
        ...list,
        items: [...list.items, newItem],
      }));
      return;
    }

    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/item/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId, order: newItem.order, content }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("List not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const normalizedList: List = {
        listId: data._id,
        name: data.name,
        owner: data.owner,
        archived: data.archived,
        invitedUsers: data.invitedUsers || [],
        items: (data.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
      setLists((prev) =>
        prev.map((l) => (l.listId === listId ? normalizedList : l))
      );
    } catch (error) {
      console.error("addItem error:", error);
      throw error;
    }
  };

  const removeItem = async (listId: string, itemId: string): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock removeItem");
      await updateList(listId, (list) => ({
        ...list,
        items: list.items.filter((item) => item.itemId !== itemId),
      }));
      return;
    }

    try {
      const response = await fetch(
        `https://shopper.arimodu.dev/api/v1/item/${itemId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("Item not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      await updateList(listId, (list) => ({
        ...list,
        items: list.items.filter((item) => item.itemId !== itemId),
      }));
    } catch (error) {
      console.error("removeItem error:", error);
      throw error;
    }
  };

  const getItem = async (itemId: string): Promise<ListItem> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    if (!apiEnabled) {
      console.log("Using mock getItem");
      const list = mockData.find((l) =>
        l.items.some((i) => i.itemId === itemId)
      );
      const item = list?.items.find((i) => i.itemId === itemId);
      if (!item) throw new Error("Item not found");
      return item;
    }

    try {
      const response = await fetch(
        `https://shopper.arimodu.dev/api/v1/item/${itemId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 404) throw new Error("Item not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const item = await response.json();
      return {
        itemId: item._id,
        order: item.order,
        content: item.content,
        isComplete: item.isComplete,
      };
    } catch (error) {
      console.error("getItem error:", error);
      throw error;
    }
  };

  const editList = async (
    listId: string,
    name?: string,
    owner?: string
  ): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    const list = lists.find((l) => l.listId === listId);
    if (!list || list.owner !== session.user.id)
      throw new Error("Not authorized");

    await updateList(listId, (list) => ({
      ...list,
      name: name !== undefined ? name : list.name,
      owner: owner !== undefined ? owner : list.owner,
    }));
  };

  const setArchived = async (
    listId: string,
    archived: boolean
  ): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    const list = lists.find((l) => l.listId === listId);
    if (!list || list.owner !== session.user.id)
      throw new Error("Not authorized");

    await updateList(listId, (list) => ({ ...list, archived }));
  };

  const addUser = async (listId: string, userId: string): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    const list = lists.find((l) => l.listId === listId);
    if (
      !list ||
      list.owner !== session.user.id ||
      list.invitedUsers.includes(userId)
    ) {
      throw new Error("Not authorized or user already invited");
    }

    if (!apiEnabled) {
      console.log("Using mock addUser");
      await updateList(listId, (list) => ({
        ...list,
        invitedUsers: [...list.invitedUsers, userId],
      }));
      return;
    }

    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/list/acl",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId, userId }),
        }
      );

      if (!response.ok) {
        if (response.status === 400) throw new Error("Cannot add yourself");
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("List not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const normalizedList: List = {
        listId: data._id,
        name: data.name,
        owner: data.owner,
        archived: data.archived,
        invitedUsers: data.invitedUsers || [],
        items: (data.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
      setLists((prev) =>
        prev.map((l) => (l.listId === listId ? normalizedList : l))
      );
    } catch (error) {
      console.error("addUser error:", error);
      throw error;
    }
  };

  const removeUser = async (listId: string, userId: string): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    const list = lists.find((l) => l.listId === listId);
    if (!list || list.owner !== session.user.id)
      throw new Error("Not authorized");

    if (!apiEnabled) {
      console.log("Using mock removeUser");
      await updateList(listId, (list) => ({
        ...list,
        invitedUsers: list.invitedUsers.filter((id) => id !== userId),
      }));
      return;
    }

    try {
      const response = await fetch(
        "https://shopper.arimodu.dev/api/v1/list/acl",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId, userId }),
        }
      );

      if (!response.ok) {
        if (response.status === 400) throw new Error("Cannot remove yourself");
        if (response.status === 401) throw new Error("Not authorized");
        if (response.status === 404) throw new Error("List not found");
        throw new Error(`Unexpected response: ${response.status}`);
      }

      const data = await response.json();
      const normalizedList: List = {
        listId: data._id,
        name: data.name,
        owner: data.owner,
        archived: data.archived,
        invitedUsers: data.invitedUsers || [],
        items: (data.items || []).map((item: any) => ({
          itemId: item._id,
          order: item.order,
          content: item.content,
          isComplete: item.isComplete,
        })),
      };
      setLists((prev) =>
        prev.map((l) => (l.listId === listId ? normalizedList : l))
      );
    } catch (error) {
      console.error("removeUser error:", error);
      throw error;
    }
  };

  const removeSelf = async (listId: string): Promise<void> => {
    if (!session?.user?.id) throw new Error("User not logged in");
    const list = lists.find((l) => l.listId === listId);
    if (!list || list.owner === session.user.id)
      throw new Error("Not authorized");

    await removeUser(listId, session.user.id);
    setLists((prev) => prev.filter((l) => l.listId !== listId));
  };

  // Mock implementations
  const mockLogin = async (
    name: string,
    password: string
  ): Promise<Session> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password === "password") {
          const newSession: Session = {
            user: {
              id: "5629aaef-1a1e-4430-be02-9104cc7e5544",
              name: "Arimodu Demo",
              email: name || "demo@arimodu.dev",
              image: "https://arimodu.dev/pfp.webp",
            },
          };
          setSession(newSession);
          resolve(newSession);
        } else {
          reject(new Error("Incorrect credentials"));
        }
      }, 1000);
    });
  };

  const mockGetUserMe = async (): Promise<UserMeResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 * Math.random()));
    return {
      user: {
        _id: "5629aaef-1a1e-4430-be02-9104cc7e5544",
        name: "Arimodu Demo",
      },
      lists: {
        owned: mockData.filter(
          (list) => list.owner === "5629aaef-1a1e-4430-be02-9104cc7e5544"
        ),
        invited: mockData.filter((list) =>
          list.invitedUsers.includes("5629aaef-1a1e-4430-be02-9104cc7e5544")
        ),
      },
    };
  };

  const value: ApiContextValue = {
    apiEnabled,
    setApiEnabled,
    session,
    setSession,
    login,
    register,
    logout,
    updateUser,
    deleteUser,
    lists,
    addList,
    getListById,
    removeList,
    updateList,
    getList,
    setItemCompleted,
    setItemIncomplete,
    addItem,
    removeItem,
    getItem,
    editList,
    setArchived,
    addUser,
    removeUser,
    removeSelf,
    loading,
    error,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

const mockData: List[] = [
  // List 1: Owned by user, not archived, multiple items, some completed
  {
    listId: uuidv4(),
    name: "Demo List 1",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: false,
    invitedUsers: [
      "500cb652-c4cc-4c51-8c40-d1525d0c3926",
      "209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553",
    ],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: true },
      { itemId: uuidv4(), order: 3, content: "Demo Item 3", isComplete: false },
      { itemId: uuidv4(), order: 4, content: "Demo Item 4", isComplete: true },
    ],
  },
  // List 2: Invited user, not archived, few items
  {
    listId: uuidv4(),
    name: "Demo List 2",
    owner: "0b9c903e-b190-453d-bd4f-553fe5ff6389",
    archived: false,
    invitedUsers: ["5629aaef-1a1e-4430-be02-9104cc7e5544"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: false },
    ],
  },
  // List 3: Owned by user, archived, empty list
  {
    listId: uuidv4(),
    name: "Demo List 3",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: true,
    invitedUsers: [],
    items: [],
  },
  // List 4: Invited user, archived, many items, all completed
  {
    listId: uuidv4(),
    name: "Demo List 4",
    owner: "209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553",
    archived: true,
    invitedUsers: [
      "5629aaef-1a1e-4430-be02-9104cc7e5544",
      "500cb652-c4cc-4c51-8c40-d1525d0c3926",
    ],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: true },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: true },
      { itemId: uuidv4(), order: 3, content: "Demo Item 3", isComplete: true },
      { itemId: uuidv4(), order: 4, content: "Demo Item 4", isComplete: true },
      { itemId: uuidv4(), order: 5, content: "Demo Item 5", isComplete: true },
    ],
  },
  // List 5: Owned by user, not archived, single item
  {
    listId: uuidv4(),
    name: "Demo List 5",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: false,
    invitedUsers: ["0b9c903e-b190-453d-bd4f-553fe5ff6389"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
    ],
  },
  // List 6: Invited user, not archived, no items, multiple invited users
  {
    listId: uuidv4(),
    name: "Demo List 6",
    owner: "500cb652-c4cc-4c51-8c40-d1525d0c3926",
    archived: false,
    invitedUsers: [
      "5629aaef-1a1e-4430-be02-9104cc7e5544",
      "209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553",
      "0b9c903e-b190-453d-bd4f-553fe5ff6389",
    ],
    items: [],
  },
  // List 7: Owned by user, archived, many items, mixed completion
  {
    listId: uuidv4(),
    name: "Demo List 7",
    owner: "5629aaef-1a1e-4430-be02-9104cc7e5544",
    archived: true,
    invitedUsers: ["209fa1ea-e5fa-4b89-83e4-0a3f0d4b7553"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: false },
      { itemId: uuidv4(), order: 2, content: "Demo Item 2", isComplete: true },
      { itemId: uuidv4(), order: 3, content: "Demo Item 3", isComplete: false },
      { itemId: uuidv4(), order: 4, content: "Demo Item 4", isComplete: true },
      { itemId: uuidv4(), order: 5, content: "Demo Item 5", isComplete: false },
      { itemId: uuidv4(), order: 6, content: "Demo Item 6", isComplete: true },
    ],
  },
  // List 8: Invited user, not archived, single completed item
  {
    listId: uuidv4(),
    name: "Demo List 8",
    owner: "0b9c903e-b190-453d-bd4f-553fe5ff6389",
    archived: false,
    invitedUsers: ["5629aaef-1a1e-4430-be02-9104cc7e5544"],
    items: [
      { itemId: uuidv4(), order: 1, content: "Demo Item 1", isComplete: true },
    ],
  },
];
