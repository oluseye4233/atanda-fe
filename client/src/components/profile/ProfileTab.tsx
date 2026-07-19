import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { profileService } from "@/services/profile.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { User, Mail, Building2, MapPin, Award, Save } from "lucide-react";

interface ProfileTabProps {
  user: ReturnType<typeof useAuth>["user"];
  updateUser: ReturnType<typeof useAuth>["updateUser"];
}

export function ProfileTab({ user, updateUser }: ProfileTabProps) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
      name: "",
      role: "",
      department: "",
      location: "",
      seniority: "",
    });

  useEffect(() => {
      if (user) {
        setForm({
          name: user.name || "",
          role: user.role || "",
          department: user.department || "",
          location: user.location || "",
          seniority: user.seniority || "",
        });
      }
    }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaveError(null);
    try {
      await profileService.update(user.id, form);
      updateUser(form as Parameters<typeof updateUser>[0]);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (error: unknown) {
      setSaveError(getApiErrorMessage(error, "Couldn't save the profile. Check your connection and try again."));
    }
  };

  const fields = [
      { key: "name", label: "Full Name", icon: User, value: form.name },
      { key: "role", label: "Role / Title", icon: User, value: form.role, readOnly: true },
      { key: "department", label: "Company/Department", icon: Building2, value: form.department },
      { key: "seniority", label: "Seniority Level", icon: Award, value: form.seniority },
      { key: "location", label: "Location", icon: MapPin, value: form.location },
    ];

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="glass-card p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center gap-3">
          <span className="font-mono text-sm text-destructive">{saveError}</span>
        </div>
      )}

      {saved && (
        <div className="glass-card p-4 rounded-xl border border-secondary/30 bg-secondary/5 flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">Profile updated successfully.</span>
        </div>
      )}

      <div className="glass-card p-6 rounded-xl" data-testid="card-profile-details">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider">Profile Details</h2>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            data-testid="button-edit-profile"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all hover:scale-[1.02]"
            style={{
              color: editing ? "#44AA44" : "hsl(var(--primary))",
              backgroundColor: editing ? "rgba(68,170,68,0.1)" : "hsl(var(--primary) / 0.1)",
              border: `1px solid ${editing ? "rgba(68,170,68,0.3)" : "hsl(var(--primary) / 0.3)"}`,
            }}
          >
            {editing ? <Save className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="space-y-4">
          {fields.map(({ key, label, icon: Icon, value, readOnly }) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-1">{label}</label>
                          {editing ? (
                            <input
                              data-testid={`input-profile-${key}`}
                              type="text"
                              value={value}
                              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                              readOnly={readOnly}
                              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                          ) : (
                            <p className="text-white font-mono text-sm" data-testid={`text-profile-${key}`}>
                              {value || "—"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-1">Email</label>
              <p className="text-white font-mono text-sm" data-testid="text-profile-email">{user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      {user?.institution && (
        <div className="glass-card p-5 rounded-xl border border-transparent">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-5 w-5 text-purple-400">🎓</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Institution</span>
          </div>
          <p className="font-display font-bold text-lg text-white">{user.institution}</p>
        </div>
      )}
    </div>
  );
}