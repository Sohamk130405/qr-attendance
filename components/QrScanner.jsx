import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const QrCodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        scannerRef.current = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        const debouncedScan = debounce((decodedText) => {
          if (decodedText !== lastScannedCode && !cooldown) {
            setLastScannedCode(decodedText);
            setCooldown(true);
            onScan(decodedText);

            // Reset cooldown after 3 seconds
            setTimeout(() => {
              setCooldown(false);
              setLastScannedCode(null);
            }, 3000);
          }
        }, 300);

        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          debouncedScan
        );

        console.log("QR scanner started successfully");
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        setCameraError(err.message || "Could not access the camera.");
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => console.log("Scanner stopped"))
          .catch((err) => console.error("Failed to stop scanner", err));
      }
    };
  }, [onScan]);

  return (
    <div>
      {cameraError && <p>Error: {cameraError}</p>}
      <div id="reader"></div>
    </div>
  );
};

export default QrCodeScanner;
