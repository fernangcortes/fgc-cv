import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WorkItem, Category } from '../types';

/**
 * Hook for subscribing to Firestore collections (works + categories).
 * Returns live data with automatic cleanup on unmount.
 */
export function useFirestoreData() {
  const [dbWorks, setDbWorks] = useState<WorkItem[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubWorks = onSnapshot(collection(db, 'works'), (snap) =>
      setDbWorks(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as WorkItem)),
    );
    const unsubCats = onSnapshot(collection(db, 'categories'), (snap) =>
      setDbCategories(
        snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Category),
      ),
    );
    return () => {
      unsubWorks();
      unsubCats();
    };
  }, []);

  const worksInResume = dbWorks.filter((w) => w.inResume);

  const dbUniqueCategories = Array.from(
    new Set(
      worksInResume.flatMap((w) =>
        w.category ? w.category.split(',').map((c) => c.trim()).filter(Boolean) : []
      )
    )
  ).sort();

  const dbUniqueGroups = Array.from(
    new Set(
      worksInResume.flatMap((w) =>
        w.group ? w.group.split(',').map((g) => g.trim()).filter(Boolean) : []
      )
    )
  ).sort();

  return { dbWorks, dbCategories, worksInResume, dbUniqueCategories, dbUniqueGroups };
}
