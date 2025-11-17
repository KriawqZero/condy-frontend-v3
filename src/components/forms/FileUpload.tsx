import { sendAnexoAction } from '@/app/actions/anexos';
import { removerAnexoPendente, salvarAnexoPendente } from '@/lib/api';
import { Anexo } from '@/types';
import { Trash } from 'lucide-react';
import { useRef, useState } from 'react';

interface FileUploadProps {
  onFilesUploaded: (anexos: Anexo[]) => void;
  anexos: Anexo[];
}

interface AnexoWithSize extends Anexo {
  fileSize?: number;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  anexo?: Anexo;
  preview: string;
  error?: string;
}

export function FileUpload({ onFilesUploaded, anexos }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<FileWithProgress[]>([]);
  const [anexosWithSize, setAnexosWithSize] = useState<Map<number, number>>(new Map());

  const handleFileSelect = async (files: FileList) => {
    const newFiles: FileWithProgress[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      preview: URL.createObjectURL(file),
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < newFiles.length; i++) {
      const fileData = newFiles[i];

      try {
        // Simular progresso de upload
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(f => (f.file === fileData.file && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f)),
          );
        }, 200);

        const response = await sendAnexoAction(fileData.file, fileData.file.name);

        clearInterval(progressInterval);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erro ao enviar anexo');
        }

        salvarAnexoPendente(response.data.id);

        // Armazenar o tamanho do arquivo
        setAnexosWithSize(prev => new Map(prev.set(response.data.id, fileData.file.size)));

        // Atualizar lista de anexos
        onFilesUploaded([...anexos, response.data]);

        URL.revokeObjectURL(fileData.preview);
        setUploadingFiles(prev => prev.filter(f => f.file !== fileData.file));
      } catch (error) {
        console.error(error);
        setUploadingFiles(prev =>
          prev.map(f => (f.file === fileData.file ? { ...f, status: 'error', error: 'Erro no upload' } : f)),
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (anexoId: number) => {
    const updatedAnexos = anexos.filter(anexo => anexo.id !== anexoId);
    onFilesUploaded(updatedAnexos);

    // Remover também dos anexos pendentes no localStorage
    removerAnexoPendente(anexoId);

    // Remover o tamanho do arquivo do estado
    setAnexosWithSize(prev => {
      const newMap = new Map(prev);
      newMap.delete(anexoId);
      return newMap;
    });

    console.log('Anexo removido da interface e dos pendentes:', anexoId);
  };

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => {
      const fileToRemove = prev.find(f => f.file === file);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.file !== file);
    });
  };

  return (
    <div className='space-y-4'>
      {/* Upload Area */}
      <div
        className='w-full border-2 border-dashed border-[#1F45FF] rounded-xl p-6 text-center text-[#1F45FF] cursor-pointer bg-[#EFF0FF] hover:bg-blue-50 transition-colors'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          width='41'
          height='40'
          viewBox='0 0 41 40'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='mx-auto mb-2'
        >
          <path
            d='M15.5222 28.3333V18.3333L12.1888 21.6667'
            stroke='#1F45FF'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M15.5222 18.3333L18.8556 21.6667'
            stroke='#1F45FF'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M37.1889 16.6667V25C37.1889 33.3333 33.8556 36.6667 25.5223 36.6667H15.5223C7.18892 36.6667 3.85559 33.3333 3.85559 25V15C3.85559 6.66667 7.18892 3.33333 15.5223 3.33333H23.8556'
            stroke='#1F45FF'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M37.1889 16.6667H30.5223C25.5223 16.6667 23.8556 15 23.8556 10V3.33333L37.1889 16.6667Z'
            stroke='#1F45FF'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <p className='font-afacad text-sm font-bold mb-2 text-black'>
          Grave um vídeo e tire fotos contextualizando o problema. Mostre o local afetado e descreva o que ocorreu.*
        </p>
        <p className='text-xs text-[#1F45FF]'>Escolha arquivos no formato JPG, PNG ou MP4 de no máximo 500MB</p>

        <input
          ref={fileInputRef}
          type='file'
          multiple
          accept='.jpg,.jpeg,.png,.webp,.mp4'
          onChange={e => e.target.files && handleFileSelect(e.target.files)}
          className='hidden'
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.map((fileData, index) => (
        <div key={index} className='bg-[#1F45FF] rounded-xl p-4 border border-gray-200 shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-3'>
              <div className='w-20 h-20 bg-[#EFF0FF] rounded flex items-center justify-center'>
                <div className='bg-[#1F45FF] text-white text-xs font-bold py-1 px-2 rounded'>
                  {(() => {
                    const name = fileData.file.name.toLowerCase();
                    const extension = name.split('.').pop() || '';
                    return extension.toUpperCase();
                  })()}
                </div>
              </div>
              <div>
                <p className='font-medium text-sm text-white'>{fileData.file.name}</p>
                <p className='text-xs text-white opacity-80'>{formatFileSize(fileData.file.size)}</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {fileData.status === 'error' && (
                <button onClick={() => removeUploadingFile(fileData.file)} className='text-white hover:text-red-200'>
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>

          {fileData.status === 'uploading' && (
            <div className='w-full bg-[#EFF0FF] rounded-full h-2'>
              <div
                className='bg-[#22D6A8] h-2 rounded-full transition-all'
                style={{ width: `${fileData.progress}%` }}
              />
            </div>
          )}

          {fileData.status === 'error' && (
            <p className='text-xs text-white flex items-center gap-1'>
              <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5Z'
                  stroke='white'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path d='M6 4V6' stroke='white' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M6 8H6.005' stroke='white' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              Erro: {fileData.error}
            </p>
          )}
        </div>
      ))}

      {/* Uploaded Files */}
      {anexos.map(anexo => (
        <div key={anexo.id} className='bg-[#1F45FF] rounded-xl p-4 border border-gray-200 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-20 h-20 bg-[#EFF0FF] rounded flex items-center justify-center'>
                <div className='bg-[#1F45FF] text-white text-xs font-bold py-1 px-2 rounded'>
                  {(() => {
                    if (typeof anexo.url === 'string') {
                      const url = anexo.url.toLowerCase();
                      const extension = url.split('.').pop() || '';
                      return extension.toUpperCase();
                    }
                    return 'FILE';
                  })()}
                </div>
              </div>
              <div>
                <p className='font-medium text-sm text-white'>{anexo.title}</p>
                <div className='flex flex-col'>
                  <p className='text-xs text-white flex items-center gap-1'>
                    {anexosWithSize.has(anexo.id)
                      ? formatFileSize(anexosWithSize.get(anexo.id)!)
                      : 'Tamanho desconhecido'}
                    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M6.87368 1.76698C3.8735 1.76698 1.42871 4.21177 1.42871 7.21195C1.42871 10.2121 3.8735 12.6569 6.87368 12.6569C9.87385 12.6569 12.3186 10.2121 12.3186 7.21195C12.3186 4.21177 9.87385 1.76698 6.87368 1.76698ZM9.47637 5.95961L6.38907 9.0469C6.31284 9.12313 6.20939 9.16669 6.10049 9.16669C5.99159 9.16669 5.88814 9.12313 5.81191 9.0469L4.27098 7.50598C4.11308 7.34807 4.11308 7.08671 4.27098 6.92881C4.42889 6.77091 4.69024 6.77091 4.84815 6.92881L6.10049 8.18115L8.8992 5.38244C9.05711 5.22454 9.31847 5.22454 9.47637 5.38244C9.63427 5.54034 9.63427 5.79626 9.47637 5.95961Z'
                        fill='#3EBF8F'
                      />
                    </svg>
                    Concluído
                  </p>
                </div>
              </div>
            </div>

            <button onClick={() => removeFile(anexo.id)} className='text-white hover:text-red-200'>
              <svg width='18' height='17' viewBox='0 0 18 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M15.1874 4.58052C15.1738 4.58052 15.1534 4.58052 15.133 4.58052C11.5325 4.21979 7.9388 4.08367 4.37916 4.4444L2.99069 4.58052C2.70483 4.60775 2.453 4.40356 2.42577 4.1177C2.39855 3.83184 2.60274 3.58682 2.88179 3.55959L4.27026 3.42347C7.89116 3.05593 11.5597 3.19886 15.2351 3.55959C15.5141 3.58682 15.7183 3.83865 15.6911 4.1177C15.6707 4.38314 15.446 4.58052 15.1874 4.58052Z'
                  fill='white'
                />
                <path
                  d='M6.67967 3.89311C6.65245 3.89311 6.62522 3.89311 6.59119 3.88631C6.31894 3.83866 6.12837 3.57322 6.17601 3.30097L6.32575 2.40936C6.43465 1.75596 6.58438 0.850739 8.17023 0.850739H9.95346C11.5461 0.850739 11.6958 1.78999 11.7979 2.41617L11.9477 3.30097C11.9953 3.58003 11.8047 3.84547 11.5325 3.88631C11.2534 3.93395 10.988 3.74338 10.9472 3.47113L10.7974 2.58632C10.7021 1.99418 10.6817 1.87848 9.96026 1.87848H8.17704C7.45558 1.87848 7.44197 1.97376 7.33987 2.57951L7.18333 3.46432C7.14249 3.71615 6.9247 3.89311 6.67967 3.89311Z'
                  fill='white'
                />
                <path
                  d='M11.2465 15.4841H6.87695C4.50158 15.4841 4.40629 14.1705 4.33143 13.1087L3.88902 6.25485C3.8686 5.9758 4.0864 5.73077 4.36546 5.71036C4.65132 5.69674 4.88953 5.90774 4.90995 6.18679L5.35236 13.0406C5.42722 14.0752 5.45445 14.4631 6.87695 14.4631H11.2465C12.6758 14.4631 12.7031 14.0752 12.7711 13.0406L13.2135 6.18679C13.2339 5.90774 13.479 5.69674 13.758 5.71036C14.0371 5.73077 14.2549 5.96899 14.2345 6.25485L13.7921 13.1087C13.7172 14.1705 13.6219 15.4841 11.2465 15.4841Z'
                  fill='white'
                />
                <path
                  d='M10.1917 11.7407H7.92526C7.64621 11.7407 7.41479 11.5093 7.41479 11.2302C7.41479 10.9512 7.64621 10.7197 7.92526 10.7197H10.1917C10.4708 10.7197 10.7022 10.9512 10.7022 11.2302C10.7022 11.5093 10.4708 11.7407 10.1917 11.7407Z'
                  fill='white'
                />
                <path
                  d='M10.7634 9.01818H7.36032C7.08126 9.01818 6.84985 8.78677 6.84985 8.50772C6.84985 8.22866 7.08126 7.99725 7.36032 7.99725H10.7634C11.0425 7.99725 11.2739 8.22866 11.2739 8.50772C11.2739 8.78677 11.0425 9.01818 10.7634 9.01818Z'
                  fill='white'
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
