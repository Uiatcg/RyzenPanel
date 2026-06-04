"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, File, FileText, Image, Code, Archive,
  Upload, Download, Trash2, Edit3, Plus, RefreshCw,
  ChevronLeft, ChevronRight, X, Save, FolderPlus,
  FilePlus, ArrowUp,
} from "lucide-react";

interface FileEntry {
  name: string;
  type: "file" | "directory";
  size?: string;
  modified?: string;
}

function getFileIcon(name: string, type: string) {
  if (type === "directory") return <Folder size={16} className="text-yellow-400" />;
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "svg", "ico"].includes(ext || "")) return <Image size={16} className="text-blue-400" />;
  if (["jar", "zip", "tar", "gz"].includes(ext || "")) return <Archive size={16} className="text-orange-400" />;
  if (["js", "ts", "py", "java", "json", "yml", "yaml", "xml", "sh", "txt", "cfg", "properties"].includes(ext || "")) return <Code size={16} className="text-ryzen-400" />;
  return <FileText size={16} className="text-slate-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function FilesPage() {
  const params = useParams();
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/servers/${params.id}/files?path=${encodeURIComponent(currentPath)}`);
      if (res.ok) {
        const d = await res.json();
        setFiles(d.files || []);
      }
    } catch { }
    setLoading(false);
  }, [params.id, currentPath]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  function navigateToDir(name: string) {
    const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    setCurrentPath(newPath);
    setSelected([]);
  }

  function goUp() {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? "/" : "/" + parts.join("/"));
    setSelected([]);
  }

  function toggleSelect(name: string) {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  }

  async function handleDelete() {
    if (selected.length === 0) return;
    for (const name of selected) {
      const filePath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
      await fetch(`/api/servers/${params.id}/files?path=${encodeURIComponent(filePath)}`, { method: "DELETE" });
    }
    setSelected([]);
    fetchFiles();
  }

  async function handleDownload(name: string) {
    const filePath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    window.open(`/api/servers/${params.id}/files/download?path=${encodeURIComponent(filePath)}`, "_blank");
  }

  async function handleEditFile(name: string) {
    const filePath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    try {
      const res = await fetch(`/api/servers/${params.id}/files/read?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const d = await res.json();
        setFileContent(d.content || "");
        setEditingFile(filePath);
      }
    } catch { }
  }

  async function handleSaveFile() {
    if (!editingFile) return;
    await fetch(`/api/servers/${params.id}/files/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: editingFile, content: fileContent }),
    });
    setEditingFile(null);
    setFileContent("");
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    const folderPath = currentPath === "/" ? `/${newFolderName}` : `${currentPath}/${newFolderName}`;
    await fetch(`/api/servers/${params.id}/files/mkdir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: folderPath }),
    });
    setNewFolderName("");
    setCreatingFolder(false);
    fetchFiles();
  }

  async function handleRename(oldName: string) {
    if (!renameValue.trim()) return;
    const oldPath = currentPath === "/" ? `/${oldName}` : `${currentPath}/${oldName}`;
    const newPath = currentPath === "/" ? `/${renameValue}` : `${currentPath}/${renameValue}`;
    await fetch(`/api/servers/${params.id}/files/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPath, newPath }),
    });
    setRenaming(null);
    setRenameValue("");
    fetchFiles();
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath);
    await fetch(`/api/servers/${params.id}/files/upload`, {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    fetchFiles();
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(f => handleUpload(f));
  }, [currentPath]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {editingFile ? (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingFile(null)} className="btn-ghost text-xs">
                  <ChevronLeft size={14} /> Back
                </button>
                <span className="text-sm font-medium text-white truncate max-w-[300px]">{editingFile}</span>
              </div>
              <button onClick={handleSaveFile} className="btn-primary text-xs px-3 py-2">
                <Save size={14} /> Save
              </button>
            </div>
            <div className="card p-0 overflow-hidden">
              <textarea value={fileContent} onChange={e => setFileContent(e.target.value)}
                className="w-full bg-transparent p-4 font-mono text-sm text-slate-200 outline-none resize-none"
                style={{ minHeight: "50vh", tabSize: 2 }}
                spellCheck={false}
              />
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <button onClick={() => setCurrentPath("/")} className="hover:text-white transition-colors">root</button>
                {pathParts.map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <ChevronRight size={12} className="text-slate-600" />
                    <button
                      onClick={() => setCurrentPath("/" + pathParts.slice(0, i + 1).join("/"))}
                      className="hover:text-white transition-colors"
                    >{part}</button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <input ref={fileInputRef} type="file" className="hidden" multiple
                  onChange={e => { const fs = Array.from(e.target.files || []); fs.forEach(f => handleUpload(f)); }} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="btn-ghost text-xs"><Upload size={14} /> {uploading ? "Uploading..." : "Upload"}</button>
                <button onClick={() => { setCreatingFolder(true); setNewFolderName(""); }}
                  className="btn-ghost text-xs"><FolderPlus size={14} /> New Folder</button>
                <button onClick={() => handleEditFile("newfile.txt")} className="btn-ghost text-xs"><FilePlus size={14} /> New File</button>
                <button onClick={fetchFiles} className="btn-ghost text-xs"><RefreshCw size={14} /></button>
              </div>
            </div>

            {creatingFolder && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setCreatingFolder(false); }}
                  className="input-field py-1.5 text-sm flex-1 max-w-xs" placeholder="Folder name..." autoFocus />
                <button onClick={handleCreateFolder} className="btn-primary text-xs px-3 py-1.5">Create</button>
                <button onClick={() => setCreatingFolder(false)} className="btn-ghost text-xs">Cancel</button>
              </motion.div>
            )}

            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              className={`card p-0 overflow-hidden transition-all duration-200 ${dragOver ? "border-ryzen-500/50 bg-ryzen-500/5" : ""}`}
            >
              {dragOver && (
                <div className="flex items-center justify-center py-16 text-center">
                  <div>
                    <Upload size={32} className="text-ryzen-400 mb-2 mx-auto" />
                    <p className="text-sm font-medium text-ryzen-400">Drop files to upload</p>
                  </div>
                </div>
              )}

              {!dragOver && loading && (
                <div className="divide-y divide-slate-800/30">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="px-4 py-3"><div className="skeleton h-5 w-full" /></div>
                  ))}
                </div>
              )}

              {!dragOver && !loading && (
                <>
                  {currentPath !== "/" && (
                    <button onClick={goUp}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:bg-slate-800/20 transition-colors border-b border-slate-800/30">
                      <ArrowUp size={16} />
                      <span>..</span>
                    </button>
                  )}
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Folder size={40} className="text-slate-700 mb-4" />
                      <p className="text-sm font-medium text-slate-400">This directory is empty</p>
                      <p className="text-xs text-slate-500 mt-1">Upload files or create new folders</p>
                      <button onClick={() => fileInputRef.current?.click()} className="btn-primary mt-4 text-xs px-3 py-2">
                        <Upload size={14} /> Upload Files
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-[1fr_100px_120px_80px] gap-4 border-b border-slate-800/50 px-4 py-3 text-xs font-medium text-slate-500">
                        <span>Name</span><span>Size</span><span>Modified</span><span />
                      </div>
                      <div className="divide-y divide-slate-800/30">
                        {files.map((file) => (
                          <div key={file.name}
                            className={`grid grid-cols-[1fr_100px_120px_80px] gap-4 px-4 py-2.5 text-sm transition-colors hover:bg-slate-800/20 ${
                              selected.includes(file.name) ? "bg-ryzen-500/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input type="checkbox" checked={selected.includes(file.name)}
                                onChange={() => toggleSelect(file.name)}
                                className="rounded border-slate-700 bg-slate-800 text-ryzen-500 focus:ring-ryzen-500/20 flex-shrink-0" />
                              {renaming === file.name ? (
                                <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") handleRename(file.name); if (e.key === "Escape") setRenaming(null); }}
                                  className="input-field py-0.5 text-sm flex-1 min-w-0" autoFocus
                                  onClick={e => e.stopPropagation()} />
                              ) : (
                                <button
                                  onClick={() => file.type === "directory" ? navigateToDir(file.name) : handleEditFile(file.name)}
                                  className="flex items-center gap-2 min-w-0"
                                >
                                  {getFileIcon(file.name, file.type)}
                                  <span className="text-slate-300 truncate hover:text-white transition-colors">{file.name}</span>
                                </button>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 self-center">{file.size || "—"}</span>
                            <span className="text-xs text-slate-500 self-center">{file.modified || "—"}</span>
                            <div className="flex items-center gap-1 self-center">
                              {file.type === "file" && (
                                <button onClick={() => handleDownload(file.name)} className="btn-ghost text-[10px] p-1"><Download size={12} /></button>
                              )}
                              <button onClick={() => { setRenaming(file.name); setRenameValue(file.name); }}
                                className="btn-ghost text-[10px] p-1"><Edit3 size={12} /></button>
                              <button onClick={() => { setSelected([file.name]); handleDelete(); }}
                                className="btn-ghost text-[10px] p-1 text-red-400"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {selected.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-1">
                <span className="text-xs text-slate-500">{selected.length} selected</span>
                <button onClick={handleDelete} className="btn-ghost text-xs text-red-400"><Trash2 size={14} /> Delete</button>
                <button onClick={() => handleDownload(selected[0])} className="btn-ghost text-xs"><Download size={14} /> Download</button>
                <button onClick={() => { setRenaming(selected[0]); setRenameValue(selected[0]); }} className="btn-ghost text-xs"><Edit3 size={14} /> Rename</button>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}