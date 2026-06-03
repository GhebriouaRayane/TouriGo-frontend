import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, RotateCcw, Shield, UserCheck, UserMinus2, UserPlus2, Users, UserX } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { ApiUser, deleteAdminUserApi, getAdminUsersApi, toggleAdminUserActiveApi, updateAdminUserApi } from "../lib/api";

type RoleFilter = "all" | "user" | "host" | "admin";

type StatCard = {
  label: string;
  value: string;
  helper: string;
  icon: typeof Users;
  tone: string;
};

const roleLabels: Record<string, string> = {
  user: "Utilisateur",
  host: "Hôte",
  admin: "Admin",
};

const roleStyles: Record<string, string> = {
  user: "bg-slate-100 text-slate-700",
  host: "bg-[#5481A0]/12 text-[#5481A0]",
  admin: "bg-[#3A6080]/10 text-[#3A6080]",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function safeText(value: string | null | undefined) {
  return value?.trim() || "—";
}

export default function Admin() {
  const { user, token, loading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "TouriGo - Administration";
  }, []);

  const loadUsers = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const loadedUsers = await getAdminUsersApi(token);
      setUsers(loadedUsers);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les utilisateurs.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (loading || !isAuthenticated || user?.role !== "admin" || !token) {
      return;
    }
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading, token, user?.role]);

  const userStats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((account) => account.role === "admin").length,
      host: users.filter((account) => account.role === "host").length,
      active: users.filter((account) => account.is_active).length,
    };
  }, [users]);

  const overviewCards: StatCard[] = [
    { label: "Utilisateurs", value: String(userStats.total), helper: `${userStats.active} actifs`, icon: Users, tone: "from-[#3A6080]/10 to-[#3A6080]/5" },
    { label: "Hôtes", value: String(userStats.host), helper: `${userStats.admin} admin(s)`, icon: UserCheck, tone: "from-[#5481A0]/12 to-[#5481A0]/6" },
    { label: "Sécurité", value: "Total", helper: "Accès admin complet", icon: Shield, tone: "from-[#3A6080]/12 to-[#5481A0]/8" },
  ];

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((account) => {
      const matchesRole = roleFilter === "all" || account.role === roleFilter;
      const matchesQuery =
        !query ||
        [account.email, account.full_name, account.phone_number, String(account.id)]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesRole && matchesQuery;
    });
  }, [roleFilter, search, users]);

  const refreshAdminData = async () => {
    try {
      await loadUsers();
      toast.success("Données utilisateurs actualisées.");
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'actualiser les donnees.");
    }
  };

  const applyUserUpdate = async (
    account: ApiUser,
    updater: (user: ApiUser) => Promise<ApiUser>,
    successMessage: string
  ) => {
    if (!token) {
      toast.error("Veuillez vous reconnecter.");
      return;
    }
    setActionUserId(account.id);
    try {
      const updated = await updater(account);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === updated.id ? updated : user))
      );
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error("L'action a échoué.");
    } finally {
      setActionUserId(null);
    }
  };

  const changeUserRole = (account: ApiUser, role: string) => {
    if (account.id === user?.id && role !== user.role) {
      toast.error("Vous ne pouvez pas changer votre propre rôle depuis cet écran.");
      return;
    }
    void applyUserUpdate(
      account,
      (userAccount) =>
        updateAdminUserApi(token!, userAccount.id, {
          email: userAccount.email,
          full_name: userAccount.full_name,
          avatar_url: userAccount.avatar_url,
          phone_number: userAccount.phone_number,
          role,
        }),
      `Rôle mis à jour pour ${account.email}.`
    );
  };

  const toggleUserActive = (account: ApiUser) => {
    if (account.id === user?.id) {
      toast.error("Vous ne pouvez pas désactiver votre propre compte.");
      return;
    }
    void applyUserUpdate(
      account,
      (userAccount) => toggleAdminUserActiveApi(token!, userAccount.id),
      `${account.email} a été ${account.is_active ? "désactivé" : "activé"}.`
    );
  };

  const deleteUser = (account: ApiUser) => {
    if (account.id === user?.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    const confirmed = window.confirm(`Supprimer définitivement ${account.email} ?`);
    if (!confirmed || !token) {
      return;
    }
    setActionUserId(account.id);
    void deleteAdminUserApi(token, account.id)
      .then(() => {
        setUsers((currentUsers) => currentUsers.filter((userEntry) => userEntry.id !== account.id));
        toast.success("Utilisateur supprimé.");
      })
      .catch((error) => {
        console.error(error);
        toast.error("La suppression a échoué.");
      })
      .finally(() => {
        setActionUserId(null);
      });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm text-center">
          <div className="text-lg font-semibold text-[#3A6080]">Chargement de l&apos;accès admin...</div>
          <div className="mt-2 text-sm text-muted-foreground">Vérification du compte connecté.</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm text-center">
          <Shield className="mx-auto h-10 w-10 text-[#3A6080]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#3A6080]">Connexion requise</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            Vous devez être connecté avec un compte admin pour ouvrir cette page.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/connexion"
              className="inline-flex items-center rounded-full bg-[#3A6080] px-5 py-3 text-sm font-medium text-white"
            >
              Aller à la connexion
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm text-center">
          <Shield className="mx-auto h-10 w-10 text-[#5481A0]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#3A6080]">Accès refusé</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            Le compte connecté est bien reconnu, mais il n&apos;a pas le rôle admin.
          </p>
          <p className="mt-2 text-sm text-[#3A6080] font-medium">
            Compte actuel: {user.email}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full bg-[#3A6080] px-5 py-3 text-sm font-medium text-white"
            >
              Ouvrir le dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfcfc_0%,#f4f6f7_100%)]">
      <section className="border-b border-border bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">
                TouriGo Admin
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#3A6080] mb-4">
                Utilisateurs réels
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-7">
                Cette vue n&apos;affiche que les vrais comptes de la base de données, sans sections de démonstration.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refreshAdminData}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <RotateCcw className="h-4 w-4" />
                Actualiser
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#3A6080] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
              >
                Ouvrir mon dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Retour au site
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className={`rounded-3xl border border-border bg-gradient-to-br ${card.tone} p-5 sm:p-6 shadow-[0_10px_30px_rgba(34,45,49,0.05)]`}
              >
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div className="rounded-2xl bg-white/90 p-3 shadow-sm">
                    <Icon className="h-5 w-5 text-[#3A6080]" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{card.helper}</span>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-[#3A6080] mb-2">
                  {card.value}
                </div>
                <div className="text-sm text-muted-foreground">{card.label}</div>
              </article>
            );
          })}
        </section>

        <article className="rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(34,45,49,0.04)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-[#3A6080]">Liste des utilisateurs</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Recherche, filtre par rôle et vue des comptes actifs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "user", "host", "admin"] as RoleFilter[]).map((role) => {
                const isActive = roleFilter === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleFilter(role)}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#3A6080] text-white"
                        : "border border-border bg-white text-foreground hover:bg-accent"
                    }`}
                  >
                    {role === "all" ? "Tous" : roleLabels[role]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 rounded-2xl border border-border bg-[rgb(250,251,252)] px-4 py-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par nom, email, téléphone ou ID..."
                className="w-full bg-transparent outline-none text-sm"
              />
            </label>
          </div>

          {loadingData ? (
            <div className="rounded-2xl border border-border bg-[rgb(250,251,252)] p-6 text-sm text-muted-foreground">
              Chargement des utilisateurs...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-[rgb(250,251,252)] p-6 text-sm text-muted-foreground">
              Aucun utilisateur trouvé.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="hidden lg:grid grid-cols-[1.1fr_1.2fr_0.9fr_0.8fr_1fr_auto] gap-4 px-4 py-3 bg-[rgb(250,251,252)] text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>Nom</span>
                <span>Email</span>
                <span>Rôle</span>
                <span>État</span>
                <span>Créé le</span>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-border">
                {filteredUsers.map((account) => (
                  <div key={account.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1.1fr_1.2fr_0.9fr_0.8fr_1fr_auto] lg:items-center">
                    <div>
                      <div className="font-semibold text-[#3A6080] flex items-center gap-2">
                        {account.full_name || account.email}
                        {account.id === user?.id ? (
                          <span className="rounded-full bg-[#3A6080]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3A6080]">
                            Vous
                          </span>
                        ) : null}
                      </div>
                      <div className="text-sm text-muted-foreground">{safeText(account.phone_number)}</div>
                    </div>
                    <div className="text-sm text-foreground">{account.email}</div>
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${roleStyles[account.role] || roleStyles.user}`}>
                        {roleLabels[account.role] || account.role}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${account.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {account.is_active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatDate(account.created_at)}</div>
                    <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                      <button
                        type="button"
                        onClick={() => changeUserRole(account, "user")}
                        disabled={actionUserId === account.id || account.role === "user"}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <UserMinus2 className="h-3.5 w-3.5" />
                        User
                      </button>
                      <button
                        type="button"
                        onClick={() => changeUserRole(account, "host")}
                        disabled={actionUserId === account.id || account.role === "host"}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Hôte
                      </button>
                      <button
                        type="button"
                        onClick={() => changeUserRole(account, "admin")}
                        disabled={actionUserId === account.id || account.role === "admin"}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleUserActive(account)}
                        disabled={actionUserId === account.id}
                        className="inline-flex items-center gap-1 rounded-full bg-[#3A6080] px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {account.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserPlus2 className="h-3.5 w-3.5" />}
                        {account.is_active ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(account)}
                        disabled={actionUserId === account.id || account.id === user?.id}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
