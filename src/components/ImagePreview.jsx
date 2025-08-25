import React, { useState } from 'react'
import { Download, Loader, CheckCircle } from 'lucide-react'
import ImageModal from './ImageModal'

const ImagePreview = ({ originalImages, processedImages, isProcessing }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    image: null,
    title: '',
    onDownload: null
  })

  const openModal = (image, title, onDownload = null) => {
    setModalState({
      isOpen: true,
      image,
      title,
      onDownload
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      image: null,
      title: '',
      onDownload: null
    })
  }
  const downloadSingleImage = (processedImage) => {
    const link = document.createElement('a')
    link.download = `watermarked_${processedImage.originalName}`
    link.href = processedImage.url
    link.click()
  }

  return (
    <>
      <ImageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        image={modalState.image}
        title={modalState.title}
        onDownload={modalState.onDownload}
      />
      
      <div className="space-y-4">
      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {originalImages.map((file, index) => {
          const processedImage = processedImages[index]
          const isCurrentlyProcessing = isProcessing && !processedImage
          const isCompleted = processedImage && !processedImage.error
          const hasError = processedImage && processedImage.error

          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image Container */}
              <div className="relative bg-gray-50 aspect-video">
                {isCurrentlyProcessing ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">正在添加水印...</p>
                    </div>
                  </div>
                ) : isCompleted ? (
                  <>
                    <img
                      src={processedImage.url}
                      alt={`Watermarked ${file.name}`}
                      className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openModal(
                        processedImage.url,
                        `水印处理后 - ${file.name}`,
                        () => downloadSingleImage(processedImage)
                      )}
                      title="点击放大预览"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </>
                ) : hasError ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-red-500 text-2xl mb-2">❌</div>
                      <p className="text-sm text-red-600">处理失败</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openModal(
                      URL.createObjectURL(file),
                      `原始图片 - ${file.name}`
                    )}
                    title="点击放大预览"
                  />
                )}
              </div>
              
              {/* File Info and Actions */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  {isCompleted && (
                    <button
                      onClick={() => downloadSingleImage(processedImage)}
                      className="ml-2 bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700 transition-colors flex items-center space-x-1"
                      title="下载此图片"
                    >
                      <Download className="w-3 h-3" />
                      <span>下载</span>
                    </button>
                  )}
                </div>
                
                {/* Status Indicator */}
                <div className="mt-2">
                  {isCurrentlyProcessing && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">处理中</span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs">已完成</span>
                    </div>
                  )}
                  {hasError && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs">处理失败</span>
                    </div>
                  )}
                  {!processedImage && !isCurrentlyProcessing && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-xs">等待处理</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 text-primary-500 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-700">正在批量处理图片...</p>
              <div className="w-full bg-primary-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(processedImages.length / originalImages.length) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-primary-600 mt-1">
                进度: {processedImages.length} / {originalImages.length} 张图片
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {processedImages.length > 0 && processedImages.length === originalImages.length && !isProcessing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-green-700">
              批量处理完成！成功处理 {processedImages.filter(img => !img.error).length} 张图片
              {processedImages.filter(img => img.error).length > 0 && (
                <span className="text-red-600 ml-2">
                  ({processedImages.filter(img => img.error).length} 张失败)
                </span>
              )}
            </p>
          </div>
        </div>
      )}      
    </div>
    </>
  )
}

export default ImagePreview