import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlowOrb } from "@/components/GlowOrb";
import { Footer } from "@/components/Footer";
import { Send, MessageSquare, Check, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useGoogleLogin, GoogleLogin, CredentialResponse } from "@react-oauth/google";

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
        const res = await axios.get(`https://whisper-flow-be.onrender.com/link/u/${publicId}`);
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
  // const handleGoogleLogin = async (response: CredentialResponse) => {
  //   try {
  //     if (response.credential) {
  //       const decoded: any = JSON.parse(
  //         atob(response.credential.split(".")[1])
  //       );

  //       const googleUser = {
  //         name: decoded.name,
  //         email: decoded.email,
  //         picture: decoded.picture,
  //         googleId: decoded.sub,
  //       };

  //       // Save to state
  //       setSender(googleUser);

  //       // ✅ Persist login
  //       localStorage.setItem("googleUser", JSON.stringify(googleUser));

  //       // toast.success(`Logged in as ${decoded.name}`);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Google login failed");
  //   }
  // };


  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const decoded = await res.json();

        const googleUser = {
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          googleId: decoded.sub,
        };

        setSender(googleUser);
        localStorage.setItem("googleUser", JSON.stringify(googleUser));

        toast.success("Verified with Google");
      } catch (err) {
        console.error(err);
        toast.error("Google verification failed");
      }
    },

    onError: () => {
      toast.error("Google verification failed");
    },
  });


  useEffect(() => {
    const storedUser = localStorage.getItem("googleUser");

    if (storedUser) {
      setSender(JSON.parse(storedUser));
    }
  }, []);



  // Handle sending message
  // const handleSend = async () => {
  //   if (!message.trim()) {
  //     toast.error("Please write a message");
  //     return;
  //   }

  //   if (!link) return;

  //   // 🔁 Try to reuse saved Google login
  //   const storedGoogleUser = localStorage.getItem("googleUser");
  //   const activeSender = sender || (storedGoogleUser ? JSON.parse(storedGoogleUser) : null);

  //   setIsSending(true);

  //   try {
  //     await axios.post(
  //       `https://whisper-flow-be.onrender.com/link/u/${publicId}/messages`,
  //       {
  //         content: message.trim(),

  //         // ✅ Only send sender if it exists (Google user)
  //         sender: activeSender
  //           ? {
  //             name: activeSender.name,
  //             email: activeSender.email,
  //             picture: activeSender.picture,
  //             googleId: activeSender.googleId,
  //           }
  //           : null,
  //       }
  //     );

  //     setIsSent(true);
  //     setMessage("");

  //     toast.success("Message sent successfully!");
  //   } catch (err: any) {
  //     console.error(err);
  //     toast.error(err.response?.data?.error || "Failed to send message");
  //   } finally {
  //     setIsSending(false);
  //   }
  // };



  // Handle sending message
  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }

    if (!link) return;

    // Check if user is logged in
    const storedGoogleUser = localStorage.getItem("googleUser");
    const activeSender = sender || (storedGoogleUser ? JSON.parse(storedGoogleUser) : null);

    if (!activeSender) {
      toast.error("You are to Verify as a sender");
      return;
    }

    setIsSending(true);

    try {
      await axios.post(
        `https://whisper-flow-be.onrender.com/link/u/${publicId}/messages`,
        {
          content: message.trim(),
          sender: {
            name: activeSender.name,
            email: activeSender.email,
            picture: activeSender.picture,
            googleId: activeSender.googleId,
          },
        }
      );

      setIsSent(true);
      setMessage("");

      toast.success("Message sent successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("googleUser");
  //   if (storedUser && !sender) {
  //     setSender(JSON.parse(storedUser));
  //   }
  // }, []);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <Check className="w-16 h-16 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-3">Message Sent!</h1>
          <p className="mb-1">Your anonymous message has been delivered successfully.</p>
          <Button onClick={() => { setIsSent(false); setMessage(""); }}>Send Another Message</Button>
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
              <button
                onClick={() => loginWithGoogle()}
                className="w-full mx-auto flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-background hover:bg-secondary transition font-medium"
              >
                Verify
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">

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
