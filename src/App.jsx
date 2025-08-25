import React, { useState, useCallback } from 'react'
import { Upload, Download, Settings, Image as ImageIcon, Droplets, Trash2, FileX } from 'lucide-react'
import logoImage from './assets/icons/108.png'
import FileUpload from './components/FileUpload'
import WatermarkConfig from './components/WatermarkConfig'
import ImagePreview from './components/ImagePreview'
import { processImagesWithWatermark, downloadProcessedImages } from './utils/imageProcessor'
import { downloadImagesAsZip, confirmBatchDownload, showDownloadComplete } from './utils/zipDownload'

function App() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [processedImages, setProcessedImages] = useState([])
  const [watermarkConfig, setWatermarkConfig] = useState({
    // Text watermark settings
    text: '水印文字',
    fontSize: 24,
    opacity: 0.7,
    position: 'bottom-right',
    color: '#ffffff',
    offsetX: 20,
    offsetY: 20,
    // Multi-text distribution settings
    textDistribution: 'single', // 'single' or 'multi'
    textSpacing: 300, // Distance between repeated text in multi mode
    textRotation: 0, // Text rotation in degrees
    textShadow: true, // Enable/disable text shadow
    // Text percentage-based positioning (new slider system)
    textHorizontalPosition: 80, // 0-100%, default 80% (right side)
    textVerticalPosition: 80, // 0-100%, default 80% (bottom side)
    // Logo watermark settings
    logoFile: null,
    logoSize: 100,
    logoOpacity: 0.8,
    logoPosition: 'bottom-right',
    logoOffsetX: 20,
    logoOffsetY: 20,
    logoRotation: 0,
    logoDistribution: 'single', // 'single' or 'multi'
    logoSpacing: 150, // Distance between repeated logos in multi mode
    // Logo percentage-based positioning (new slider system)
    logoHorizontalPosition: 80, // 0-100%, default 80% (right side)
    logoVerticalPosition: 80, // 0-100%, default 80% (bottom side)
    watermarkType: 'text' // 'text' or 'logo' or 'both'
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelected = useCallback((files) => {
    setSelectedFiles(files)
    setProcessedImages([])
  }, [])

  const handleProcessImages = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    try {
      const processed = await processImagesWithWatermark(selectedFiles, watermarkConfig)
      setProcessedImages(processed)
    } catch (error) {
      console.error('Error processing images:', error)
      alert('处理图片时出现错误，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadAll = async () => {
    if (processedImages.length === 0) return
    
    const validImages = processedImages.filter(img => img.url && !img.error)
    if (validImages.length === 0) {
      alert('没有可下载的已处理图片')
      return
    }
    
    // Show confirmation dialog
    if (!confirmBatchDownload(validImages.length)) {
      return
    }
    
    try {
      const result = await downloadImagesAsZip(validImages, 'watermarked_images.zip')
      if (result.success) {
        showDownloadComplete(result.count)
      }
    } catch (error) {
      console.error('Zip download error:', error)
      alert(`下载失败: ${error.message}`)
    }
  }

  const handleClearAll = () => {
    if (selectedFiles.length === 0 && processedImages.length === 0) return
    
    const confirmMessage = selectedFiles.length > 0 
      ? `确定要清除所有 ${selectedFiles.length} 张图片吗？这将移除原图和已处理的图片。`
      : '确定要清除所有已处理的图片吗？'
    
    if (window.confirm(confirmMessage)) {
      // Clean up object URLs to prevent memory leaks
      processedImages.forEach(image => {
        if (image.url) {
          URL.revokeObjectURL(image.url)
        }
      })
      
      // Clean up logo preview URL if exists
      if (watermarkConfig.logoFile && watermarkConfig.logoFile.previewUrl) {
        URL.revokeObjectURL(watermarkConfig.logoFile.previewUrl)
      }
      
      setSelectedFiles([])
      setProcessedImages([])
      
      // Reset watermark config to initial state including logo
      setWatermarkConfig({
        // Text watermark settings
        text: '水印文字',
        fontSize: 24,
        opacity: 0.7,
        position: 'bottom-right',
        color: '#ffffff',
        offsetX: 20,
        offsetY: 20,
        // Multi-text distribution settings
        textDistribution: 'single',
        textSpacing: 300,
        textRotation: 0,
        textShadow: true,
        // Text percentage-based positioning
        textHorizontalPosition: 80,
        textVerticalPosition: 80,
        // Logo watermark settings
        logoFile: null,
        logoSize: 100,
        logoOpacity: 0.8,
        logoPosition: 'bottom-right',
        logoOffsetX: 20,
        logoOffsetY: 20,
        logoRotation: 0,
        logoDistribution: 'single',
        logoSpacing: 150,
        // Logo percentage-based positioning
        logoHorizontalPosition: 80,
        logoVerticalPosition: 80,
        watermarkType: 'text' // Reset to text mode
      })
    }
  }

  const handleConfigChange = (newConfig) => {
    console.log('Watermark config changed:', newConfig)
    setWatermarkConfig(newConfig)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 19C3.46 19 1 16.54 1 13.5C1 10.46 3.46 8 6.5 8H7C8.11 5.22 10.88 3 14 3C17.86 3 21 6.14 21 10C21 10.55 20.94 11.08 20.83 11.6C21.55 12.24 22 13.17 22 14C22 15.86 20.58 17.42 18.75 17.87C18.36 18.54 17.5 19 16.5 19H6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">水印大师</h1>
                <p className="text-sm text-gray-500">批量图片加水印工具</p>
              </div>
            </div>
            <a 
              href="https://7studylab.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={logoImage} 
                alt="返回小铁匠" 
                className="h-8 w-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Logo image failed to load');
                }}
              />
              <span className="text-sm font-medium text-gray-700 ml-2">返回小铁匠</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">上传图片</h2>
              </div>
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                selectedFiles={selectedFiles}
              />
            </div>

            {/* Image Preview Section */}
            {selectedFiles.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">图片预览</h2>
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm font-medium">
                      {selectedFiles.length} 张图片
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProcessImages}
                      disabled={isProcessing || selectedFiles.length === 0}
                      className={`btn-primary ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? '处理中...' : '添加水印'}
                    </button>
                    {processedImages.length > 0 && (
                      <>
                        <button
                          onClick={handleDownloadAll}
                          className="btn-secondary flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                          title="打包下载所有已处理的图片为ZIP文件"
                        >
                          <Download className="w-4 h-4" />
                          <span>打包下载 ({processedImages.filter(img => img.url && !img.error).length})</span>
                        </button>
                      </>
                    )}
                    {(selectedFiles.length > 0 || processedImages.length > 0) && (
                      <button
                        onClick={handleClearAll}
                        className="btn-secondary flex items-center space-x-2 bg-red-600 text-white hover:bg-red-700"
                        title="清除所有图片"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>清除全部</span>
                      </button>
                    )}
                  </div>
                </div>
                <ImagePreview 
                  originalImages={selectedFiles}
                  processedImages={processedImages}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </div>

          {/* Watermark Configuration Section */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">水印设置</h2>
              </div>
              <WatermarkConfig 
                config={watermarkConfig}
                onChange={handleConfigChange}
              />
            </div>

            {/* Usage Tips */}
            <div className="card p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">使用提示</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 支持 JPG、PNG、WebP 格式</li>
                <li>• 可同时处理多张图片</li>
                <li>• 支持拖拽上传</li>
                <li>• 可自定义水印位置和透明度</li>
                <li>• 处理后可批量下载</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App