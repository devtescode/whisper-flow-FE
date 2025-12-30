import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowOrb } from "@/components/GlowOrb";
import {
  getAllLinks,
  getAllMessages,
  deleteMessage,
  toggleLinkStatus,
  type AnonymousLink,
  type Message
} from "@/lib/store";
import {
  Shield,
  Link,
  MessageSquare,
  LogOut,
  Trash2,
  Ban,
  CheckCircle,
  Search,
  Clock,
  Mail,
  Globe,
  Monitor,
  Users,
  LayoutDashboard,
  MessagesSquare,
  User
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type Tab = "dashboard" | "messages" | "links";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [links, setLinks] = useState<AnonymousLink[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin");
      return;
    }

    refreshData();
  }, [navigate]);


  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.get("https://whisper-flow-be.onrender.com/admin/getLinks");
        setLinks(res.data);
      } catch (err) {
        console.error("Failed to fetch links", err);
      } finally {
        setLoadingLinks(false);
      }
    };

    fetchLinks();
  }, []);

  const refreshData = () => {
    setLinks(getAllLinks());
    setMessages(getAllMessages().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    toast.success("Logged out successfully");
    navigate("/admin");
  };


  // const handleToggleLinkStatus = (id: string) => {
  //   toggleLinkStatus(id);
  //   refreshData();
  //   toast.success("Link status updated");
  // };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };



  // Fetch messages on component load
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("https://whisper-flow-be.onrender.com/admin/admingetMessages");
        setMessages(res.data);
        console.log(res.data, "getmeaasge");

      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    // Optional: Polling every 10s for new messages
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);




  const handleToggleLinkStatus = (linkId: string) => {
    const link = links.find(l => l.id === linkId);
    if (!link) return;

    const nextAction = link.isActive ? "block" : "activate";

    toast(
      `Are you sure you want to ${nextAction} this link?`,
      {
        description: link.isActive
          ? "Users will NOT be able to send messages."
          : "Users will be able to send messages again.",

        action: {
          label: "Yes",
          onClick: () => confirmToggle(linkId),
        },

        cancel: {
          label: "Cancel",
          onClick: () => toast.info("Action cancelled"),
        },
      }
    );
  };



  const confirmToggle = async (linkId: string) => {
    const link = links.find(l => l.id === linkId);
    if (!link) return;

    const wasActive = link.isActive; // store BEFORE toggle

    try {
      // Optimistic update
      setLinks(prev =>
        prev.map(l =>
          l.id === linkId ? { ...l, isActive: !l.isActive } : l
        )
      );

      await axios.patch(
        `https://whisper-flow-be.onrender.com/admin/links/${linkId}/toggle`
      );

      toast.success(
        wasActive
          ? "Link blocked successfully"
          : "Link activated successfully"
      );
    } catch (err) {
      console.error(err);

      // rollback
      setLinks(prev =>
        prev.map(l =>
          l.id === linkId ? { ...l, isActive: !l.isActive } : l
        )
      );

      toast.error("Failed to update link status");
    }
  };


  const [selectedSender, setSelectedSender] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const groupedMessages = filteredMessages.reduce((acc: any, msg) => {
    const key = msg.senderEmail || msg.senderIp || "anonymous";

    if (!acc[key]) {
      acc[key] = {
        senderName: msg.senderName || "Anonymous",
        senderEmail: msg.senderEmail,
        senderPicture: msg.senderPicture,
        senderIp: msg.senderIp,
        messages: [],
      };
    }

    acc[key].messages.push(msg);
    return acc;
  }, {});



  const [activeNickname, setActiveNickname] = useState<any>(null);
  const nicknameMap = filteredMessages.reduce((acc: any, msg) => {
    const key = msg.nickname || "Unknown";

    if (!acc[key]) {
      acc[key] = {
        nickname: key,
        messages: [],
      };
    }

    acc[key].messages.push(msg);
    return acc;
  }, {});

  const nicknameGroups = Object.values(nicknameMap);








  const filteredLinks = links.filter(link =>
    link.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.publicId.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getLinkForMessage = (linkId: string) => {
    return links.find(l => l.id === linkId);
  };

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
    { id: "messages" as Tab, label: "Messages", icon: MessagesSquare },
    { id: "links" as Tab, label: "Links", icon: Users },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GlowOrb className="-top-32 -left-32" size="lg" />
      <GlowOrb className="bottom-20 -right-20" size="md" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Manage your platform</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="flex-shrink-0"
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="animate-fade-in">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Link className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{links.length}</p>
                      <p className="text-sm text-muted-foreground">Total Links</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{messages.length}</p>
                      <p className="text-sm text-muted-foreground">Total Messages</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{links.filter(l => !l.isActive).length}</p>
                      <p className="text-sm text-muted-foreground">Blocked Links</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 h-80 overflow-y-auto">
                <h2 className="font-semibold mb-4">Recent Activity</h2>

                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((msg) => (
                      <div
                        key={msg.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
                      >
                        <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{msg.content}</p>
                          <p className="text-xs text-muted-foreground">
                            Sent to: <span className="font-medium">{msg.nickname}</span> • {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="animate-fade-in">
              <div className="glass-card p-6 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {nicknameGroups.map((group: any) => (
                  <div
                    key={group.nickname}
                    className="glass-card p-5 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-lg">{group.nickname}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.messages.length} message(s)
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setActiveNickname(group)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>


              {activeNickname && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">

                  {/* Blur overlay */}
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setActiveNickname(null)}
                  />

                  {/* Modal */}
                  <div className="relative bg-background rounded-xl w-full max-w-4xl p-6 shadow-xl z-[10000]">
                    <h2 className="text-xl font-semibold mb-7">
                      Messages sent to <span className="text-primary">{activeNickname.nickname}</span>
                    </h2>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {activeNickname.messages.map((msg: any) => (
                        <div key={msg.id} className="glass-card p-4">

                          {/* Sender Info */}
                          <div className="flex items-center gap-3 mb-2">
                            {msg.senderPicture && (
                              <img
                                src={msg.senderPicture}
                                className="w-8 h-8 rounded-full"
                                alt="Profile"
                              />
                            )}

                            <div>
                              <p className="font-medium">
                                {msg.senderName || "Anonymous"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {msg.senderEmail || "No email"} • IP {msg.senderIp}
                              </p>
                            </div>
                          </div>

                          {/* Message */}
                          <p className="text-sm">{msg.content}</p>

                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-5">
                      <Button variant="outline" onClick={() => setActiveNickname(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}






            </div>
          )}

          {/* Links Tab */}
          {activeTab === "links" && (
            <div className="animate-fade-in">
              <div className="glass-card p-6 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search links by nickname or public ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredLinks.length === 0 ? (
                <div className="glass-card p-10 text-center">
                  <Link className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No links found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLinks.map((link) => {
                    const messageCount = messages.filter(
                      m => String(m.linkId) === String(link.id)
                    ).length;

                    return (
                      <div key={link.id} className="glass-card p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{link.nickname}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${link.isActive
                                  ? "bg-primary/20 text-primary"
                                  : "bg-destructive/20 text-destructive"
                                  }`}
                              >
                                {link.isActive ? "Active" : "Blocked"}
                              </span>

                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{messageCount} messages</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatDate(link.createdAt)}</span>
                              </div>

                              <div className="flex items-center gap-1.5 col-span-2 md:col-span-1">
                                <Link className="w-3.5 h-3.5" />
                                <span className="font-mono truncate">{link.publicId}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={
                              link.isActive
                                ? "text-primary hover:bg-primary/10"
                                : "text-destructive hover:bg-destructive/10"
                            }
                            onClick={() => handleToggleLinkStatus(link.id)}
                          >
                            {link.isActive ? "Activate" : " Block"}
                          </Button>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
