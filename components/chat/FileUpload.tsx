'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, CheckCircle, AlertCircle, Zap, Sparkles, X } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (message: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function FileUpload({ onUploadSuccess, isCollapsed = false, onToggleCollapse }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setStatusMessage('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setStatusMessage(result.message);
        onUploadSuccess(`✅ ${result.message}`);
      } else {
        setUploadStatus('error');
        setStatusMessage(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Collapsed view
  if (isCollapsed) {
    return (
      <Card className="mb-4 bg-gray-800/40 border-gray-700/50 backdrop-blur-md shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Upload className="h-5 w-5 text-purple-400" />
                <Sparkles className="h-2 w-2 text-yellow-400 absolute -top-0.5 -right-0.5 animate-ping" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">CSV Data Loaded</p>
                <p className="text-xs text-gray-400">Ready to chat with your data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                size="sm"
                disabled={uploading}
                className="bg-gray-900/80 text-white border-gray-700/60 hover:bg-purple-900/40 hover:border-purple-600/80 backdrop-blur-sm shadow-md transition-all duration-300 group"
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className="flex items-center space-x-1">
                  <File className="h-3 w-3 group-hover:text-purple-400 transition-colors" />
                  {uploading && <Zap className="h-3 w-3 text-purple-400 animate-spin" />}
                  <span className="text-xs">{uploading ? 'Uploading...' : 'New CSV'}</span>
                </div>
              </Button>
              {onToggleCollapse && (
                <Button
                  onClick={onToggleCollapse}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800/60"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {uploadStatus !== 'idle' && (
            <div className={`mt-3 p-2 rounded-lg flex items-center space-x-2 backdrop-blur-sm shadow-md ${
              uploadStatus === 'success' 
                ? 'bg-green-900/40 text-green-300 border border-green-700/50' 
                : 'bg-red-900/40 text-red-300 border border-red-700/50'
            }`}>
              {uploadStatus === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">{statusMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Expanded view (original)
  return (
    <Card className="mb-4 bg-gray-800/40 border-gray-700/50 backdrop-blur-md shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Upload className="h-6 w-6 text-purple-400" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">⚡ Feed Botzilla your CSV data</p>
              <p className="text-sm text-gray-300/80">Drag, drop, or click to unleash the power!</p>
            </div>
          </div>
          {onToggleCollapse && uploadStatus === 'success' && (
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800/60"
              title="Collapse upload section"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div
          className="border-2 border-dashed border-gray-600/60 rounded-lg p-8 text-center hover:border-gray-500/80 transition-all duration-300 backdrop-blur-sm"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-300/90 hover:text-purple-400 transition-colors duration-300" />
            
            <Button 
              variant="outline"
              disabled={uploading}
              className="relative bg-gray-900/80 text-white border-gray-700/60 hover:bg-purple-900/40 hover:border-purple-600/80 backdrop-blur-sm shadow-md transition-all duration-300 group"
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
                {uploading && <Zap className="h-3 w-3 text-purple-400 animate-spin" />}
                <span>{uploading ? '🔥 Botzilla is processing...' : '📁 Choose File'}</span>
              </div>
            </Button>
          </div>
        </div>

        {uploadStatus !== 'idle' && (
          <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 backdrop-blur-sm shadow-md ${
            uploadStatus === 'success' 
              ? 'bg-green-900/40 text-green-300 border border-green-700/50' 
              : 'bg-red-900/40 text-red-300 border border-red-700/50'
          }`}>
            {uploadStatus === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}