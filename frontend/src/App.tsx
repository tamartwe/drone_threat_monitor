import { useState } from 'react';
import DroneTable from './components/DroneTable';
import FilterBar from './components/FilterBar';
import { DroneFilters } from './types';

export default function App() {
  const [filters, setFilters] = useState<DroneFilters>({});

  return (
    <div className="app">
      <header className="app-header">
        <h1>Drone Threat Monitor</h1>
      </header>
      <main className="app-main">
        <FilterBar filters={filters} onChange={setFilters} />
        <DroneTable filters={filters} />
      </main>
    </div>
  );
}
