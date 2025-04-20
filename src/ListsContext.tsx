import * as React from "react";
import { fetchAllLists } from "./ListContext";
import { List } from "./ListContext";
import { useSession } from "./SessionContext";

export interface ListsContextValue {
  lists: List[];
  loading: boolean;
  error: string | null;
}

export const ListsContext = React.createContext<ListsContextValue>({
  lists: [],
  loading: true,
  error: null,
});

export function useLists() {
  return React.useContext(ListsContext);
}

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = React.useState<List[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { session } = useSession();

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
        const fetchedLists = await fetchAllLists();
        setLists(fetchedLists);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lists");
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, [session?.user?.id]);

  const value: ListsContextValue = {
    lists,
    loading,
    error,
  };

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}