import { useCallback, useEffect, useRef, useState } from "react";

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamError(null);
    } catch (error) {
      console.error(error);
      setStreamError("Gagal mengakses kamera. Pastikan izin diberikan.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const mediaStream = videoRef.current?.srcObject as MediaStream | null;
    mediaStream?.getTracks().forEach((track) => track.stop());
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const restart = useCallback(async () => {
    stopCamera();
    setPreview(null);
    await startCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return {
    videoRef,
    canvasRef,
    preview,
    streamError,
    capturePhoto,
    restart,
  };
};
