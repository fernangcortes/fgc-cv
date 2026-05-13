import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  LogIn,
  Image as ImageIcon,
  Save,
  X,
  PlusCircle,
  Database,
  Terminal,
} from "lucide-react";
import { WorkItem, Category } from "../types";
import {
  CINEMA_LONGA,
  CINEMA_CURTA,
  JORNALISMO_GRANDE_REPORTAGEM,
  JORNALISMO_REPORTAGEM,
  JORNALISMO_SERIE,
  PROGRAMA_TV,
  INSTITUCIONAL,
  TRANSMISSAO_EVENTOS,
  TRANSMISSAO_SHOWS,
  TRANSMISSAO_VIDEOAULAS,
  MUSIC_VIDEOS,
} from "../constants";
import { auth, db, storage } from "../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import { Search } from "lucide-react";
import { isMatch } from "../utils/search";



export default function DevOrganizer() {
  const [user, setUser] = useState<any>(null);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [activeTab, setActiveTab] = useState<"works" | "categories">("works");
  const [filterInResume, setFilterInResume] = useState<"all" | "yes" | "no">(
    "all",
  );
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [devSearchQuery, setDevSearchQuery] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ category: "", subCategory: "", role: "", inResume: "", year: "", group: "", groupAction: "add", categoryAction: "add", subCategoryAction: "add" });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 5000);
  };

  const alert = (msg: string) => showFeedback(msg);

  useEffect(() => {
    // Check for redirect result first
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
      // Se não estiver dentro de um iframe (como no AI Studio) e for mobile, usa redirect para evitar bloqueio de popup
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
    // confirm is blocked by sandbox, skipping
    try {
      const predefinedCategories = [
        {
          id: "cinema_longa",
          name: "Cinema",
          subcategories: ["Longa", "Curta"],
        },
        {
          id: "jornalismo",
          name: "Jornalismo",
          subcategories: ["Grande Reportagem", "Reportagem", "Série"],
        },
        { id: "institucional", name: "Institucional", subcategories: [] },
        { id: "programa_tv", name: "Programa de TV", subcategories: [] },
        {
          id: "transmissao",
          name: "Transmissões",
          subcategories: ["Eventos", "Shows", "Videoaulas"],
        },
        { id: "clipes", name: "Clipes Musicais", subcategories: [] },
      ];

      for (const c of predefinedCategories) {
        if (!categories.find((cat) => cat.name === c.name)) {
          await addDoc(collection(db, "categories"), c);
        }
      }

      alert(
        "Sementeamento inicial concluído. Verifique o banco para as submissões.",
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork) return;

    try {
      const dataToSave = { ...editingWork };
      // Validation
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
    // confirm is blocked by sandbox, skipping
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
      const fileName = `media/${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Erro no upload: " + error.message);
          setUploadingMedia(false);
          if (e.target) e.target.value = ''; // Reset input
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setEditingWork({
            ...editingWork,
            images: [...(editingWork.images || []), downloadUrl],
          });
          setUploadingMedia(false);
          setUploadProgress(0);
          if (e.target) e.target.value = ''; // Reset input
        },
      );
    } catch (err: any) {
      alert("Erro ao preparar upload: " + err.message);
      setUploadingMedia(false);
      if (e.target) e.target.value = ''; // Reset input
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
    // confirm is blocked by sandbox, skipping
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

    // confirm is blocked by sandbox, skipping

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
        // Clear input so same file can be selected again
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

  if (!user) {
    return (
      <>
        {feedbackMsg && (
          <div className="fixed bottom-4 right-4 z-50 bg-stone-900 dark:bg-zinc-950 border border-stone-800 text-stone-100 rounded-lg shadow-lg px-4 py-3 flex items-center justify-between max-w-md w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-sm font-medium pr-4">{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg("")} className="text-stone-400 dark:text-zinc-500 hover:text-stone-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl border border-stone-200 dark:border-white/10">
        <Terminal className="w-12 h-12 text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
          Dev Organizer Dashboard
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 mb-6 text-center max-w-sm">
          Faça login para gerenciar trabalhos, categorias e a biblioteca
          audiovisual.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 bg-stone-900 dark:bg-zinc-950 text-white px-6 py-3 rounded-lg hover:bg-stone-800 dark:hover:bg-zinc-200 dark:hover:bg-zinc-200 transition-colors font-medium"
        >
          <LogIn className="w-4 h-4" /> Entrar com Google
        </button>
      </div>
      </>
    );
  }

  return (
    <>
      <datalist id="uniqueGroupsList">
        {uniqueGroups.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
      {feedbackMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-stone-900 dark:bg-zinc-950 border border-stone-800 text-stone-100 rounded-lg shadow-lg px-4 py-3 flex items-center justify-between max-w-md w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="text-sm font-medium pr-4">{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg("")} className="text-stone-400 dark:text-zinc-500 hover:text-stone-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl border border-stone-200 dark:border-white/10 shadow-sm overflow-hidden min-h-[600px]">
      {/* Admin Header */}
      <div className="flex justify-between items-center p-6 border-b border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-zinc-800/50 dark:bg-zinc-800/30 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Dev Dashboard</h2>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium flex-wrap">
          <div className="flex items-center gap-2 border-r border-stone-200 dark:border-white/10 pr-4">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-3 py-1.5 text-stone-600 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800/50 hover:text-stone-900 dark:hover:text-white transition-colors shadow-sm"
              title="Exportar dados para JSON"
            >
              <Download className="w-4 h-4" /> Exportar Backup
            </button>
            <label className="flex items-center gap-2 px-3 py-1.5 text-stone-600 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800/50 hover:text-stone-900 dark:hover:text-white transition-colors shadow-sm cursor-pointer" title="Importar dados de um JSON">
              <Upload className="w-4 h-4" /> Importar Backup
              <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
            </label>
          </div>
          <span className="text-stone-500 dark:text-zinc-400">{user.email}</span>
          <button
            onClick={() => auth.signOut()}
            className="text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-zinc-800/50">
        <button
          onClick={() => setActiveTab("works")}
          className={`px-6 py-4 font-medium text-sm transition-colors relative ${activeTab === "works" ? "text-emerald-700" : "text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white"}`}
        >
          Trabalhos
          {activeTab === "works" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-4 font-medium text-sm transition-colors relative ${activeTab === "categories" ? "text-emerald-700" : "text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white"}`}
        >
          Categorias & Subcategorias
          {activeTab === "categories" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>
          )}
        </button>
      </div>

      {/* Main View Area */}
      <div className="p-6 bg-stone-50 dark:bg-zinc-800/50">
        {activeTab === "works" && !editingWork && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-stone-800 dark:text-zinc-100">
                Meus Trabalhos
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      let count = 0;
                      // Use top-level constants
                      const arraysToMigrate = [
                        { items: CINEMA_LONGA, cat: "Cinema", sub: "Longa" },
                        { items: CINEMA_CURTA, cat: "Cinema", sub: "Curta" },
                        {
                          items: JORNALISMO_GRANDE_REPORTAGEM,
                          cat: "Jornalismo & Docs",
                          sub: "Grande Reportagem",
                        },
                        {
                          items: JORNALISMO_REPORTAGEM,
                          cat: "Jornalismo & Docs",
                          sub: "Reportagem",
                        },
                        {
                          items: JORNALISMO_SERIE,
                          cat: "Jornalismo & Docs",
                          sub: "Série",
                        },
                        { items: PROGRAMA_TV, cat: "Programa de TV", sub: "" },
                        { items: INSTITUCIONAL, cat: "Institucional", sub: "" },
                        {
                          items: TRANSMISSAO_EVENTOS,
                          cat: "Transmissão & Ao Vivo",
                          sub: "Eventos",
                        },
                        {
                          items: TRANSMISSAO_SHOWS,
                          cat: "Transmissão & Ao Vivo",
                          sub: "Shows",
                        },
                        {
                          items: TRANSMISSAO_VIDEOAULAS,
                          cat: "Videoaulas",
                          sub: "Goiás Tec",
                        },
                        {
                          items: MUSIC_VIDEOS,
                          cat: "Clipes Musicais",
                          sub: "",
                        },
                      ];

                      for (const { items, cat, sub } of arraysToMigrate) {
                        for (const item of items || []) {
                          // Check if it exists
                          const exists = works.find(
                            (w) =>
                              w.title.toLowerCase() ===
                              (
                                item.title ||
                                item.movie ||
                                item.name ||
                                ""
                              ).toLowerCase(),
                          );
                          if (!exists) {
                            const toSave: any = {
                              title: String(
                                item.title || item.movie || item.name || "",
                              ),
                              category: cat,
                              year: String(item.year || ""),
                              role: String(item.role || ""),
                              description: String(
                                item.description ||
                                  item.festival ||
                                  item.producer ||
                                  "",
                              ),
                              subCategory: sub,
                              url: String(
                                item.url ||
                                  item.links?.[0]?.url ||
                                  item.videoUrl ||
                                  "",
                              ),
                              images: Array.isArray(item.images)
                                ? item.images.map(String)
                                : item.image
                                  ? [String(item.image)]
                                  : [],
                              inResume: true,
                              createdAt: Date.now(),
                              updatedAt: Date.now(),
                            };
                            await addDoc(collection(db, "works"), toSave);
                            count++;
                          } else {
                            if (!exists.inResume) {
                              await updateDoc(doc(db, "works", exists.id), {
                                inResume: true,
                                category: cat,
                                subCategory: sub,
                              });
                              count++;
                            }
                          }
                        }
                      }

                      alert(
                        `Sucesso! ${count} trabalhos das constantes foram sincronizados no banco de dados e adicionados ao currículo.`,
                      );
                    } catch (e: any) {
                      alert("Erro ao sincronizar: " + e.message);
                    }
                  }}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm font-medium text-sm"
                >
                  <Database className="w-4 h-4" /> Sincronizar com constants.ts
                </button>
                <button
                  onClick={() =>
                    setEditingWork({
                      id: "",
                      title: "",
                      category: "",
                      year: "",
                      role: "",
                      description: "",
                      url: "",
                      group: "",
                      images: [],
                      createdAt: 0,
                      updatedAt: 0,
                    })
                  }
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm"
                >
                  <Plus className="w-4 h-4" /> Adicionar Trabalho
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pr-1 gap-4 mb-2">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={devSearchQuery}
                    onChange={(e) => setDevSearchQuery(e.target.value)}
                    placeholder="Buscar em trabalhos dev..."
                    className="w-full bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-stone-600 dark:text-zinc-300 placeholder:text-stone-400 dark:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                  />
                  {devSearchQuery && (
                    <button
                      onClick={() => setDevSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 dark:hover:text-zinc-300 dark:hover:text-zinc-300 transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <select
                  className="bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 text-stone-700 dark:text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 shadow-sm"
                  value={filterInResume}
                  onChange={(e: any) => setFilterInResume(e.target.value)}
                >
                  <option value="all">Todos os Trabalhos</option>
                  <option value="yes">No currículo</option>
                  <option value="no">Fora do currículo</option>
                </select>
              </div>

              {/* Bulk actions */}
              <div className="flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-stone-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-stone-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                    onChange={(e) => {
                      const filteredWorks = works.filter((w) => {
                        let matchFilter = true;
                        if (filterInResume === "yes") matchFilter = w.inResume === true;
                        if (filterInResume === "no") matchFilter = w.inResume !== true;
                        return matchFilter && isMatch(w, devSearchQuery);
                      });
                      if (e.target.checked) {
                        setSelectedWorks(filteredWorks.map((w) => w.id));
                      } else {
                        setSelectedWorks([]);
                      }
                    }}
                    checked={
                      works.filter((w) => {
                        let matchFilter = true;
                        if (filterInResume === "yes") matchFilter = w.inResume === true;
                        if (filterInResume === "no") matchFilter = w.inResume !== true;
                        return matchFilter && isMatch(w, devSearchQuery);
                      }).length > 0 &&
                      works.filter((w) => {
                        let matchFilter = true;
                        if (filterInResume === "yes") matchFilter = w.inResume === true;
                        if (filterInResume === "no") matchFilter = w.inResume !== true;
                        return matchFilter && isMatch(w, devSearchQuery);
                      }).every((w) => selectedWorks.includes(w.id))
                    }
                  />
                  <span className="text-sm font-medium text-stone-700 dark:text-zinc-200">
                    {selectedWorks.length > 0
                      ? `${selectedWorks.length} selecionados`
                      : "Selecionar todos visíveis"}
                  </span>
                </div>
                {selectedWorks.length > 0 && (
                  <button
                    onClick={() => setBulkEditOpen(true)}
                    className="text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar em lote
                  </button>
                )}
              </div>

              {works.filter((w) => {
                let matchFilter = true;
                if (filterInResume === "yes") matchFilter = w.inResume === true;
                if (filterInResume === "no") matchFilter = w.inResume !== true;
                return matchFilter && isMatch(w, devSearchQuery);
              }).length === 0 ? (
                <div className="p-8 text-center text-stone-400 dark:text-zinc-500 font-medium">
                  {devSearchQuery ? 'Nenhum trabalho encontrado para a busca atual.' : 'Nenhum trabalho encontrado para este filtro.'}
                </div>
              ) : (
                works
                  .filter((w) => {
                    let matchFilter = true;
                    if (filterInResume === "yes") matchFilter = w.inResume === true;
                    if (filterInResume === "no") matchFilter = w.inResume !== true;
                    return matchFilter && isMatch(w, devSearchQuery);
                  })
                  .map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-xl shadow-sm"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-stone-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500 ml-1"
                        checked={selectedWorks.includes(w.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedWorks([...selectedWorks, w.id]);
                          else setSelectedWorks(selectedWorks.filter((id) => id !== w.id));
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-900 dark:text-white text-base">
                          {w.title}{" "}
                          {w.inResume && (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase ml-2">
                              No Currículo
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 uppercase tracking-wide font-mono">
                          {categories.find((c) => c.id === w.category)?.name ||
                            w.category}{" "}
                          {w.subCategory ? ` > ${w.subCategory}` : ""}
                          {w.role ? ` • ${w.role}` : ""}
                          {w.group ? ` • Grupos: ${w.group}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingWork(w)}
                          className="p-2 text-stone-400 dark:text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWork(w.id)}
                          className="p-2 text-stone-400 dark:text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
            
            {/* Bulk Edit Modal */}
            {bulkEditOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-stone-900 dark:bg-zinc-950/50 backdrop-blur-sm"
                  onClick={() => setBulkEditOpen(false)}
                />
                <div className="relative bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <form onSubmit={handleBulkEditSubmit} className="p-6">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                        Editar {selectedWorks.length} trabalhos
                      </h3>
                      <button
                        type="button"
                        onClick={() => setBulkEditOpen(false)}
                        className="text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 dark:hover:text-zinc-300 dark:hover:text-zinc-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm text-stone-500 dark:text-zinc-400 bg-stone-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-stone-200 dark:border-white/10">
                        Preencha apenas os campos que deseja alterar em <b>todos os {selectedWorks.length} trabalhos selecionados</b>. Campos em branco não serão modificados.
                      </p>
                      
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-1">
                          Categoria
                        </label>
                        <div className="flex bg-stone-50 dark:bg-zinc-800/50 rounded-lg overflow-hidden border border-stone-200 dark:border-white/10 focus-within:border-emerald-500">
                          <select 
                            className="bg-transparent border-none outline-none py-2 px-2 text-sm text-stone-600 dark:text-zinc-300 font-medium"
                            value={bulkEditData.categoryAction}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, categoryAction: e.target.value })}
                          >
                            <option value="add">Adicionar</option>
                            <option value="remove">Remover</option>
                            <option value="replace">Substituir</option>
                          </select>
                          <input
                            type="text"
                            list="editingCategoryList"
                            placeholder="-- Não alterar -- (ou separe por vírgula)"
                            className="flex-1 bg-transparent border-none outline-none px-3 py-2"
                            value={bulkEditData.category}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, category: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-1">
                          Subcategoria
                        </label>
                        <div className="flex bg-stone-50 dark:bg-zinc-800/50 rounded-lg overflow-hidden border border-stone-200 dark:border-white/10 focus-within:border-emerald-500">
                          <select 
                            className="bg-transparent border-none outline-none py-2 px-2 text-sm text-stone-600 dark:text-zinc-300 font-medium"
                            value={bulkEditData.subCategoryAction}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, subCategoryAction: e.target.value })}
                          >
                            <option value="add">Adicionar</option>
                            <option value="remove">Remover</option>
                            <option value="replace">Substituir</option>
                          </select>
                          <input
                            type="text"
                            list="editingSubCategoryList"
                            placeholder="-- Não alterar -- (ou separe por vírgula)"
                            className="flex-1 bg-transparent border-none outline-none px-3 py-2"
                            value={bulkEditData.subCategory}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, subCategory: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-1">
                          Ano
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 2023"
                          className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                          value={bulkEditData.year}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, year: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-1">
                          Função / Papel
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Diretor, Editor, Roteirista..."
                          className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                          value={bulkEditData.role}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, role: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-1">
                          Grupo
                        </label>
                        <div className="flex bg-stone-50 dark:bg-zinc-800/50 rounded-lg overflow-hidden border border-stone-200 dark:border-white/10 focus-within:border-emerald-500">
                          <select 
                            className="bg-transparent border-none outline-none py-2 px-2 text-sm text-stone-600 dark:text-zinc-300 font-medium"
                            value={bulkEditData.groupAction}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, groupAction: e.target.value })}
                          >
                            <option value="add">Adicionar</option>
                            <option value="remove">Remover</option>
                            <option value="replace">Substituir</option>
                          </select>
                          <input
                            type="text"
                            list="uniqueGroupsList"
                            placeholder="Agrupar items (Ex: Saberes)"
                            className="flex-1 bg-transparent border-none outline-none px-3 py-2"
                            value={bulkEditData.group}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, group: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-1">
                          Mostrar no Currículo
                        </label>
                        <select
                          className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                          value={bulkEditData.inResume}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, inResume: e.target.value })}
                        >
                          <option value="">-- Não alterar --</option>
                          <option value="yes">Sim</option>
                          <option value="no">Não</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setBulkEditOpen(false)}
                        className="px-4 py-2 font-medium text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                      >
                        Aplicar a {selectedWorks.length}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </>
        )}

        {activeTab === "works" && editingWork && (
          <form
            onSubmit={handleSaveWork}
            className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-6 border border-stone-200 dark:border-white/10 rounded-xl shadow-sm"
          >
            <div className="flex justify-between items-center mb-6 border-b border-stone-100 dark:border-white/5 pb-4">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                {editingWork.id ? "Editar Trabalho" : "Novo Trabalho"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="p-2 text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Título do Trabalho *
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  value={editingWork.title}
                  onChange={(e) =>
                    setEditingWork({ ...editingWork, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Categoria *
                </label>
                <div className="text-xs text-stone-500 mb-2">Para múltiplas, use vírgula (ex: Cinema, Séries)</div>
                <input
                  required
                  type="text"
                  list="editingCategoryList"
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500"
                  value={editingWork.category}
                  onChange={(e) =>
                    setEditingWork({ ...editingWork, category: e.target.value })
                  }
                />
                <datalist id="editingCategoryList">
                  {Array.from(
                    new Set([
                      ...categories.map((c) => c.name),
                      ...works.flatMap((w) => w.category ? w.category.split(',').map(c => c.trim()) : []),
                    ]),
                  )
                    .filter(Boolean)
                    .sort()
                    .map((name, idx) => (
                      <option key={idx} value={name} />
                    ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Subcategoria (Opcional)
                </label>
                <div className="text-xs text-stone-500 mb-2">Para múltiplas, use vírgula (ex: Longa, Curta)</div>
                <input
                  type="text"
                  list="editingSubCategoryList"
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500"
                  value={editingWork.subCategory || ""}
                  onChange={(e) =>
                    setEditingWork({
                      ...editingWork,
                      subCategory: e.target.value,
                    })
                  }
                />
                <datalist id="editingSubCategoryList">
                  {Array.from(
                    new Set([
                      ...(categories.find(
                        (c) =>
                          c.name.trim().toLowerCase() ===
                          (editingWork.category || "").trim().toLowerCase(),
                      )?.subcategories || []),
                      ...works
                        // we loosely match any matching category if comma-separated
                        .filter((w) => editingWork.category && w.category && w.category.includes(editingWork.category))
                        .flatMap((w) => w.subCategory ? w.subCategory.split(',').map(s => s.trim()) : []),
                    ]),
                  )
                    .filter(Boolean)
                    .sort()
                    .map((sub, idx) => (
                      <option key={idx} value={sub} />
                    ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Ano
                </label>
                <input
                  type="text"
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none"
                  value={editingWork.year || ""}
                  onChange={(e) =>
                    setEditingWork({ ...editingWork, year: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Função / Papel
                </label>
                <input
                  type="text"
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none"
                  value={editingWork.role || ""}
                  onChange={(e) =>
                    setEditingWork({ ...editingWork, role: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Link do Vídeo ou Site
                </label>
                <input
                  type="url"
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none"
                  value={editingWork.url || ""}
                  onChange={(e) =>
                    setEditingWork({ ...editingWork, url: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Descrição Curta
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-3 outline-none resize-y"
                  value={editingWork.description || ""}
                  onChange={(e) =>
                    setEditingWork({
                      ...editingWork,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                  Grupo de Agrupamento
                </label>
                <div className="text-xs text-stone-500 mb-2">Para múltiplos, use vírgula (ex: Saberes, Melhores)</div>
                <input
                  type="text"
                  list="uniqueGroupsList"
                  placeholder="Ex: Saberes (agrupa trabalhos com o mesmo grupo num carrossel)"
                  className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none"
                  value={editingWork.group || ""}
                  onChange={(e) =>
                    setEditingWork({ ...editingWork, group: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 mt-2">
                <label className="flex items-center gap-2 text-sm font-bold text-stone-700 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-stone-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-600"
                    checked={editingWork.inResume || false}
                    onChange={(e) =>
                      setEditingWork({
                        ...editingWork,
                        inResume: e.target.checked,
                      })
                    }
                  />
                  Mostrar no currículo
                </label>
              </div>
            </div>

            {/* Images Array Manager */}
            <div className="mb-8 border border-stone-200 dark:border-white/10 rounded-xl p-6 bg-stone-50 dark:bg-zinc-800/50 dark:bg-zinc-800/30">
              <div className="flex flex-col mb-4 gap-4">
                <label className="text-sm font-bold text-stone-700 dark:text-zinc-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-stone-400 dark:text-zinc-500" /> Galeria de
                  Imagens
                </label>
                <div className="flex flex-col sm:flex-row gap-4 w-full items-start sm:items-center">
                  <div className="flex-1 flex gap-2 w-full">
                    <input
                      type="url"
                      placeholder="Adicionar por URL: https://..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newImageUrl) {
                          setEditingWork({
                            ...editingWork,
                            images: [...(editingWork.images || []), newImageUrl],
                          });
                          setNewImageUrl("");
                        }
                      }}
                      className="text-xs bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-zinc-800/50 text-stone-900 dark:text-white px-3 py-1.5 rounded-lg font-medium shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Adicionar URL
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-400 dark:text-zinc-500 uppercase font-bold text-[10px]">OU</span>
                    <label className={`text-xs bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap transition-colors ${uploadingMedia ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <Upload className="w-3.5 h-3.5" /> 
                      {uploadingMedia ? `Enviando... ${uploadProgress}%` : 'Fazer Upload'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleMediaUpload}
                        disabled={uploadingMedia}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(editingWork.images || []).map((imgUrl, i) => (
                  <div
                    key={i}
                    className="group relative aspect-video bg-stone-200 dark:bg-zinc-700 rounded-lg overflow-hidden border border-stone-300 dark:border-zinc-600"
                  >
                    <img
                      src={imgUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newImgs = [...editingWork.images];
                          newImgs.splice(i, 1);
                          setEditingWork({ ...editingWork, images: newImgs });
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(editingWork.images || []).length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-stone-200 dark:border-white/10 rounded-xl text-stone-400 dark:text-zinc-500 font-medium text-sm">
                    Nenhuma imagem na galeria.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow"
              >
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </form>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && !editingCategory && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-stone-800 dark:text-zinc-100">Categorias</h3>
              <button
                onClick={() =>
                  setEditingCategory({ id: "", name: "", subcategories: [] })
                }
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> Nova Categoria
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-full p-8 text-center text-stone-400 dark:text-zinc-500 font-medium border border-dashed border-stone-200 dark:border-white/10 rounded-xl">
                  Nenhuma categoria cadastrada.
                </div>
              ) : (
                categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-xl shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-stone-900 dark:text-white text-lg">
                          {c.name}
                        </h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingCategory(c)}
                            className="p-1.5 text-stone-400 dark:text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 text-stone-400 dark:text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {c.subcategories.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-white/10 text-stone-600 dark:text-zinc-300 rounded text-xs font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                        {c.subcategories.length === 0 && (
                          <span className="text-xs text-stone-400 dark:text-zinc-500 italic">
                            Sem subcategorias
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "categories" && editingCategory && (
          <form
            onSubmit={handleSaveCategory}
            className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-6 border border-stone-200 dark:border-white/10 rounded-xl shadow-sm max-w-2xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6 border-b border-stone-100 dark:border-white/5 pb-4">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                {editingCategory.id ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-2 text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-stone-700 dark:text-zinc-200 mb-2">
                Nome da Categoria *
              </label>
              <input
                required
                list="categoryNames"
                type="text"
                className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                  })
                }
                placeholder="Ex: Cinema, Transmissão"
              />
              <datalist id="categoryNames">
                {Array.from(new Set(works.map((w) => w.category)))
                  .filter(Boolean)
                  .sort()
                  .map((name, idx) => (
                    <option key={idx} value={name} />
                  ))}
              </datalist>
            </div>

            <div className="mb-8 p-5 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-white/10 rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <label className="text-sm font-bold text-stone-700 dark:text-zinc-200">
                  Subcategorias
                </label>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Nome da subcategoria"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newSubcategoryName && newSubcategoryName.trim()) {
                          setEditingCategory({
                            ...editingCategory,
                            subcategories: [
                              ...editingCategory.subcategories,
                              newSubcategoryName.trim(),
                            ],
                          });
                          setNewSubcategoryName("");
                        }
                      }
                    }}
                    className="flex-1 sm:w-48 bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubcategoryName && newSubcategoryName.trim()) {
                        setEditingCategory({
                          ...editingCategory,
                          subcategories: [
                            ...editingCategory.subcategories,
                            newSubcategoryName.trim(),
                          ],
                        });
                        setNewSubcategoryName("");
                      }
                    }}
                    className="text-xs bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-zinc-800/50 text-stone-900 dark:text-white px-3 py-1.5 rounded-lg font-medium shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {editingCategory.subcategories.map((sub, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm font-medium text-stone-800 dark:text-zinc-100">
                      {sub}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSubs = [...editingCategory.subcategories];
                        newSubs.splice(i, 1);
                        setEditingCategory({
                          ...editingCategory,
                          subcategories: newSubs,
                        });
                      }}
                      className="text-stone-400 dark:text-zinc-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {editingCategory.subcategories.length === 0 && (
                  <div className="text-center text-stone-400 dark:text-zinc-500 text-sm py-4">
                    Nenhuma subcategoria
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow"
              >
                <Save className="w-4 h-4" /> Salvar Categoria
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  );
}
