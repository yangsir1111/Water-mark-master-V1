import React, { useState } from 'react'
import { Upload, Image, RotateCw, X } from 'lucide-react'

const WatermarkConfig = ({ config, onChange }) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [logoUploadKey, setLogoUploadKey] = useState(0)

  const handleChange = (key, value) => {
    onChange({
      ...config,
      [key]: value
    })
  }

  const validateLogo = (file) => {
    return new Promise((resolve, reject) => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        reject('Logo文件大小不能超过5MB，请选择更小的图片文件。')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        reject('请选择有效的图片文件（PNG、JPG、JPEG、SVG）。')
        return
      }

      // Check image dimensions
      const img = new Image()
      img.onload = () => {
        if (img.width > 500 || img.height > 500) {
          reject('Logo图片尺寸不能超过500x500像素，请调整图片大小后重新上传。')
          return
        }
        resolve(true)
      }
      img.onerror = () => {
        reject('无法读取图片文件，请确认文件格式正确。')
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleLogoUpload = async (file) => {
    if (!file) return
    
    setIsValidating(true)
    setUploadError('')
    
    try {
      await validateLogo(file)
      
      // Clean up previous logo URL to prevent memory leaks
      if (config.logoFile && typeof config.logoFile.url === 'string') {
        URL.revokeObjectURL(config.logoFile.url)
      }
      
      // Create preview URL for the logo
      const logoWithPreview = {
        ...file,
        previewUrl: URL.createObjectURL(file)
      }
      
      handleChange('logoFile', logoWithPreview)
      
      console.log('Logo file uploaded successfully:', logoWithPreview)
      
      // Auto-switch to logo mode when logo is uploaded successfully
      if (config.watermarkType === 'text') {
        handleChange('watermarkType', 'logo')
        console.log('Switched watermark type to logo')
      }
      
      setUploadError('')
    } catch (error) {
      setUploadError(error)
      // Clean up failed upload
      if (file) {
        URL.revokeObjectURL(URL.createObjectURL(file))
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleLogoFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleLogoUpload(file)
    }
  }

  const handleLogoDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        handleLogoUpload(file)
      } else {
        setUploadError('请选择有效的图片文件')
      }
    }
  }

  const handleLogoDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleLogoDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragOver to false if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false)
    }
  }

  const handleLogoDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const removeLogo = () => {
    // Clean up logo preview URL to prevent memory leaks
    if (config.logoFile && config.logoFile.previewUrl) {
      URL.revokeObjectURL(config.logoFile.previewUrl)
    }
    
    handleChange('logoFile', null)
    setUploadError('')
    
    // Force re-render of the upload area by changing the key
    setLogoUploadKey(prev => prev + 1)
    
    // Do NOT change watermark type - stay in current mode and show upload area
    // This allows users to upload a new logo without mode switching
  }

  const positions = [
    { value: 'top-left', label: '左上角' },
    { value: 'top-right', label: '右上角' },
    { value: 'bottom-left', label: '左下角' },
    { value: 'bottom-right', label: '右下角' },
    { value: 'center', label: '居中' }
  ]

  return (
    <div className="space-y-6">
      {/* Watermark Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          水印类型
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleChange('watermarkType', 'text')}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              config.watermarkType === 'text'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            文字水印
          </button>
          <button
            onClick={() => handleChange('watermarkType', 'logo')}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              config.watermarkType === 'logo'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Logo水印
          </button>
          <button
            onClick={() => handleChange('watermarkType', 'both')}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              config.watermarkType === 'both'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            同时使用
          </button>
        </div>
      </div>

      {/* Logo Upload Section - Only show in logo mode */}
      {(config.watermarkType === 'logo' || config.watermarkType === 'both') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Logo水印上传
            </label>
          </div>
          
          {/* Error Message */}
          {uploadError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-500 text-sm">⚠️</span>
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            </div>
          )}
          
          {!config.logoFile ? (
            <div
              key={logoUploadKey}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              } ${isValidating ? 'opacity-50 cursor-wait' : ''}`}
              onDrop={handleLogoDrop}
              onDragOver={handleLogoDragOver}
              onDragEnter={handleLogoDragEnter}
              onDragLeave={handleLogoDragLeave}
            >
              {isValidating ? (
                <>
                  <div className="w-8 h-8 mx-auto mb-2 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                  <p className="text-sm text-gray-600 mb-2">正在验证图片...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">拖拽Logo图片到此处</p>
                  <label className="bg-primary-600 text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-primary-700 transition-colors inline-block">
                    <input
                      key={`logo-input-${logoUploadKey}`}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileSelect}
                      className="hidden"
                      disabled={isValidating}
                      value=""
                    />
                    选择Logo文件
                  </label>
                </>
              )}
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <p>支持 PNG、JPG、SVG 格式</p>
                <p>文件大小不超过5MB，尺寸不超过500x500px</p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Image className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{config.logoFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(config.logoFile.size / 1024).toFixed(1)}KB)
                  </span>
                </div>
                <button
                  onClick={removeLogo}
                  className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  title="移除Logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                <img
                  key={`logo-preview-${config.logoFile.name}-${logoUploadKey}`}
                  src={config.logoFile.previewUrl || URL.createObjectURL(config.logoFile)}
                  alt="Logo preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    console.warn('Logo preview failed to load for:', config.logoFile.name)
                    e.target.style.display = 'none'
                    const fallbackDiv = e.target.parentNode.querySelector('.fallback-text')
                    if (fallbackDiv) {
                      fallbackDiv.style.display = 'block'
                    }
                  }}
                  onLoad={(e) => {
                    // Hide fallback text when image loads successfully
                    const fallbackDiv = e.target.parentNode.querySelector('.fallback-text')
                    if (fallbackDiv) {
                      fallbackDiv.style.display = 'none'
                    }
                  }}
                />
                <div className="fallback-text text-gray-400 text-sm" style={{display: 'none'}}>
                  预览失败
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Logo Configuration - Only show when logo is selected and mode allows */}
      {(config.watermarkType === 'logo' || config.watermarkType === 'both') && config.logoFile && (
        <>
          {/* Logo Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo大小: {config.logoSize}px
            </label>
            <input
              type="range"
              min="20"
              max="800"
              value={config.logoSize}
              onChange={(e) => handleChange('logoSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20px</span>
              <span>800px</span>
            </div>
          </div>

          {/* Logo Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo透明度: {Math.round(config.logoOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={config.logoOpacity}
              onChange={(e) => handleChange('logoOpacity', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Logo Position - Only show in single mode */}
          {config.logoDistribution === 'single' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo水平位置: {Math.round((config.logoHorizontalPosition || 50))}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={config.logoHorizontalPosition || 50}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    console.log('Logo horizontal slider changed to:', value)
                    handleChange('logoHorizontalPosition', value)
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>左边缘 (0%)</span>
                  <span>中间 (50%)</span>
                  <span>右边缘 (100%)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo垂直位置: {Math.round((config.logoVerticalPosition || 50))}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={config.logoVerticalPosition || 50}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    console.log('Logo vertical slider changed to:', value)
                    handleChange('logoVerticalPosition', value)
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>顶部 (0%)</span>
                  <span>中间 (50%)</span>
                  <span>底部 (100%)</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                <p className="font-medium mb-1">精确定位：</p>
                <p>• 水平位置: 0%=左边缘, 50%=居中, 100%=右边缘</p>
                <p>• 垂直位置: 0%=顶部, 50%=居中, 100%=底部</p>
                <p>• Logo会自动调整以保持在图片范围内</p>
              </div>
            </div>
          )}

          {/* Logo Rotation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo旋转: {config.logoRotation}°
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="360"
                value={config.logoRotation}
                onChange={(e) => handleChange('logoRotation', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <RotateCw className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Logo Distribution Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo分布模式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleChange('logoDistribution', 'single')}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  config.logoDistribution === 'single'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                单个Logo
              </button>
              <button
                onClick={() => handleChange('logoDistribution', 'multi')}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  config.logoDistribution === 'multi'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                多个Logo
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              单个Logo：在指定位置显示一个Logo | 多个Logo：在整个图片上均匀分布Logo
            </p>
          </div>

          {/* Logo Spacing - Only show in multi mode */}
          {config.logoDistribution === 'multi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo间距: {config.logoSpacing}px
              </label>
              <input
                type="range"
                min="50"
                max="500"
                value={config.logoSpacing}
                onChange={(e) => handleChange('logoSpacing', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50px</span>
                <span>500px</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                调整多个Logo之间的距离，值越小Logo密度越高
              </p>
            </div>
          )}


        </>
      )}

      {/* Text Configuration - Only show when text is selected */}
      {(config.watermarkType === 'text' || config.watermarkType === 'both') && (
        <>
          {/* Watermark Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              水印文字
            </label>
            <input
              type="text"
              value={config.text}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="输入水印文字"
            />
          </div>

          {/* Text Distribution Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字分布模式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleChange('textDistribution', 'single')}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  config.textDistribution === 'single'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                单个水印
              </button>
              <button
                onClick={() => handleChange('textDistribution', 'multi')}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  config.textDistribution === 'multi'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                多个水印
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              单个水印：在指定位置显示一个水印 | 多个水印：在整个图片上均匀分布水印
            </p>
          </div>

          {/* Text Spacing - Only show in multi mode */}
          {config.textDistribution === 'multi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文字间距: {config.textSpacing}px
              </label>
              <input
                type="range"
                min="50"
                max="1200"
                value={config.textSpacing}
                onChange={(e) => handleChange('textSpacing', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50px</span>
                <span>1200px</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                调整水印文字之间的间距，间距越小水印越密集
              </p>
            </div>
          )}

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              字体大小: {config.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="300"
              value={config.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>12px</span>
              <span>300px</span>
            </div>
          </div>

          {/* Text Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字透明度: {Math.round(config.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={config.opacity}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Text Position - Only show in single mode */}
          {config.textDistribution === 'single' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文字水平位置: {Math.round((config.textHorizontalPosition || 50))}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={config.textHorizontalPosition || 50}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    console.log('Text horizontal slider changed to:', value)
                    handleChange('textHorizontalPosition', value)
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>左边缘 (0%)</span>
                  <span>中间 (50%)</span>
                  <span>右边缘 (100%)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文字垂直位置: {Math.round((config.textVerticalPosition || 50))}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={config.textVerticalPosition || 50}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    console.log('Text vertical slider changed to:', value)
                    handleChange('textVerticalPosition', value)
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>顶部 (0%)</span>
                  <span>中间 (50%)</span>
                  <span>底部 (100%)</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                <p className="font-medium mb-1">精确定位：</p>
                <p>• 水平位置: 0%=左边缘, 50%=居中, 100%=右边缘</p>
                <p>• 垂直位置: 0%=顶部, 50%=居中, 100%=底部</p>
                <p>• 水印会自动调整以保持在图片范围内</p>
              </div>
            </div>
          )}

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字颜色
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={config.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={config.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-mono"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Text Rotation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字旋转: {config.textRotation || 0}°
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="360"
                value={config.textRotation || 0}
                onChange={(e) => handleChange('textRotation', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <RotateCw className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Text Shadow Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字阴影
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleChange('textShadow', !config.textShadow)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  config.textShadow ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.textShadow ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {config.textShadow ? '开启阴影' : '关闭阴影'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              文字阴影可以增强文字可读性，但也可能影响美观
            </p>
          </div>


        </>
      )}

      {/* Enhanced Preview */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          水印预览
        </label>
        <div className="relative w-full h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg overflow-hidden">
          {/* Text Watermark Preview */}
          {(config.watermarkType === 'text' || config.watermarkType === 'both') && (
            <div
              className="absolute text-white font-semibold pointer-events-none"
              style={{
                fontSize: `${Math.max(8, config.fontSize * 0.3)}px`,
                opacity: config.opacity,
                color: config.color,
                ...getPositionStyles(config.position, config.offsetX * 0.3, config.offsetY * 0.3)
              }}
            >
              {config.text}
            </div>
          )}
          
          {/* Logo Watermark Preview */}
          {(config.watermarkType === 'logo' || config.watermarkType === 'both') && config.logoFile && (
            <div
              className="absolute pointer-events-none"
              style={{
                opacity: config.logoOpacity,
                transform: `rotate(${config.logoRotation}deg)`,
                ...getPositionStyles(config.logoPosition, config.logoOffsetX * 0.3, config.logoOffsetY * 0.3)
              }}
            >
              <img
                src={config.logoFile.previewUrl || URL.createObjectURL(config.logoFile)}
                alt="Logo preview"
                style={{
                  width: `${Math.max(10, config.logoSize * 0.2)}px`,
                  height: 'auto',
                  maxHeight: '40px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.warn('Logo preview failed to load')
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
          
          {/* No watermark message */}
          {config.watermarkType === 'logo' && !config.logoFile && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-xs opacity-70">请上传Logo图片</p>
            </div>
          )}
        </div>
        
        {/* Watermark Type Info */}
        <div className="mt-2 text-xs text-gray-500">
          当前模式: 
          {config.watermarkType === 'text' && '文字水印'}
          {config.watermarkType === 'logo' && 'Logo水印'}
          {config.watermarkType === 'both' && '文字 + Logo水印'}
        </div>
      </div>
    </div>
  )
}

const getPositionStyles = (position, offsetX, offsetY) => {
  switch (position) {
    case 'top-left':
      return { top: offsetY, left: offsetX }
    case 'top-right':
      return { top: offsetY, right: offsetX }
    case 'bottom-left':
      return { bottom: offsetY, left: offsetX }
    case 'bottom-right':
      return { bottom: offsetY, right: offsetX }
    case 'center':
      return { 
        top: '50%', 
        left: '50%', 
        transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)` 
      }
    default:
      return { bottom: offsetY, right: offsetX }
  }
}

export default WatermarkConfig