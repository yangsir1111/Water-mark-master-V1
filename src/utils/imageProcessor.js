// Image processing utilities for watermarking

export const processImagesWithWatermark = async (files, config) => {
  const processedImages = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const processedImage = await processImageWithWatermark(file, config)
      processedImages.push(processedImage)
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
      // Continue with other images even if one fails
      processedImages.push({
        originalName: file.name,
        url: null,
        error: true
      })
    }
  }
  
  return processedImages
}

const processImageWithWatermark = (file, config) => {
  console.log('Processing image:', file.name, 'with config:', config)
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = async () => {
      try {
        console.log('Image loaded:', img.width, 'x', img.height)
        
        // Set canvas dimensions to match image
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw the original image
        ctx.drawImage(img, 0, 0)
        console.log('Original image drawn to canvas')
        
        // Apply watermark (now async to handle logo loading)
        await applyWatermark(ctx, img.width, img.height, config)
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            console.log('Image processed successfully:', file.name)
            resolve({
              originalName: file.name,
              url: url,
              blob: blob,
              error: false
            })
          } else {
            reject(new Error('Failed to create blob from canvas'))
          }
        }, file.type || 'image/png', 0.9)
        
      } catch (error) {
        console.error('Error processing image:', error)
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${file.name}`))
    }
    
    // Load the image
    img.src = URL.createObjectURL(file)
  })
}

const applyWatermark = async (ctx, width, height, config) => {
  const { watermarkType } = config
  
  console.log('Applying watermark with type:', watermarkType)
  console.log('Canvas size:', width, 'x', height)
  console.log('Config:', config)
  
  // Apply text watermark
  if (watermarkType === 'text' || watermarkType === 'both') {
    console.log('Applying text watermark...')
    await applyTextWatermark(ctx, width, height, config)
    console.log('Text watermark applied')
  }
  
  // Apply logo watermark
  if ((watermarkType === 'logo' || watermarkType === 'both') && config.logoFile) {
    console.log('Applying logo watermark...')
    await applyLogoWatermark(ctx, width, height, config)
    console.log('Logo watermark applied')
  } else if (watermarkType === 'logo' || watermarkType === 'both') {
    console.log('Logo watermark skipped - no logo file')
  }
  
  console.log('Watermark application complete')
}

const applyTextWatermark = (ctx, width, height, config) => {
  const { text, fontSize, opacity, position, color, offsetX, offsetY, textDistribution, textSpacing, textRotation, textShadow, textHorizontalPosition, textVerticalPosition } = config
  
  // Set font and style
  ctx.font = `${fontSize}px Arial`
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  
  // Calculate text dimensions
  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width
  const textHeight = fontSize
  
  // Add text shadow if enabled
  if (textShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    ctx.shadowBlur = 4
  } else {
    ctx.shadowColor = 'transparent'
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 0
  }
  
  if (textDistribution === 'multi') {
    // Multi-text distribution: spread watermarks across the entire image
    console.log('Applying multi-text watermark with spacing:', textSpacing)
    
    // Calculate how many watermarks can fit horizontally and vertically
    const spacingX = textSpacing
    const spacingY = textSpacing
    
    // Calculate starting positions to center the pattern
    const cols = Math.floor((width - textWidth) / spacingX) + 1
    const rows = Math.floor((height - textHeight) / spacingY) + 1
    
    const totalWidth = (cols - 1) * spacingX + textWidth
    const totalHeight = (rows - 1) * spacingY + textHeight
    
    const startX = (width - totalWidth) / 2
    const startY = textHeight + (height - totalHeight) / 2
    
    console.log(`Multi-text grid: ${cols}x${rows}, starting at (${startX}, ${startY})`)
    
    // Draw watermarks in a grid pattern
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX
        const y = startY + row * spacingY
        
        // Only draw if the watermark fits within the image bounds
        if (x + textWidth <= width && y <= height && x >= 0 && y >= textHeight) {
          // Apply user-specified rotation or default -15 degrees for multi-text
          ctx.save()
          ctx.translate(x + textWidth / 2, y - textHeight / 2)
          const rotationAngle = textRotation !== undefined ? textRotation : -15
          ctx.rotate((rotationAngle * Math.PI) / 180)
          ctx.fillText(text, -textWidth / 2, textHeight / 2)
          ctx.restore()
        }
      }
    }
  } else {
    // Single text watermark - use percentage-based positioning if available, otherwise fallback to position-based
    let x, y
    
    if (textHorizontalPosition !== undefined && textVerticalPosition !== undefined) {
      // Use percentage-based positioning (new slider system)
      console.log(`Using percentage positioning for text: horizontal=${textHorizontalPosition}%, vertical=${textVerticalPosition}%`)
      const { x: calcX, y: calcY } = calculatePercentagePosition(
        width,
        height,
        textWidth,
        textHeight,
        textHorizontalPosition,
        textVerticalPosition,
        'text'
      )
      x = calcX
      y = calcY
      console.log(`Text watermark positioned at: x=${x}, y=${y}`)
    } else {
      // Fallback to legacy position-based system
      console.log(`Using legacy positioning for text: position=${position}`)
      const { x: calcX, y: calcY } = calculateWatermarkPosition(
        position, 
        width, 
        height, 
        textWidth, 
        textHeight, 
        offsetX, 
        offsetY
      )
      x = calcX
      y = calcY
      console.log(`Text watermark positioned at (legacy): x=${x}, y=${y}`)
    }
    
    // Apply rotation if specified
    if (textRotation && textRotation !== 0) {
      ctx.save()
      ctx.translate(x + textWidth / 2, y - textHeight / 2)
      ctx.rotate((textRotation * Math.PI) / 180)
      ctx.fillText(text, -textWidth / 2, textHeight / 2)
      ctx.restore()
    } else {
      // Draw the single watermark text without rotation
      ctx.fillText(text, x, y)
    }
  }
  
  // Reset shadow and alpha
  ctx.shadowColor = 'transparent'
  ctx.globalAlpha = 1
}

const applyLogoWatermark = (ctx, width, height, config) => {
  return new Promise((resolve) => {
    const { logoFile, logoSize, logoOpacity, logoPosition, logoOffsetX, logoOffsetY, logoRotation, logoDistribution, logoSpacing, logoHorizontalPosition, logoVerticalPosition } = config
    
    console.log('Applying logo watermark with config:', {
      logoFile: logoFile ? 'present' : 'null',
      logoSize,
      logoOpacity,
      logoPosition,
      logoOffsetX,
      logoOffsetY,
      logoRotation,
      logoDistribution,
      logoSpacing
    })
    
    if (!logoFile) {
      console.log('No logo file provided, skipping logo watermark')
      resolve()
      return
    }
    
    const logoImg = new Image()
    // Enable CORS for cross-origin images
    logoImg.crossOrigin = 'anonymous'
    
    logoImg.onload = () => {
      try {
        console.log('Logo image loaded successfully:', logoImg.width, 'x', logoImg.height)
        
        // Save current context state
        ctx.save()
        
        // Set opacity
        ctx.globalAlpha = logoOpacity
        console.log('Set logo opacity to:', logoOpacity)
        
        // Calculate logo dimensions maintaining aspect ratio
        const logoAspectRatio = logoImg.width / logoImg.height
        let logoWidth = logoSize
        let logoHeight = logoSize / logoAspectRatio
        
        // If height exceeds width proportionally, scale by height instead
        if (logoHeight > logoSize) {
          logoHeight = logoSize
          logoWidth = logoSize * logoAspectRatio
        }
        
        // Ensure minimum size for visibility
        if (logoWidth < 10) logoWidth = 10
        if (logoHeight < 10) logoHeight = 10
        
        console.log('Calculated logo dimensions:', logoWidth, 'x', logoHeight)
        
        // Set image smoothing for better quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        if (logoDistribution === 'multi') {
          // Multi-logo distribution: spread logos across the entire image
          console.log('Applying multi-logo watermark with spacing:', logoSpacing)
          
          const spacingX = logoSpacing
          const spacingY = logoSpacing
          
          // Calculate how many logos can fit horizontally and vertically
          const cols = Math.floor((width - logoWidth) / spacingX) + 1
          const rows = Math.floor((height - logoHeight) / spacingY) + 1
          
          const totalWidth = (cols - 1) * spacingX + logoWidth
          const totalHeight = (rows - 1) * spacingY + logoHeight
          
          const startX = (width - totalWidth) / 2
          const startY = (height - totalHeight) / 2
          
          console.log(`Multi-logo grid: ${cols}x${rows}, starting at (${startX}, ${startY})`)
          
          // Draw logos in a grid pattern
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = startX + col * spacingX
              const y = startY + row * spacingY
              
              // Only draw if the logo fits within the image bounds
              if (x + logoWidth <= width && y + logoHeight <= height && x >= 0 && y >= 0) {
                ctx.save()
                
                // Apply rotation if needed
                if (logoRotation !== 0) {
                  const centerX = x + logoWidth / 2
                  const centerY = y + logoHeight / 2
                  ctx.translate(centerX, centerY)
                  ctx.rotate((logoRotation * Math.PI) / 180)
                  ctx.translate(-centerX, -centerY)
                }
                
                // Draw the logo
                ctx.drawImage(logoImg, 0, 0, logoImg.width, logoImg.height, x, y, logoWidth, logoHeight)
                
                ctx.restore()
              }
            }
          }
        } else {
          // Single logo watermark - use percentage-based positioning if available, otherwise fallback to position-based
          let x, y
          
          if (logoHorizontalPosition !== undefined && logoVerticalPosition !== undefined) {
            // Use percentage-based positioning (new slider system)
            console.log(`Using percentage positioning for logo: horizontal=${logoHorizontalPosition}%, vertical=${logoVerticalPosition}%`)
            const { x: calcX, y: calcY } = calculatePercentagePosition(
              width,
              height,
              logoWidth,
              logoHeight,
              logoHorizontalPosition,
              logoVerticalPosition,
              'logo'
            )
            x = calcX
            y = calcY
            console.log(`Logo watermark positioned at: x=${x}, y=${y}`)
          } else {
            // Fallback to legacy position-based system
            console.log(`Using legacy positioning for logo: position=${logoPosition}`)
            const { x: calcX, y: calcY } = calculateWatermarkPosition(
              logoPosition,
              width,
              height,
              logoWidth,
              logoHeight,
              logoOffsetX,
              logoOffsetY
            )
            x = calcX
            y = calcY
            console.log(`Logo watermark positioned at (legacy): x=${x}, y=${y}`)
          }
          
          console.log('Logo position calculated:', { x, y })
          
          // Apply rotation if needed
          if (logoRotation !== 0) {
            const centerX = x + logoWidth / 2
            const centerY = y + logoHeight / 2
            ctx.translate(centerX, centerY)
            ctx.rotate((logoRotation * Math.PI) / 180)
            ctx.translate(-centerX, -centerY)
            console.log('Applied rotation:', logoRotation, 'degrees')
          }
          
          // Draw the logo with explicit parameters
          ctx.drawImage(logoImg, 0, 0, logoImg.width, logoImg.height, x, y, logoWidth, logoHeight)
          console.log('Logo drawn successfully at position:', x, y, 'with size:', logoWidth, logoHeight)
          
          // Force canvas to update
          const imageData = ctx.getImageData(x, y, Math.min(logoWidth, width - x), Math.min(logoHeight, height - y))
          ctx.putImageData(imageData, x, y)
        }
        
        // Restore context state
        ctx.restore()
        
        resolve()
      } catch (error) {
        console.error('Error in logo watermark application:', error)
        ctx.restore() // Ensure context is restored even on error
        resolve() // Continue even if logo fails
      }
    }
    
    logoImg.onerror = (error) => {
      console.error('Failed to load logo image for watermarking:', error)
      console.error('Logo file object:', logoFile)
      resolve() // Continue even if logo fails
    }
    
    // Load the logo image - handle both File objects and objects with previewUrl
    let logoSrc = null
    try {
      if (logoFile.previewUrl) {
        logoSrc = logoFile.previewUrl
        console.log('Using logo previewUrl')
      } else if (logoFile instanceof File) {
        logoSrc = URL.createObjectURL(logoFile)
        console.log('Created object URL for logo file')
      } else if (logoFile.originalFile) {
        logoSrc = URL.createObjectURL(logoFile.originalFile)
        console.log('Using original file from logo object')
      } else if (typeof logoFile === 'object' && logoFile.name) {
        // Try to handle as a file-like object
        logoSrc = URL.createObjectURL(logoFile)
        console.log('Treating logo object as file')
      } else {
        console.error('Invalid logo file object structure:', logoFile)
        resolve()
        return
      }
      
      console.log('Loading logo from:', logoSrc ? 'valid URL' : 'invalid URL')
      logoImg.src = logoSrc
    } catch (error) {
      console.error('Error setting logo image source:', error)
      resolve()
    }
  })
}

// New percentage-based positioning system for precise slider control
const calculatePercentagePosition = (imgWidth, imgHeight, itemWidth, itemHeight, horizontalPercent, verticalPercent, itemType) => {
  console.log(`calculatePercentagePosition called with:`, {
    imgWidth, imgHeight, itemWidth, itemHeight, 
    horizontalPercent, verticalPercent, itemType
  })
  
  // Convert percentage (0-100) to actual position
  // horizontalPercent: 0% = left edge, 50% = center, 100% = right edge
  // verticalPercent: 0% = top edge, 50% = center, 100% = bottom edge
  
  // Calculate base position based on percentage
  // For horizontal: 0% means x=0, 100% means x=(imgWidth-itemWidth)
  let x = Math.max(0, (imgWidth - itemWidth)) * (horizontalPercent / 100)
  // For vertical: 0% means y=0 (or itemHeight for text), 100% means y=(imgHeight-itemHeight)
  let y = Math.max(0, (imgHeight - itemHeight)) * (verticalPercent / 100)
  
  // For text watermarks, adjust y for baseline positioning
  if (itemType === 'text') {
    y = y + itemHeight // Add font height since text is drawn from baseline
  }
  
  console.log(`Calculated base position before bounds checking: x=${x}, y=${y}`)
  
  // Apply gentle bounds checking to prevent watermarks from going completely outside
  if (itemType === 'logo' && itemHeight > 100) {
    // For logos (larger items), allow more flexibility but ensure some visibility
    x = Math.max(-itemWidth * 0.8, Math.min(x, imgWidth - itemWidth * 0.2))
    y = Math.max(-itemHeight * 0.8, Math.min(y, imgHeight - itemHeight * 0.2))
    console.log(`Logo bounds checking applied: x=${x}, y=${y}`)
  } else {
    // For text watermarks, use strict bounds checking but allow edge positioning
    x = Math.max(0, Math.min(x, imgWidth - itemWidth))
    
    if (itemType === 'text') {
      // Ensure text baseline is properly positioned, but allow top positioning
      y = Math.max(itemHeight, Math.min(y, imgHeight))
    } else {
      y = Math.max(0, Math.min(y, imgHeight - itemHeight))
    }
    
    console.log(`Text/small item bounds checking applied: x=${x}, y=${y}`)
  }
  
  console.log(`Final calculated position: x=${x}, y=${y}`)
  return { x, y }
}

const calculateWatermarkPosition = (position, imgWidth, imgHeight, itemWidth, itemHeight, offsetX, offsetY) => {
  let x, y
  
  switch (position) {
    case 'top-left':
      x = offsetX
      // For logos (larger items), position from top edge; for text (smaller items), position by baseline
      y = itemHeight > 100 ? offsetY : offsetY + itemHeight
      break
    case 'top-right':
      x = imgWidth - itemWidth - offsetX
      // For logos (larger items), position from top edge; for text (smaller items), position by baseline
      y = itemHeight > 100 ? offsetY : offsetY + itemHeight
      break
    case 'bottom-left':
      x = offsetX
      y = imgHeight - itemHeight - offsetY
      break
    case 'bottom-right':
      x = imgWidth - itemWidth - offsetX
      y = imgHeight - itemHeight - offsetY
      break
    case 'center':
      x = (imgWidth - itemWidth) / 2 + offsetX
      y = (imgHeight - itemHeight) / 2 + offsetY
      break
    default:
      x = imgWidth - itemWidth - offsetX
      y = imgHeight - offsetY
  }
  
  // For logos (larger items), apply looser bounds checking to maintain corner anchoring
  if (itemHeight > 100) {
    // Only prevent logos from going completely outside the image
    x = Math.max(-itemWidth + 10, Math.min(x, imgWidth - 10))
    y = Math.max(-itemHeight + 10, Math.min(y, imgHeight - 10))
  } else {
    // For text watermarks, use STRICT bounds checking to never exceed image boundaries
    
    // Horizontal bounds checking
    x = Math.max(0, Math.min(x, imgWidth - itemWidth))
    
    // Vertical bounds checking with special handling for text baseline
    // For top positions, ensure text doesn't go above image top
    if (position === 'top-left' || position === 'top-right') {
      // For text at top, y represents baseline position, so minimum y should be itemHeight (font size)
      // Also ensure we have enough offset from top edge
      y = Math.max(itemHeight + Math.max(5, offsetY), y)
    } else {
      // For other positions, ensure text fits within image bounds
      y = Math.max(itemHeight, Math.min(y, imgHeight))
    }
    
    // Final safety check: ensure the text completely fits within image boundaries
    if (x + itemWidth > imgWidth) {
      x = imgWidth - itemWidth
    }
    if (y > imgHeight) {
      y = imgHeight
    }
    if (y < itemHeight) {
      y = itemHeight
    }
  }
  
  return { x, y }
}

export const downloadProcessedImages = (processedImages) => {
  // Filter out failed images
  const validImages = processedImages.filter(img => img.url && !img.error)
  
  if (validImages.length === 0) {
    alert('没有可下载的图片')
    return
  }
  
  // Show confirmation for multiple downloads
  if (validImages.length > 1) {
    const confirmed = window.confirm(
      `准备下载 ${validImages.length} 张处理好的图片。\n\n请注意：浏览器可能会显示多个下载提示，请选择“允许”或“全部允许”。`
    )
    
    if (!confirmed) {
      return
    }
  }
  
  if (validImages.length === 1) {
    // Download single image directly
    const link = document.createElement('a')
    link.download = `watermarked_${validImages[0].originalName}`
    link.href = validImages[0].url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    // For multiple images, download them one by one with a delay
    let downloadCount = 0
    
    const downloadNext = () => {
      if (downloadCount >= validImages.length) {
        // All downloads initiated
        setTimeout(() => {
          alert(`所有 ${validImages.length} 张图片已开始下载！\n\n请检查浏览器的下载文件夹。`)
        }, 1000)
        return
      }
      
      const image = validImages[downloadCount]
      const link = document.createElement('a')
      link.download = `watermarked_${image.originalName}`
      link.href = image.url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      downloadCount++
      
      // Continue with next download after delay
      setTimeout(downloadNext, 800) // 800ms delay between downloads
    }
    
    downloadNext()
  }
}

// Utility function to create a ZIP file (for future enhancement)
export const createZipDownload = async (processedImages) => {
  // This would require a ZIP library like JSZip
  // For now, we'll just download files individually
  downloadProcessedImages(processedImages)
}