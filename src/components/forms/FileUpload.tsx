import { sendAnexoAction } from "@/app/actions/anexos";
import { removerAnexoPendente } from "@/lib/api";
import { Anexo } from "@/types";
import { CheckCircle, File, Trash, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploadProps {
  onFilesUploaded: (anexos: Anexo[]) => void;
  anexos: Anexo[];
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  anexo?: Anexo;
  error?: string;
}

export function FileUpload({ onFilesUploaded, anexos }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<FileWithProgress[]>([]);

  const handleFileSelect = async (files: FileList) => {
    const newFiles: FileWithProgress[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadingFiles((prev) => [...prev, ...newFiles]);

    for (let i = 0; i < newFiles.length; i++) {
      const fileData = newFiles[i];

      try {
        // Simular progresso de upload
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === fileData.file && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 200);

        const response = await sendAnexoAction(fileData.file);

        clearInterval(progressInterval);

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === fileData.file
              ? {
                  ...f,
                  progress: 100,
                  status: "completed",
                  anexo: response.data,
                }
              : f
          )
        );

        // Atualizar lista de anexos
        onFilesUploaded([...anexos, response.data]);
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === fileData.file
              ? { ...f, status: "error", error: "Erro no upload" }
              : f
          )
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = (anexoId: number) => {
    const updatedAnexos = anexos.filter((anexo) => anexo.id !== anexoId);
    onFilesUploaded(updatedAnexos);
    
    // Remover também dos anexos pendentes no localStorage
    removerAnexoPendente(anexoId);
  };

  const removeUploadingFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="w-full border-2 border-dashed border-[#1F45FF] rounded-xl p-6 text-center text-[#1F45FF] cursor-pointer hover:bg-blue-50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={48} className="mx-auto mb-2" />
        <p className="font-afacad text-sm font-bold mb-2">
          Grave um vídeo e tire fotos contextualizando o problema. Mostre o
          local afetado e descreva o que ocorreu.*
        </p>
        <p className="text-xs">
          Escolha arquivos no formato JPG, PNG ou MP4 de no máximo 500MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.mp4"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.map((fileData, index) => (
        <div key={index} className="bg-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <File size={20} className="text-[#1F45FF]" />
              <div>
                <p className="font-medium text-sm text-black">
                  {fileData.file.name}
                </p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(fileData.file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {fileData.status === "completed" && (
                <CheckCircle size={20} className="text-green-500" />
              )}
              {fileData.status === "error" && (
                <button
                  onClick={() => removeUploadingFile(fileData.file)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>

          {fileData.status === "uploading" && (
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-[#1F45FF] h-2 rounded-full transition-all"
                style={{ width: `${fileData.progress}%` }}
              />
            </div>
          )}

          {fileData.status === "completed" && (
            <p className="text-xs text-green-600">✓ Carregando seu documento</p>
          )}

          {fileData.status === "error" && (
            <p className="text-xs text-red-600">Erro: {fileData.error}</p>
          )}
        </div>
      ))}

      {/* Uploaded Files */}
      {anexos.map((anexo) => (
        <div key={anexo.id} className="bg-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File size={20} className="text-[#1F45FF]" />
              <div>
                <p className="font-medium text-sm text-black">
                  {anexo.title || "Documento"}
                </p>
                <p className="text-xs text-green-600">✓ Concluído</p>
              </div>
            </div>

            <button
              onClick={() => removeFile(anexo.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
