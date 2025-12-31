import { useEffect, useState } from "react";

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  // Only show button if install is possible
  if (!showInstall) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return; // guard against null
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log("User choice:", choiceResult);
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <button
      onClick={handleInstallClick}
      className="px-4 py-2 rounded-lg bg-primary text-white"
    >
      Install Whisper Flow
    </button>
  );
}
