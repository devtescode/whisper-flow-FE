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
        // <button
        //   onClick={handleInstallClick}
        //   className="px-4 py-2 rounded-lg bg-primary text-white"
        // >
        //   Install App
        // </button>
        <button
            onClick={handleInstallClick}
            className="
    px-5 py-3 
    bg-gradient-to-r from-blue-500 to-indigo-600 
    text-white 
    font-semibold 
    rounded-xl 
    shadow-md 
    hover:shadow-lg 
    hover:from-blue-600 hover:to-indigo-700 
    active:scale-95 
    transition 
    duration-200
  "
        >
            Install Whisper Flow
        </button>

    );
}
