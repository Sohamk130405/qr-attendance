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
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const initializeScanner = async (deviceId) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser does not support camera access.");
        return;
      }

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

      await scannerRef.current.start({ deviceId }, config, debouncedScan);

      console.log("QR scanner started successfully");
    } catch (err) {
      console.error("Failed to initialize scanner:", err);
      setCameraError(err.message || "Could not access the camera.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        console.log("Scanner stopped");
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  useEffect(() => {
    const fetchVideoDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        setVideoDevices(videoInputDevices);

        if (videoInputDevices.length > 0) {
          const rearCamera = videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          );
          setSelectedDeviceId(
            rearCamera?.deviceId || videoInputDevices[0].deviceId
          );
        }
      } catch (err) {
        console.error("Failed to fetch video devices:", err);
        setCameraError("Could not fetch video devices.");
      }
    };

    fetchVideoDevices();

    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      stopScanner().then(() => initializeScanner(selectedDeviceId));
    }
  }, [selectedDeviceId]);

  return (
    <div>
      {cameraError && <p>Error: {cameraError}</p>}
      <select
        value={selectedDeviceId}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
      >
        {videoDevices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId}`}
          </option>
        ))}
      </select>
      <div id="reader"></div>
    </div>
  );
};

export default QrCodeScanner;
