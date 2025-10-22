import { offlineDB, OfflineWildlifeSighting, OfflineHazardReport, OfflineTask } from './offline-db';

// Definišite tipove za podatke koji se šalju (bez polja koja se generišu automatski)
type WildlifeSightingInput = Omit<OfflineWildlifeSighting, 'id' | 'createdAt' | 'updatedAt' | 'synced'>;
type HazardReportInput = Omit<OfflineHazardReport, 'id' | 'createdAt' | 'updatedAt' | 'synced'>;

class SyncService {
  private isSyncing = false;

  // Dodaj novo zapažanje divljači
  async addWildlifeSighting(sighting: WildlifeSightingInput): Promise<void> {
    const offlineSighting: OfflineWildlifeSighting = {
      ...sighting,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false
    };

    await offlineDB.wildlifeSightings.add(offlineSighting);
    
    // Pokušaj sinhronizaciju ako je online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await this.syncWildlifeSightings();
    }
  }

  // Dodaj novi izvještaj o opasnosti
  async addHazardReport(report: HazardReportInput): Promise<void> {
    const offlineReport: OfflineHazardReport = {
      ...report,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false
    };

    await offlineDB.hazardReports.add(offlineReport);
    
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await this.syncHazardReports();
    }
  }

  // Ažuriraj zadatak
  async updateTaskStatus(taskId: number, status: 'pending' | 'in_progress' | 'completed'): Promise<void> {
    const task = await offlineDB.tasks.get(taskId);
    if (task) {
      const updates: Partial<OfflineTask> = {
        status,
        updatedAt: new Date(),
        synced: false
      };

      if (status === 'completed') {
        updates.completed_at = new Date();
      }

      await offlineDB.tasks.update(taskId, updates);

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await this.syncTasks();
      }
    }
  }

  // Sinhronizuj sve offline podatke
  async syncAllData(): Promise<void> {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    try {
      await Promise.all([
        this.syncWildlifeSightings(),
        this.syncHazardReports(),
        this.syncTasks()
      ]);
    } catch (error) {
      console.error('Greška pri sinhronizaciji:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncWildlifeSightings(): Promise<void> {
    try {
      // Ispravan način za filtriranje u Dexie
      const unsyncedSightings = await offlineDB.wildlifeSightings
        .filter(sighting => !sighting.synced)
        .toArray();

      for (const sighting of unsyncedSightings) {
        try {
          // Ovdje dodajte poziv vašem API endpointu
          // const response = await fetch('/api/wildlife-sightings', {
          //   method: 'POST',
          //   body: JSON.stringify(sighting),
          //   headers: { 'Content-Type': 'application/json' }
          // });
          
          // if (response.ok) {
          //   // Označi kao sinhronizovano
          //   await offlineDB.wildlifeSightings.update(sighting.id!, { synced: true });
          // }
          
          // Simuliraj uspješnu sinhronizaciju za demo
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Oznaci kao sinhronizovano
          if (sighting.id) {
            await offlineDB.wildlifeSightings.update(sighting.id, { synced: true });
          }
          
        } catch (error) {
          console.error('Greška pri sinhronizaciji zapažanja:', error);
          continue;
        }
      }
    } catch (error) {
      console.error('Greška pri dobijanju nesinhronizovanih zapažanja:', error);
      throw error;
    }
  }

  private async syncHazardReports(): Promise<void> {
    try {
      const unsyncedReports = await offlineDB.hazardReports
        .filter(report => !report.synced)
        .toArray();

      for (const report of unsyncedReports) {
        try {
          // API poziv za hazard reports
          // const response = await fetch('/api/hazard-reports', {
          //   method: 'POST',
          //   body: JSON.stringify(report),
          //   headers: { 'Content-Type': 'application/json' }
          // });
          
          // if (response.ok) {
          //   await offlineDB.hazardReports.update(report.id!, { synced: true });
          // }
          
          // Simulacija
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (report.id) {
            await offlineDB.hazardReports.update(report.id, { synced: true });
          }
        } catch (error) {
          console.error('Greška pri sinhronizaciji izvještaja:', error);
          continue;
        }
      }
    } catch (error) {
      console.error('Greška pri dobijanju nesinhronizovanih izvještaja:', error);
      throw error;
    }
  }

  private async syncTasks(): Promise<void> {
    try {
      const unsyncedTasks = await offlineDB.tasks
        .filter(task => !task.synced)
        .toArray();

      for (const task of unsyncedTasks) {
        try {
          // API poziv za zadatke
          // const response = await fetch(`/api/tasks/${task.id}`, {
          //   method: 'PUT',
          //   body: JSON.stringify(task),
          //   headers: { 'Content-Type': 'application/json' }
          // });
          
          // if (response.ok) {
          //   await offlineDB.tasks.update(task.id!, { synced: true });
          // }
          
          // Simulacija
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (task.id) {
            await offlineDB.tasks.update(task.id, { synced: true });
          }
        } catch (error) {
          console.error('Greška pri sinhronizaciji zadatka:', error);
          continue;
        }
      }
    } catch (error) {
      console.error('Greška pri dobijanju nesinhronizovanih zadataka:', error);
      throw error;
    }
  }

  // Dobij broj ne-sinhronizovanih promjena
  async getPendingSyncCount(): Promise<number> {
    try {
      const [sightings, reports, tasks] = await Promise.all([
        offlineDB.wildlifeSightings.filter(sighting => !sighting.synced).count(),
        offlineDB.hazardReports.filter(report => !report.synced).count(),
        offlineDB.tasks.filter(task => !task.synced).count()
      ]);

      return sightings + reports + tasks;
    } catch (error) {
      console.error('Greška pri dobijanju broja pending sinhronizacija:', error);
      return 0;
    }
  }

  // Dobij sve offline podatke za prikaz
  async getAllOfflineData() {
    try {
      const [sightings, reports, tasks] = await Promise.all([
        offlineDB.wildlifeSightings.toArray(),
        offlineDB.hazardReports.toArray(),
        offlineDB.tasks.toArray()
      ]);

      return { sightings, reports, tasks };
    } catch (error) {
      console.error('Greška pri dobijanju offline podataka:', error);
      return { sightings: [], reports: [], tasks: [] };
    }
  }

  // Obriši sve offline podatke (za cleanup)
  async clearAllOfflineData(): Promise<void> {
    try {
      await Promise.all([
        offlineDB.wildlifeSightings.clear(),
        offlineDB.hazardReports.clear(),
        offlineDB.tasks.clear()
      ]);
    } catch (error) {
      console.error('Greška pri brisanju offline podataka:', error);
      throw error;
    }
  }

  // Dodaj testne zadatke za demonstraciju
  async addSampleTasks(): Promise<void> {
    const sampleTasks: Omit<OfflineTask, 'id' | 'createdAt' | 'updatedAt' | 'synced'>[] = [
      {
        title: "Jutarnji pregled terena",
        description: "Obilazak istočnog dijela parka",
        task_type: "daily",
        priority: "medium",
        status: "pending",
        due_date: new Date().toISOString().split('T')[0]
      },
      {
        title: "Nedjeljno čišćenje staza",
        description: "Čišćenje glavnih šetnica",
        task_type: "weekly",
        priority: "low",
        status: "pending",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    for (const task of sampleTasks) {
      const offlineTask: OfflineTask = {
        ...task,
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: false
      };
      await offlineDB.tasks.add(offlineTask);
    }
  }
}

export const syncService = new SyncService();