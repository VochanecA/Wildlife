import Dexie, { Table } from 'dexie';

export interface OfflineWildlifeSighting {
  id?: string;
  species: string;
  count: number;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export interface OfflineHazardReport {
  id?: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export interface OfflineTask {
  id?: string;
  title: string;
  description?: string;
  task_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

class OfflineDB extends Dexie {
  wildlifeSightings!: Table<OfflineWildlifeSighting>;
  hazardReports!: Table<OfflineHazardReport>;
  tasks!: Table<OfflineTask>;

  constructor() {
    super('OfflineDB');
    this.version(1).stores({
      wildlifeSightings: '++id, species, location, severity, createdAt, synced',
      hazardReports: '++id, title, severity, priority, status, createdAt, synced',
      tasks: '++id, title, task_type, priority, status, due_date, synced'
    });
  }
}

export const offlineDB = new OfflineDB();