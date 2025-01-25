import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Your browser does not support camera access.");
          return;
        }

        // Get the list of available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(
          (device) => device.kind === "videoinput"
        );

        if (videoInputs.length > 0) {
          setVideoDevices(videoInputs);
          setSelectedDeviceId(videoInputs[0].deviceId); // Default to the first camera
        } else {
          setCameraError("No video devices found.");
          return;
        }

        // Initialize scanner with the default camera
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
          { deviceId: videoInputs[0].deviceId },
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

  const handleCameraChange = async (newDeviceId) => {
    setSelectedDeviceId(newDeviceId);

    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current
        .start(
          { deviceId: newDeviceId },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          debounce((decodedText) => {
            if (decodedText !== lastScannedCode && !cooldown) {
              setLastScannedCode(decodedText);
              setCooldown(true);
              onScan(decodedText);

              setTimeout(() => {
                setCooldown(false);
                setLastScannedCode(null);
              }, 3000);
            }
          }, 300)
        )
        .then(() => console.log("Switched to new camera"))
        .catch((err) => console.error("Failed to switch camera", err));
    }
  };

  return (
    <div>
      {cameraError && <p className="text-red-500">{cameraError}</p>}
      {videoDevices.length > 0 && (
        <Select
          onValueChange={handleCameraChange}
          value={selectedDeviceId || ""}
        >
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Select Camera" />
          </SelectTrigger>
          <SelectContent>
            {videoDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div id="reader" className="mt-4"></div>
    </div>
  );
};

export default QrCodeScanner;
