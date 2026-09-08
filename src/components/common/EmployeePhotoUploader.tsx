import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Trash2,
  Check,
  CheckCircle2,
  X,
  Link2,
  User,
  AlertCircle,
  SwitchCamera,
} from 'lucide-react';

export interface EmployeePhotoUploaderProps {
  currentPhoto?: string;
  employeeName?: string;
  gender?: 'Male' | 'Female' | 'Other' | string;
  onPhotoChange: (photoDataUrl: string) => void;
  variant?: 'compact' | 'full' | 'inline' | 'modal';
  title?: string;
  subtitle?: string;
}

// Curated Hospital & Healthcare Avatars categorized by gender & clinical role
export const HEALTHCARE_AVATAR_PRESETS = [
  // Female Medical & Nursing
  {
    id: 'f-doc-1',
    label: 'Female Physician',
    gender: 'Female',
    url: 'https://images.unsplash.com/photo-1594824813566-78a9327d3b5b?w=400&auto=format&fit=crop&q=80',
    category: 'Doctor',
  },
  {
    id: 'f-nurse-1',
    label: 'Senior Nurse',
    gender: 'Female',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    category: 'Nursing',
  },
  {
    id: 'f-doc-2',
    label: 'Specialist Doctor',
    gender: 'Female',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    category: 'Doctor',
  },
  {
    id: 'f-admin-1',
    label: 'Healthcare Admin',
    gender: 'Female',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    category: 'Admin',
  },
  {
    id: 'f-clinical-1',
    label: 'Clinical Officer',
    gender: 'Female',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    category: 'Clinical',
  },
  // Male Medical & Clinical
  {
    id: 'm-doc-1',
    label: 'Medical Officer',
    gender: 'Male',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    category: 'Doctor',
  },
  {
    id: 'm-doc-2',
    label: 'Consultant Surgeon',
    gender: 'Male',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    category: 'Doctor',
  },
  {
    id: 'm-nurse-1',
    label: 'Nursing Officer',
    gender: 'Male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    category: 'Nursing',
  },
  {
    id: 'm-admin-1',
    label: 'Hospital Executive',
    gender: 'Male',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    category: 'Admin',
  },
  {
    id: 'm-pharm-1',
    label: 'Pharmacist / Lab Lead',
    gender: 'Male',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    category: 'Pharmacy',
  },
  // General / Professional
  {
    id: 'g-lab-1',
    label: 'Biomedical Scientist',
    gender: 'Other',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&auto=format&fit=crop&q=80',
    category: 'Laboratory',
  },
  {
    id: 'g-tech-1',
    label: 'Health Informatics',
    gender: 'Other',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
    category: 'IT / Health Info',
  },
];

/**
 * Utility to crop and compress an image to a standardized square avatar dataURL
 */
export const compressAndCropImage = (
  fileOrUrl: File | string,
  targetSize = 400,
  quality = 0.85
): Promise<{ dataUrl: string; originalSize: number; compressedSize: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoadedImage = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Center square crop calculations
        const { naturalWidth: width, naturalHeight: height } = img;
        let sx = 0;
        let sy = 0;
        let sWidth = width;
        let sHeight = height;

        if (width > height) {
          sWidth = height;
          sx = (width - height) / 2;
        } else if (height > width) {
          sHeight = width;
          sy = (height - width) / 2;
        }

        // Fill background with subtle neutral
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Draw cropped image onto canvas
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const originalSize = typeof fileOrUrl === 'string' ? dataUrl.length : (fileOrUrl as File).size;
        // Approximate base64 payload size in bytes
        const compressedSize = Math.round((dataUrl.length * 3) / 4);

        resolve({ dataUrl, originalSize, compressedSize });
      } catch (err) {
        reject(err);
      }
    };

    img.onload = handleLoadedImage;
    img.onerror = (e) => reject(new Error('Failed to load image for processing'));

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(fileOrUrl);
    }
  });
};

