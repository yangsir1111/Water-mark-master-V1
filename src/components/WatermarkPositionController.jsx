import React, { useState, useRef, useCallback } from 'react'
import { Move } from 'lucide-react'

const WatermarkPositionController = ({ 
  config, 
  onChange, 
  watermarkType = 'text' // 'text' or 'logo'
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  // Get current position and offset values based on watermark type
  const currentPosition = watermarkType === 'text' ? config.position : config.logoPosition
  const currentOffsetX = watermarkType === 'text' ? config.offsetX : config.logoOffsetX
  const currentOffsetY = watermarkType === 'text' ? config.offsetY : config.logoOffsetY

  // Calculate position percentage based on current position and offsets
  const getPositionPercentage = () => {
    let x = 50, y = 50 // Default center

    switch (currentPosition) {
      case 'top-left':
        x = Math.min(95, (currentOffsetX / 200) * 40 + 5)
        y = Math.min(95, (currentOffsetY / 200) * 40 + 5)
        break
      case 'top-right':
        x = Math.max(5, 95 - (currentOffsetX / 200) * 40)
        y = Math.min(95, (currentOffsetY / 200) * 40 + 5)
        break
      case 'bottom-left':
        x = Math.min(95, (currentOffsetX / 200) * 40 + 5)
        y = Math.max(5, 95 - (currentOffsetY / 200) * 40)
        break
      case 'bottom-right':
        x = Math.max(5, 95 - (currentOffsetX / 200) * 40)
        y = Math.max(5, 95 - (currentOffsetY / 200) * 40)
        break
      case 'center':
        x = 50 + (currentOffsetX / 200) * 40
        y = 50 + (currentOffsetY / 200) * 40
        x = Math.max(5, Math.min(95, x))
        y = Math.max(5, Math.min(95, y))
        break
    }

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  // Calculate position and offsets from percentage
  const calculatePositionFromPercentage = (xPercent, yPercent) => {
    // Ensure boundaries
    xPercent = Math.max(5, Math.min(95, xPercent))
    yPercent = Math.max(5, Math.min(95, yPercent))

    let position = 'center'
    let offsetX = 0
    let offsetY = 0

    // Determine the closest corner or center
    const isLeft = xPercent < 33
    const isRight = xPercent > 67
    const isTop = yPercent < 33
    const isBottom = yPercent > 67

    if (isTop && isLeft) {
      position = 'top-left'
      offsetX = Math.max(0, Math.min(200, ((xPercent - 5) / 40) * 200))
      offsetY = Math.max(0, Math.min(200, ((yPercent - 5) / 40) * 200))
    } else if (isTop && isRight) {
      position = 'top-right'
      offsetX = Math.max(0, Math.min(200, ((95 - xPercent) / 40) * 200))
      offsetY = Math.max(0, Math.min(200, ((yPercent - 5) / 40) * 200))
    } else if (isBottom && isLeft) {
      position = 'bottom-left'
      offsetX = Math.max(0, Math.min(200, ((xPercent - 5) / 40) * 200))
      offsetY = Math.max(0, Math.min(200, ((95 - yPercent) / 40) * 200))
    } else if (isBottom && isRight) {
      position = 'bottom-right'
      offsetX = Math.max(0, Math.min(200, ((95 - xPercent) / 40) * 200))
      offsetY = Math.max(0, Math.min(200, ((95 - yPercent) / 40) * 200))
    } else {
      position = 'center'
      offsetX = Math.max(-200, Math.min(200, ((xPercent - 50) / 40) * 200))
      offsetY = Math.max(-200, Math.min(200, ((yPercent - 50) / 40) * 200))
    }

    return { position, offsetX: Math.round(offsetX), offsetY: Math.round(offsetY) }
  }

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100

    const { position, offsetX, offsetY } = calculatePositionFromPercentage(xPercent, yPercent)

    // Update the appropriate config values based on watermark type
    if (watermarkType === 'text') {
      onChange({
        ...config,
        position,
        offsetX,
        offsetY
      })
    } else {
      onChange({
        ...config,
        logoPosition: position,
        logoOffsetX: offsetX,
        logoOffsetY: offsetY
      })
    }
  }, [isDragging, config, onChange, watermarkType])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const { x, y } = getPositionPercentage()

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {watermarkType === 'text' ? '文字' : 'Logo'}位置控制
      </label>
      
      {/* Interactive Position Controller */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden cursor-crosshair"
          style={{ aspectRatio: '16/10' }}
        >
          {/* Grid lines for visual reference */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical lines */}
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gray-300 opacity-50"></div>
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-gray-300 opacity-50"></div>
            {/* Horizontal lines */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-gray-300 opacity-50"></div>
            <div className="absolute top-2/3 left-0 right-0 h-px bg-gray-300 opacity-50"></div>
          </div>

          {/* Position indicators */}
          <div className="absolute top-2 left-2 text-xs text-gray-500">左上</div>
          <div className="absolute top-2 right-2 text-xs text-gray-500">右上</div>
          <div className="absolute bottom-2 left-2 text-xs text-gray-500">左下</div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">右下</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500">中心</div>

          {/* Draggable watermark position indicator */}
          <div
            className={`absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 cursor-move transition-all duration-150 ${
              isDragging ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`
            }}
            onMouseDown={handleMouseDown}
          >
            <div className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-colors ${
              isDragging 
                ? 'bg-primary-600 border-primary-700 shadow-lg' 
                : 'bg-primary-500 border-primary-600 shadow-md hover:bg-primary-600'
            }`}>
              <Move className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        
        {/* Position info */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>当前位置: {
            currentPosition === 'top-left' ? '左上角' :
            currentPosition === 'top-right' ? '右上角' :
            currentPosition === 'bottom-left' ? '左下角' :
            currentPosition === 'bottom-right' ? '右下角' :
            '居中'
          }</span>
          <span>偏移: X({currentOffsetX}px) Y({currentOffsetY}px)</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
        <p className="font-medium mb-1">使用说明：</p>
        <ul className="space-y-0.5 text-gray-700">
          <li>• 拖拽圆点可实时调整水印位置</li>
          <li>• 水印会自动限制在图片边界内</li>
          <li>• 不同区域对应不同的定位模式</li>
        </ul>
      </div>
    </div>
  )
}

export default WatermarkPositionController