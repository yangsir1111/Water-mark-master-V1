import JSZip from 'jszip'

/**
 * Downloads multiple processed images as a zip file
 * @param {Array} processedImages - Array of processed image objects with url and originalName
 * @param {string} zipFileName - Name for the zip file (default: 'watermarked_images.zip')
 */
export const downloadImagesAsZip = async (processedImages, zipFileName = 'watermarked_images.zip') => {
  try {
    // Filter out failed images and only include successfully processed ones
    const validImages = processedImages.filter(image => image.url && !image.error)
    
    if (validImages.length === 0) {
      throw new Error('没有可下载的图片')
    }

    // Create a new JSZip instance
    const zip = new JSZip()
    
    // Add each image to the zip
    for (let i = 0; i < validImages.length; i++) {
      const image = validImages[i]
      try {
        // Fetch the image blob from the URL
        const response = await fetch(image.url)
        if (!response.ok) {
          console.warn(`Failed to fetch image: ${image.originalName}`)
          continue
        }
        
        const blob = await response.blob()
        
        // Generate a safe filename
        const fileName = `watermarked_${image.originalName}` || `watermarked_image_${i + 1}.png`
        
        // Add the image to the zip
        zip.file(fileName, blob)
      } catch (error) {
        console.warn(`Error processing image ${image.originalName}:`, error)
        // Continue with other images even if one fails
      }
    }
    
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })
    
    // Create download link and trigger download
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = zipFileName
    
    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
    
    return {
      success: true,
      message: `成功打包 ${validImages.length} 张图片`,
      count: validImages.length
    }
    
  } catch (error) {
    console.error('Error creating zip file:', error)
    throw new Error(`打包失败: ${error.message}`)
  }
}

/**
 * Shows a confirmation dialog before starting batch download
 * @param {number} imageCount - Number of images to be downloaded
 * @returns {boolean} - Whether user confirmed the download
 */
export const confirmBatchDownload = (imageCount) => {
  return window.confirm(
    `准备下载 ${imageCount} 张已处理的图片为ZIP文件。\n\n点击确定开始下载，文件将保存到您的默认下载文件夹。`
  )
}

/**
 * Shows completion message after download starts
 * @param {number} imageCount - Number of images downloaded
 */
export const showDownloadComplete = (imageCount) => {
  // Show a temporary notification
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
    ">
      ✓ ZIP文件下载已开始！已打包 ${imageCount} 张图片
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 3000)
}