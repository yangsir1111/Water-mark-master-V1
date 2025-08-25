import React, { useCallback, useState } from 'react'
import { Upload, X, Image, Trash2 } from 'lucide-react'

const FileUpload = ({ onFilesSelected, selectedFiles }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragOver to false if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      onFilesSelected(files)
    } else if (e.dataTransfer.files.length > 0) {
      // Show message if files were dropped but none were valid images
      alert(`拖放了 ${e.dataTransfer.files.length} 个文件，但没有有效的图片文件。请选择 JPG、PNG 或 WebP 格式的图片。`)
    }
  }, [onFilesSelected])

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }, [onFilesSelected])

  const clearAllFiles = useCallback(() => {
    if (selectedFiles.length === 0) return
    
    if (window.confirm(`确定要移除所有 ${selectedFiles.length} 个文件吗？`)) {
      onFilesSelected([])
    }
  }, [selectedFiles, onFilesSelected])

  const removeFile = useCallback((index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    onFilesSelected(newFiles)
  }, [selectedFiles, onFilesSelected])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`upload-area ${isDragOver ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-primary-500' : 'text-gray-400'}`} />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          拖拽图片到此处
        </h3>
        <p className="text-gray-500 mb-4">
          或点击下方按钮选择文件
        </p>
        <label className="btn-primary cursor-pointer inline-block">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          选择图片文件
        </label>
        <p className="text-xs text-gray-400 mt-2">
          支持 JPG、PNG、WebP 格式，可选择多个文件
        </p>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              已选择 {selectedFiles.length} 个文件
            </h4>
            <button
              onClick={clearAllFiles}
              className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="移除所有文件"
            >
              <Trash2 className="w-3 h-3" />
              <span>清除全部</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border">
                <Image className="w-8 h-8 text-gray-400 flex-shrink-0" />
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  title="移除文件"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload