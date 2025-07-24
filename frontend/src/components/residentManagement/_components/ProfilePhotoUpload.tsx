// ============================================================================
// components/residents/form/ProfilePhotoUpload.tsx - Profile photo component
// ============================================================================

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';
import { buildImageUrl, getPlaceholderImageUrl } from '@/utils/imageUtils';

interface ProfilePhotoUploadProps {
  preview: string | null;
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  preview,
  onFileSelect,
  isUploading = false
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Cannot get canvas context');
      return;
    }

    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video not ready');
      alert('Please wait for the camera to load completely');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        // The parent component will handle the upload and preview
        onFileSelect(file);
        stopCamera();
      } else {
        console.error('Failed to create blob from canvas');
      }
    }, 'image/jpeg', 0.8);
  };

  if (isCameraOpen) {
    return (
      <div className="relative">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <div className="relative inline-block">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-80 h-60 object-cover rounded-lg"
              onLoadedMetadata={() => {
                console.log('Video metadata loaded');
              }}
              onError={(e) => {
                console.error('Video error:', e);
              }}
            />
            <button type="button"
              onClick={stopCamera}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-4 space-x-4">
            <button type="button"
              onClick={capturePhoto}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center mx-auto"
            >
              <FiCamera className="w-5 h-5 mr-2" />
              {t('residents.form.profilePhoto.capture', 'Capture Photo')}
            </button>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition ${
        isUploading ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {preview ? (
        <div className="w-32 h-32 mx-auto mb-4 relative">
          <img
            src={buildImageUrl(preview)}
            alt="Profile Preview"
            className="w-full h-full object-cover rounded-full border"
            // onError={(e) => {
            //   const target = e.target as HTMLImageElement;
            //   console.log('Image load error for:', preview);
            //   target.src = getPlaceholderImageUrl(128, 'No Photo');
            // }}
            onLoad={() => {
              console.log('Image loaded successfully for:', preview);
            }}
          />
        </div>
      ) : (
        <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <FiUpload className="w-12 h-12 text-gray-400" />
        </div>
      )}
      
      {isUploading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span className="ml-2 text-gray-600">
            {t('residents.form.profilePhoto.uploading', 'Uploading...')}
          </span>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            {t('residents.form.profilePhoto.upload', 'Upload Profile Photo')}
          </p>
          
          <div className="space-y-3">
            <button type="button"
              onClick={handleFileUpload}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
            >
              <FiUpload className="w-5 h-5 mr-2" />
              {t('residents.form.profilePhoto.chooseFile', 'Choose from Files')}
            </button>
            
            <button type="button"
              onClick={startCamera}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
            >
              <FiCamera className="w-5 h-5 mr-2" />
              {t('residents.form.profilePhoto.takePhoto', 'Take Photo')}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            {t('residents.form.profilePhoto.supportedFormats', 'Supported formats: JPG, PNG, GIF')}
          </p>
        </>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};