export const EmployeePhotoUploader: React.FC<EmployeePhotoUploaderProps> = ({
  currentPhoto = '',
  employeeName = 'Staff Member',
  gender = 'Female',
  onPhotoChange,
  variant = 'full',
  title = 'Employee Staff Photo',
  subtitle = 'Upload a high-resolution passport photo, use live camera, or pick a verified preset avatar',
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera' | 'presets' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhoto);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [presetFilter, setPresetFilter] = useState<'all' | 'Female' | 'Male'>('all');

  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync internal preview if currentPhoto prop changes
  useEffect(() => {
    setPreviewUrl(currentPhoto);
  }, [currentPhoto]);

  // Set default preset filter based on gender prop if available
  useEffect(() => {
    if (gender === 'Female' || gender === 'Male') {
      setPresetFilter(gender as 'Female' | 'Male');
    }
  }, [gender]);

  // Handle camera start/stop
  const startCamera = async (facing: 'user' | 'environment' = cameraFacingMode) => {
    setErrorMessage(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported on this device/browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);
      setCameraAvailable(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setIsCameraActive(false);
      setCameraAvailable(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in browser settings.'
          : 'Unable to access camera on this device. Please upload an image file instead.'
      );
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  // Clean up camera stream on unmount or mode switch
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Switch between camera modes
  const handleToggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Process file upload with compression
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await compressAndCropImage(file, 400, 0.85);
      setPreviewUrl(result.dataUrl);
      setCompressionInfo({
        original: result.originalSize,
        compressed: result.compressedSize,
      });
      onPhotoChange(result.dataUrl);
    } catch (err) {
      setErrorMessage('Could not process this image. Please try a different photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Capture photo from live video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const targetSize = 400;
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context error');

      // Crop video to center square
      const vWidth = video.videoWidth || 640;
      const vHeight = video.videoHeight || 480;
      let sx = 0;
      let sy = 0;
      let sWidth = vWidth;
      let sHeight = vHeight;

      if (vWidth > vHeight) {
        sWidth = vHeight;
        sx = (vWidth - vHeight) / 2;
      } else {
        sHeight = vWidth;
        sy = (vHeight - vWidth) / 2;
      }

      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const sizeBytes = Math.round((dataUrl.length * 3) / 4);

      setPreviewUrl(dataUrl);
      setCompressionInfo({
        original: sizeBytes,
        compressed: sizeBytes,
      });
      onPhotoChange(dataUrl);
      stopCamera();
    } catch (err) {
      setErrorMessage('Failed to capture snapshot from camera.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply preset avatar
  const handleSelectPreset = async (presetUrl: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await compressAndCropImage(presetUrl, 400, 0.85);
      setPreviewUrl(result.dataUrl);
      setCompressionInfo({
        original: result.originalSize,
        compressed: result.compressedSize,
      });
      onPhotoChange(result.dataUrl);
    } catch (err) {
      // If CORS blocks canvas export, fallback to URL directly
      setPreviewUrl(presetUrl);
      onPhotoChange(presetUrl);
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply custom URL
  const handleApplyCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await compressAndCropImage(customUrlInput.trim(), 400, 0.85);
      setPreviewUrl(result.dataUrl);
      onPhotoChange(result.dataUrl);
      setCustomUrlInput('');
    } catch (err) {
      // If direct compression fails due to CORS, use directly
      setPreviewUrl(customUrlInput.trim());
      onPhotoChange(customUrlInput.trim());
      setCustomUrlInput('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove / Reset photo
  const handleRemovePhoto = () => {
    const defaultPlaceholder =
      gender === 'Female'
        ? 'https://images.unsplash.com/photo-1594824813566-78a9327d3b5b?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80';
    setPreviewUrl(defaultPlaceholder);
    setCompressionInfo(null);
    onPhotoChange(defaultPlaceholder);
    stopCamera();
  };

  const formatKB = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="space-y-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-slate-100 shadow-xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={previewUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200'}
              alt={employeeName}
              className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg bg-slate-950"
            />
            {previewUrl && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">{title}</h4>
              {compressionInfo && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {formatKB(compressionInfo.compressed)} • Optimized
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition"
              title="Reset to default photo"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveMode('upload');
          }}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeMode === 'upload'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload File</span>
          <span className="sm:hidden">File</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('camera');
            startCamera();
          }}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeMode === 'camera'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Live Camera</span>
          <span className="sm:hidden">Camera</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveMode('presets');
          }}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeMode === 'presets'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preset Library</span>
          <span className="sm:hidden">Presets</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveMode('url');
          }}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeMode === 'url'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Image URL</span>
          <span className="sm:hidden">URL</span>
        </button>
      </div>

      {/* MODE 1: FILE UPLOAD (DRAG & DROP) */}
      {activeMode === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition flex flex-col items-center justify-center gap-2.5 ${
            dragOver
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-700 bg-slate-950/60 hover:border-emerald-500/60 hover:bg-slate-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Upload className="h-6 w-6" />
          </div>

          <div>
            <p className="font-bold text-white text-xs sm:text-sm">
              Click to select photo or drag and drop image here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports JPEG, PNG, WEBP (Photos are auto-cropped & compressed for ultra-fast load)
            </p>
          </div>

          <button
            type="button"
            className="mt-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            Browse Device Files
          </button>
        </div>
      )}

      {/* MODE 2: LIVE CAMERA CAPTURE */}
      {activeMode === 'camera' && (
        <div className="space-y-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
          <div className="relative aspect-video max-h-64 sm:max-h-72 w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover mirror"
                />
                {/* Visual Square Avatar Guide Overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-44 w-44 sm:h-52 sm:w-52 rounded-full border-2 border-dashed border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      Center Staff Face Here
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                <Camera className="h-10 w-10 text-slate-600" />
                <p className="text-xs text-slate-400">Camera preview inactive</p>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Start Camera Feed
                </button>
              </div>
            )}
          </div>

          {isCameraActive && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleToggleCameraFacing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <SwitchCamera className="h-4 w-4" />
                <span>Switch Camera ({cameraFacingMode === 'user' ? 'Front' : 'Back'})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                >
                  <Camera className="h-4 w-4" />
                  <span>{isProcessing ? 'Processing...' : 'Capture Photo'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: PRESET CLINICAL AVATARS */}
      {activeMode === 'presets' && (
        <div className="space-y-3">
          {/* Gender / Role Filter */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Choose Verified Avatar:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPresetFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  presetFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPresetFilter('Female')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  presetFilter === 'Female' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ♀ Female
              </button>
              <button
                type="button"
                onClick={() => setPresetFilter('Male')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  presetFilter === 'Male' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ♂ Male
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
            {HEALTHCARE_AVATAR_PRESETS.filter(
              (p) => presetFilter === 'all' || p.gender === presetFilter || p.gender === 'Other'
            ).map((preset) => {
              const isSelected = previewUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition p-1 text-left flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 shadow-md ring-2 ring-emerald-500/50'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="w-full text-center">
                    <p className="text-[10px] font-bold text-white truncate">{preset.label}</p>
                    <p className="text-[9px] text-slate-400">{preset.category}</p>
                  </div>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 4: CUSTOM IMAGE URL */}
      {activeMode === 'url' && (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApplyCustomUrl(e);
            }
          }}
          className="space-y-3"
        >
          <label className="block text-xs font-bold text-slate-300">
            Paste Direct Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              disabled={!customUrlInput.trim() || isProcessing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shrink-0"
            >
              Apply URL
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Ensure the URL points directly to an image file (e.g. .jpg, .png) or cloud storage asset.
          </p>
        </div>
      )}
    </div>
  );
};
