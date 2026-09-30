"use client";

import React, { useState, useRef } from "react";
import { useUploadResumeMutation, useGetResumeQuery, useDeleteResumeMutation } from "@/services/api/resumeApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
} from "lucide-react";

interface ResumeData {
  filename?: string;
  originalName?: string;
  size?: number;
  pages?: number;
  parsedData?: {
    skills: string[];
    experience: string | null;
    qualification: string | null;
    summary: string;
  };
}

export default function ResumeUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);

  const { data: resumeData, isLoading: isLoadingResume } = useGetResumeQuery();
  const [uploadResume, { isLoading: isUploading }] = useUploadResumeMutation();
  const [deleteResume, { isLoading: isDeleting }] = useDeleteResumeMutation();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);
    setParsedData(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const result = await uploadResume(formData).unwrap();
      setUploadSuccess(true);
      setParsedData(result.resume);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      alert(error.data?.message || "Failed to upload resume");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your resume?")) return;

    try {
      await deleteResume().unwrap();
      setUploadSuccess(false);
      setParsedData(null);
      setSelectedFile(null);
    } catch (error: any) {
      alert(error.data?.message || "Failed to delete resume");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Show existing resume if uploaded
  if (resumeData?.resume && !selectedFile && !uploadSuccess) {
    const resume = resumeData.resume;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Your Resume
          </h3>
          <Badge className="bg-green-100 text-green-700 border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Uploaded
          </Badge>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{resume.filename}</p>
              <p className="text-xs text-slate-500">PDF Document</p>
            </div>
          </div>
        </div>

        {/* Parsed Data Preview */}
        {resume.parsedData && (
          <div className="space-y-3 mb-4">
            {resume.parsedData.skills && resume.parsedData.skills.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Skills Detected:</p>
                <div className="flex flex-wrap gap-1">
                  {resume.parsedData.skills.slice(0, 8).map((skill: string, idx: number) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-700 border-0 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {resume.parsedData.skills.length > 8 && (
                    <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                      +{resume.parsedData.skills.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {resume.parsedData.experience && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Experience:</span>
                <span className="font-bold text-slate-900">{resume.parsedData.experience}</span>
              </div>
            )}

            {resume.parsedData.qualification && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Qualification:</span>
                <span className="font-bold text-slate-900">{resume.parsedData.qualification}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1" />
            )}
            Delete Resume
          </Button>
        </div>
      </div>
    );
  }

  // Upload form
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-blue-600" />
        Upload Resume (CV)
      </h3>

      {/* Drop Zone */}
      <form
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onSubmit={(e) => e.preventDefault()}
      >
        <label
          className={`
            relative flex flex-col items-center justify-center w-full h-40
            border-2 border-dashed rounded-xl cursor-pointer transition-all
            ${dragActive
              ? "border-blue-500 bg-blue-50"
              : selectedFile
                ? "border-green-500 bg-green-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleChange}
          />

          {selectedFile ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
              <p className="text-sm font-bold text-green-700">{selectedFile.name}</p>
              <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-slate-500 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                Drag & drop your resume here
              </p>
              <p className="text-xs text-slate-500">or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">PDF only, max 5MB</p>
            </>
          )}
        </label>
      </form>

      {/* Upload Button */}
      {selectedFile && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading & Parsing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="border-slate-300"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && parsedData && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-bold text-green-700">Resume uploaded successfully!</p>
          </div>
          <p className="text-xs text-green-600">
            Your resume has been parsed and skills have been extracted.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-bold mb-1">Why upload your resume?</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>We automatically extract your skills and experience</li>
              <li>Get matched with relevant job opportunities</li>
              <li>Employers can view your detailed profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
