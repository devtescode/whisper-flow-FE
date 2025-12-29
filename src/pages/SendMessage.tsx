import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlowOrb } from "@/components/GlowOrb";
import { Footer } from "@/components/Footer";
import { Send, MessageSquare, Check, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const SendMessage = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sender, setSender] = useState<{ name?: string; email?: string; picture?: string; googleId?: string } | null>(null);

  // Fetch link data
  useEffect(() => {
    if (!publicId) return;
    const fetchLink = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/link/u/${publicId}`);
        setLink(res.data);
      } catch (err) {
        console.error(err);
        setLink(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLink();
  }, [publicId]);

  // Handle Google OAuth login
  const handleGoogleLogin = async (response: CredentialResponse) => {
  try {
    if (response.credential) {
      // Decode the JWT credential to get user info
      const decoded: any = JSON.parse(atob(response.credential.split(".")[1]));

      // Save name, email, profile picture, and Google ID
      setSender({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        googleId: decoded.sub, // unique Google user ID
      });

      toast.success(`Logged in as ${decoded.name}`);
    }
  } catch (err) {
    console.error(err);
    toast.error("Google login failed");
  }
};


  // Handle sending message
  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    if (!link) return;
    if (!sender) {
      toast.error("Please login with Google to send a message");
      return;
    }

    setIsSending(true);
    try {
      await axios.post(`http://localhost:3000/link/u/${publicId}/messages`, {
        content: message.trim(),
        sender, // automatically includes name & email
      });

      setIsSending(false);
      setIsSent(true);
      toast.success("Message sent successfully!");
    } catch (err: any) {
      console.error(err);
      setIsSending(false);
      toast.error(err.response?.data?.error || "Failed to send message");
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Link Not Found</h1>
          <p>This link doesn't exist or has been disabled.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Check className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Message Sent!</h1>
          <p>Your anonymous message has been delivered successfully.</p>
          <Button onClick={() => { setIsSent(false); setMessage(""); setSender(null); }}>Send Another Message</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-6 pt-16">
        <div className="text-center mb-10">
          <MessageSquare className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">Send an Anonymous Message</h1>
          <p>to <span className="text-primary">{link.nickname}</span></p>
        </div>

        <div className="glass-card p-8 md:p-10 shadow-card">
          <div className="space-y-6">
            {!sender ? (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed")}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Logged in as <strong>{sender.name}</strong>
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Your Message *</label>
              <Textarea
                placeholder="Write your anonymous message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending..." : "Send Anonymous Message"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SendMessage;
