import { useState, useEffect, useMemo } from "react";
import { WorkItem, Category } from "../../../types";
import { auth, db, storage } from "../../../lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";

export function useDevOrganizer() {
  const [user, setUser] = useState<any>(null);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [activeTab, setActiveTab] = useState<"works" | "categories">("works");
  const [filterInResume, setFilterInResume] = useState<"all" | "yes" | "no">("all");
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [devSearchQuery, setDevSearchQuery] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ 
    category: "", subCategory: "", role: "", inResume: "", year: "", group: "", 
    groupAction: "add", categoryAction: "add", subCategoryAction: "add" 
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 5000);
  };

  const alert = (msg: string) => showFeedback(msg);

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Erro no redirect do login:", error);
      if (error.code === "auth/unauthorized-domain") {
        alert(
          `Erro: O domínio "${window.location.hostname}" não está autorizado no Firebase. Adicione-o na aba "Authentication > Settings > Authorized Domains" no console do Firebase.`,
        );
      } else {
        alert("Erro no login: " + error.message);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const uWorks = onSnapshot(collection(db, "works"), (snapshot) => {
      setWorks(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as WorkItem),
      );
    });

    const uCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Category),
      );
    });

    return () => {
      uWorks();
      uCats();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && window.self === window.top) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/unauthorized-domain") {
        alert(
          `Erro: O domínio "${window.location.hostname}" não está autorizado no Firebase. Adicione-o na aba "Authentication > Settings > Authorized Domains" no console do Firebase.`,
        );
      } else {
        alert("Erro no login: " + error.message);
      }
    }
  };

  const handleSeedData = async () => {
    try {
      const predefinedCategories = [
        { id: "cinema_longa", name: "Cinema", subcategories: ["Longa", "Curta"] },
        { id: "jornalismo", name: "Jornalismo", subcategories: ["Grande Reportagem", "Reportagem", "Série"] },
        { id: "institucional", name: "Institucional", subcategories: [] },
        { id: "programa_tv", name: "Programa de TV", subcategories: [] },
        { id: "transmissao", name: "Transmissões", subcategories: ["Eventos", "Shows", "Videoaulas"] },
        { id: "clipes", name: "Clipes Musicais", subcategories: [] },
      ];

      for (const c of predefinedCategories) {
        if (!categories.find((cat) => cat.name === c.name)) {
          await addDoc(collection(db, "categories"), c);
        }
      }

      alert("Sementeamento inicial concluído. Verifique o banco para as submissões.");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork) return;

    try {
      const dataToSave = { ...editingWork };
      if (!dataToSave.title || !dataToSave.category) {
        alert("Título e Categoria são obrigatórios.");
        return;
      }
      if (!dataToSave.id) {
        dataToSave.createdAt = Date.now();
        dataToSave.updatedAt = Date.now();
        await addDoc(collection(db, "works"), dataToSave);
      } else {
        dataToSave.updatedAt = Date.now();
        const id = dataToSave.id;
        delete (dataToSave as any).id;
        await updateDoc(doc(db, "works", id), dataToSave);
      }
      setEditingWork(null);
    } catch (error: any) {
      alert("Erro ao salvar trabalho: " + error.message);
    }
  };

  const handleDeleteWork = async (id: string) => {
    try {
      await deleteDoc(doc(db, "works", id));
      setSelectedWorks((prev) => prev.filter(wid => wid !== id));
    } catch (error: any) {
      alert("Erro ao excluir trabalho: " + error.message);
    }
  };

  const handleBulkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates: any = {};
      
      if (bulkEditData.role) updates.role = bulkEditData.role;
      if (bulkEditData.inResume === "yes") updates.inResume = true;
      if (bulkEditData.inResume === "no") updates.inResume = false;
      if (bulkEditData.year) updates.year = bulkEditData.year;

      if (Object.keys(updates).length === 0 && !bulkEditData.category && !bulkEditData.subCategory && !bulkEditData.group) {
        alert("Nenhum campo preenchido para atualização em lote.");
        return;
      }

      const getNewCommaSeparatedValue = (currentVal: string | undefined, newVal: string, action: string) => {
        let items = (currentVal || "").split(",").map(i => i.trim()).filter(Boolean);
        const newItems = newVal.split(",").map(i => i.trim()).filter(Boolean);
        if (action === "replace") {
          return newVal;
        } else if (action === "add") {
          newItems.forEach(ni => { if (!items.includes(ni)) items.push(ni); });
          return items.join(", ");
        } else if (action === "remove") {
          items = items.filter(i => !newItems.includes(i));
          return items.join(", ");
        }
        return currentVal || "";
      };

      let count = 0;
      for (const id of selectedWorks) {
        const w = works.find(x => x.id === id);
        if (w) {
          const finalUpdates: any = { ...updates };
          
          if (bulkEditData.category) finalUpdates.category = getNewCommaSeparatedValue(w.category, bulkEditData.category, bulkEditData.categoryAction);
          if (bulkEditData.subCategory) finalUpdates.subCategory = getNewCommaSeparatedValue(w.subCategory, bulkEditData.subCategory, bulkEditData.subCategoryAction);
          if (bulkEditData.group) finalUpdates.group = getNewCommaSeparatedValue(w.group, bulkEditData.group, bulkEditData.groupAction);

          await updateDoc(doc(db, "works", id), { ...finalUpdates, updatedAt: Date.now() });
          count++;
        }
      }
      setSelectedWorks([]);
      setBulkEditOpen(false);
      setBulkEditData({ category: "", subCategory: "", role: "", inResume: "", year: "", group: "", groupAction: "add", categoryAction: "add", subCategoryAction: "add" });
      alert(`${count} trabalhos atualizados em lote.`);
    } catch (err: any) {
      alert("Erro na atualização em lote: " + err.message);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingWork) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("O arquivo deve ter no máximo 5MB.");
      return;
    }

    try {
      setUploadingMedia(true);
      setUploadProgress(0);

      const fileExt = file.name.split(".").pop();
      const fileName = `media/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Erro no upload: " + error.message);
          setUploadingMedia(false);
          if (e.target) e.target.value = '';
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setEditingWork({
            ...editingWork,
            images: [...(editingWork.images || []), downloadUrl],
          });
          setUploadingMedia(false);
          setUploadProgress(0);
          if (e.target) e.target.value = '';
        },
      );
    } catch (err: any) {
      alert("Erro ao preparar upload: " + err.message);
      setUploadingMedia(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const dataToSave = { ...editingCategory };
      if (!dataToSave.name || !dataToSave.name.trim()) {
        alert("Nome da categoria é obrigatório.");
        return;
      }

      dataToSave.name = dataToSave.name.trim();

      const existing = categories.find(
        (c) => c.name.trim().toLowerCase() === dataToSave.name.toLowerCase(),
      );

      if (!dataToSave.id) {
        if (existing) {
          const updatedSubcats = Array.from(
            new Set([
              ...(existing.subcategories || []),
              ...(dataToSave.subcategories || []),
            ]),
          );
          await updateDoc(doc(db, "categories", existing.id), {
            subcategories: updatedSubcats,
          });
          alert("Subcategorias adicionadas à categoria existente!");
        } else {
          await addDoc(collection(db, "categories"), {
            name: dataToSave.name,
            subcategories: dataToSave.subcategories || [],
          });
          alert("Nova categoria criada com sucesso!");
        }
      } else {
        const id = dataToSave.id;
        delete (dataToSave as any).id;
        await updateDoc(doc(db, "categories", id), {
          name: dataToSave.name,
          subcategories: dataToSave.subcategories || [],
        });
        alert("Categoria atualizada com sucesso!");
      }
      setEditingCategory(null);
    } catch (error: any) {
      alert("Erro ao salvar categoria: " + error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (error: any) {
      alert("Erro ao excluir categoria: " + error.message);
    }
  };

  const handleExportData = () => {
    const data = {
      works,
      categories,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-curriculo-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        let importedWorks = 0;
        let importedCats = 0;

        if (data.works && Array.isArray(data.works)) {
          for (const item of data.works) {
            const { id, ...workData } = item;
            const existing = works.find(w => w.title.toLowerCase() === workData.title.toLowerCase() && w.category === workData.category);
            if (!existing) {
              const cleanWorkData = {
                title: workData.title || "",
                category: workData.category || "",
                subCategory: workData.subCategory || "",
                year: workData.year || "",
                role: workData.role || "",
                description: String(workData.description || ""),
                url: workData.url || "",
                images: Array.isArray(workData.images) ? workData.images : [],
                inResume: Boolean(workData.inResume),
                group: workData.group || "",
                createdAt: typeof workData.createdAt === 'number' ? workData.createdAt : Date.now(),
                updatedAt: typeof workData.updatedAt === 'number' ? workData.updatedAt : Date.now(),
              };
              try {
                await addDoc(collection(db, "works"), cleanWorkData);
                importedWorks++;
              } catch (err: any) {
                console.error("Failed to add work:", cleanWorkData, err);
                throw new Error("Erro ao importar o trabalho '" + cleanWorkData.title + "': " + err.message);
              }
            }
          }
        }

        if (data.categories && Array.isArray(data.categories)) {
          for (const item of data.categories) {
            const { id, ...catData } = item;
            const existing = categories.find(c => c.name.toLowerCase() === catData.name.toLowerCase());
            if (!existing) {
              const cleanCatData = {
                name: catData.name || "",
                subcategories: Array.isArray(catData.subcategories) ? catData.subcategories : [],
              };
              try {
                await addDoc(collection(db, "categories"), cleanCatData);
                importedCats++;
              } catch (err: any) {
                console.error("Failed to add category:", cleanCatData, err);
                throw new Error("Erro ao importar a categoria '" + cleanCatData.name + "': " + err.message);
              }
            } else {
              const updatedSubcats = Array.from(
                new Set([...existing.subcategories, ...catData.subcategories]),
              );
              await updateDoc(doc(db, "categories", existing.id), {
                subcategories: updatedSubcats,
              });
            }
          }
        }

        alert(`Importação concluída! ${importedWorks} trabalhos e ${importedCats} categorias importados.`);
        e.target.value = '';
      } catch (err: any) {
        alert("Erro ao ler/importar o arquivo: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>();
    works.forEach((w) => {
      if (w.group && w.group.trim()) {
        w.group.split(',').forEach(g => {
          const trimmed = g.trim();
          if (trimmed) groups.add(trimmed);
        });
      }
    });
    return Array.from(groups).sort();
  }, [works]);

  return {
    user,
    works,
    categories,
    activeTab,
    setActiveTab,
    filterInResume,
    setFilterInResume,
    editingWork,
    setEditingWork,
    editingCategory,
    setEditingCategory,
    newImageUrl,
    setNewImageUrl,
    newSubcategoryName,
    setNewSubcategoryName,
    devSearchQuery,
    setDevSearchQuery,
    feedbackMsg,
    setFeedbackMsg,
    selectedWorks,
    setSelectedWorks,
    bulkEditOpen,
    setBulkEditOpen,
    bulkEditData,
    setBulkEditData,
    uploadingMedia,
    uploadProgress,
    uniqueGroups,
    handleLogin,
    handleSeedData,
    handleSaveWork,
    handleDeleteWork,
    handleBulkEditSubmit,
    handleMediaUpload,
    handleSaveCategory,
    handleDeleteCategory,
    handleExportData,
    handleImportData,
  };
}
