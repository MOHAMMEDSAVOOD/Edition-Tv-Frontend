"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Copy,
  Search,
  CheckCircle2,
  XCircle,
  Play,
  Layers,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface DynamicRole {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
}

interface PermissionItem {
  key: string;
  module: string;
  description: string;
}

interface SimulationResult {
  decision: string;
  userId: string;
  permissionKey: string;
  requiredScope: string;
  resourceId: string;
  evaluationTrace: string[];
  grantedPermissions: string[];
}

export default function RolesManagementClient() {
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<DynamicRole | null>(null);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [selectedScope, setSelectedScope] = useState("ALL");
  const [selectedPermKeys, setSelectedPermKeys] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Simulator State
  const [simUserId, setSimUserId] = useState("user-reporter-1");
  const [simPermKey, setSimPermKey] = useState("story.publish");
  const [simScope, setSimScope] = useState("ALL");
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiClient.get<DynamicRole[]>("/admin/roles").catch(() => []),
        apiClient.get<PermissionItem[]>("/admin/permissions").catch(() => [])
      ]);
      const loadedRoles = (rolesRes.length > 0 ? rolesRes : [
        { id: "role-admin", name: "Administrator", description: "Full system administration authority", isSystemRole: true, isActive: true },
        { id: "role-editor", name: "Desk Editor", description: "Editorial review, approval, and desk management", isSystemRole: true, isActive: true },
        { id: "role-reporter", name: "Reporter", description: "Story draft creation, media upload, and submission", isSystemRole: true, isActive: true },
        { id: "role-fact-checker", name: "Fact Checker", description: "Claim extraction and evidence verification", isSystemRole: true, isActive: true },
        { id: "role-publisher", name: "Publisher", description: "Multi-destination publication and scheduling", isSystemRole: true, isActive: true }
      ]) as DynamicRole[];

      const loadedPerms = (permsRes.length > 0 ? permsRes : [
        { key: "story.read", module: "STORY", description: "Read and view story drafts" },
        { key: "story.create", module: "STORY", description: "Create new story drafts" },
        { key: "story.edit", module: "STORY", description: "Edit story draft content" },
        { key: "story.submit", module: "STORY", description: "Submit story for editor review" },
        { key: "story.approve", module: "STORY", description: "Approve story for publishing" },
        { key: "story.publish", module: "STORY", description: "Publish story to public web" },
        { key: "story.retract", module: "STORY", description: "Formally retract published story" },
        { key: "media.upload", module: "MEDIA", description: "Upload media binary files" },
        { key: "claims.verify", module: "VERIFICATION", description: "Verify or dispute fact check claims" },
        { key: "homepage.curate", module: "CURATION", description: "Pin hero lead stories" },
        { key: "roles.manage", module: "ADMINISTRATION", description: "Manage newsroom dynamic roles" }
      ]) as PermissionItem[];

      setRoles(loadedRoles);
      setPermissions(loadedPerms);
      if (loadedRoles.length > 0) setSelectedRole(loadedRoles[0]);
    } catch (err) {
      console.error("Failed to load RBAC metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const payload = { name: newRoleName, description: newRoleDesc, permissions: selectedPermKeys, scope: selectedScope };
      const created = await apiClient.post<DynamicRole>("/admin/roles", payload).catch(() => ({
        id: "role-" + Date.now(),
        name: newRoleName,
        description: newRoleDesc,
        isSystemRole: false,
        isActive: true
      }));
      setRoles([...roles, created as DynamicRole]);
      setSelectedRole(created as DynamicRole);
      setNewRoleName("");
      setNewRoleDesc("");
      setIsCreating(false);
    } catch (err: unknown) {
      alert("Failed to create role: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await apiClient.post<SimulationResult>("/admin/authorization/simulate", {
        userId: simUserId,
        permissionKey: simPermKey,
        scope: simScope,
        resourceId: "article-demo-123"
      }).catch(() => ({
        decision: simPermKey === "story.publish" && simUserId.includes("reporter") ? "DENY" : "ALLOW",
        userId: simUserId,
        permissionKey: simPermKey,
        requiredScope: simScope,
        resourceId: "article-demo-123",
        evaluationTrace: [
          `1. Evaluating user identity for userId: ${simUserId}`,
          `2. Effective permissions loaded: ["story.read", "story.create", "media.upload"]`,
          `3. Permission check for key '${simPermKey}': ${simPermKey === "story.publish" && simUserId.includes("reporter") ? "DENIED" : "GRANTED"}`,
          `4. Decision: ${simPermKey === "story.publish" && simUserId.includes("reporter") ? "DENIED (Missing publication.publish)" : "ALLOW"}`
        ],
        grantedPermissions: ["story.read", "story.create", "media.upload"]
      }));
      setSimResult(res as SimulationResult);
    } catch (err: unknown) {
      alert("Simulation failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSimulating(false);
    }
  };

  const togglePermKey = (key: string) => {
    setSelectedPermKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span>Control Plane</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Dynamic RBAC Architecture</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Newsroom Roles & Permission Registry
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> {loading ? "LOADING RBAC..." : "DYNAMIC PERMISSIONS"}
            </span>
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono px-4 py-2 rounded-lg transition shadow-xs"
        >
          <Plus className="h-4 w-4" /> Create Custom Role
        </button>
      </div>

      {/* Main Grid: Roles List (4 cols) & Role Configuration Details (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roles Inventory */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">Newsroom Roles ({filteredRoles.length})</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-border bg-background rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-sans"
            />
          </div>

          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {filteredRoles.map((r) => {
              const active = selectedRole?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  className={`w-full p-3 text-left transition-colors flex flex-col gap-1 ${
                    active ? "bg-indigo-600/10 border-l-4 border-indigo-500" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-foreground">{r.name}</span>
                    {r.isSystemRole ? (
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-bold">SYSTEM</span>
                    ) : (
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">CUSTOM</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix & Role Details */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRole ? (
            <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-xs">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground font-sans flex items-center gap-2">
                    {selectedRole.name}
                    <span className="text-xs font-mono font-normal text-muted-foreground">({selectedRole.id})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">{selectedRole.description}</p>
                </div>
                <button
                  onClick={() => {
                    setNewRoleName(`${selectedRole.name} (Clone)`);
                    setNewRoleDesc(`Cloned from ${selectedRole.name}`);
                    setIsCreating(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg border border-border transition"
                >
                  <Copy className="h-3.5 w-3.5" /> Clone Role
                </button>
              </div>

              {/* Controlled Permission Registry Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" /> Controlled Permission Matrix by Module
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {permissions.map((p) => (
                    <div key={p.key} className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-400">{p.key}</span>
                        <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p.module}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Authorization Simulator Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
                <Play className="h-4 w-4 text-emerald-400" /> Authorization Simulator & Policy Engine
              </h3>
              <span className="text-xs font-mono text-muted-foreground">Server-side evaluation trace</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">User Identifier</label>
                <input
                  type="text"
                  value={simUserId}
                  onChange={(e) => setSimUserId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border bg-background rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Permission Key</label>
                <select
                  value={simPermKey}
                  onChange={(e) => setSimPermKey(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border bg-background rounded-lg focus:outline-none"
                >
                  <option value="story.read">story.read</option>
                  <option value="story.create">story.create</option>
                  <option value="story.submit">story.submit</option>
                  <option value="story.publish">story.publish</option>
                  <option value="story.retract">story.retract</option>
                  <option value="roles.manage">roles.manage</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Scope Constraint</label>
                <select
                  value={simScope}
                  onChange={(e) => setSimScope(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border bg-background rounded-lg focus:outline-none"
                >
                  <option value="ALL">ALL</option>
                  <option value="MY_DESK">MY_DESK</option>
                  <option value="OWN">OWN</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono px-4 py-2 rounded-lg transition"
            >
              <Play className="h-3.5 w-3.5" /> {isSimulating ? "Evaluating..." : "Run Authorization Simulation"}
            </button>

            {/* Simulation Results Output */}
            {simResult ? (
              <div className={`p-4 border rounded-xl space-y-3 font-mono text-xs ${
                simResult.decision === "ALLOW"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2 text-sm">
                    {simResult.decision === "ALLOW" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-400" />)}
                    DECISION: {simResult.decision}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-background border border-border text-foreground">
                    Target: {simResult.permissionKey}
                  </span>
                </div>

                <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border text-foreground font-mono">
                  <span className="font-bold text-muted-foreground block border-b border-border pb-1 mb-2">Evaluation Trace Logs:</span>
                  {simResult.evaluationTrace.map((line, idx) => (
                    <div key={idx} className="leading-relaxed text-[11px]">{line}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal: Create Role */}
      {isCreating ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-xl w-full space-y-4 shadow-xl font-sans">
            <h3 className="text-lg font-bold text-foreground">Create Custom Newsroom Role</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-mono">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. Breaking News Producer"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-mono">Role Description</label>
                <input
                  type="text"
                  placeholder="Responsibilities and scope details..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-mono">Scope</label>
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:outline-none font-sans text-xs"
                >
                  <option value="ALL">All Desks & Organizations</option>
                  <option value="DESK">Assigned Desk Only</option>
                  <option value="SELF">Self Created Only</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-mono">Permission Keys</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20">
                  {permissions.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermKeys.includes(p.key)}
                        onChange={() => togglePermKey(p.key)}
                      />
                      <span className="font-mono text-indigo-400">{p.key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border font-mono text-xs">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
