import  { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import ItemList from './components/ItemList';
import SearchBar from './components/SearchBar';
import { fetchList, ItemData } from './api/fetch-list';
import './App.css';
function App() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [query, setQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [lastSelectedItemId, setLastSelectedItemId] = useState<number | null>(null);
  const [totalSelectedCount, setTotalSelectedCount] = useState<number>(0);

  useEffect(() => {
    async function fetchData(){
      const data = await fetchList({query});
      setItems(data);
    }
    
    const debouncedFetch = debounce(() => {
      fetchData();
    }, 300);

    debouncedFetch();
  }, [query]);


  useEffect(() => {
    setTotalSelectedCount(selectedItemIds.length);
  }, [selectedItemIds]);

  const handleSelectItem = useCallback((id: number) => {
    const newIds = new Set(selectedItemIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    setSelectedItemIds(Array.from(newIds));
    
    const lastId = newIds.size ? Array.from(newIds)[newIds.size - 1] : null;
    setLastSelectedItemId(lastId);
  }, [selectedItemIds]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 500,
    }}>
      <h1>Item List</h1>
      <p>Total Items Selected: {totalSelectedCount}</p>
      <p>Last selected item ID is: {lastSelectedItemId}</p>
      <SearchBar query={query} setQuery={setQuery} />
      <ItemList
        items={items}
        selectedItemIds={selectedItemIds}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}

export default App;
