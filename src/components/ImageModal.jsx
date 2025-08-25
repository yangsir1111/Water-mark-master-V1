import React, { useEffect } from 'react'
import { X, Download } from 'lucide-react'

const ImageModal = ({ isOpen, onClose, image, title, onDownload }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {title}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="下载图片"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Image Container */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="flex items-center justify-center min-h-full">
            <img
              src={image}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              style={{ maxHeight: 'calc(90vh - 120px)' }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <span>点击图片外部区域或按 ESC 键关闭</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageModal