# 🔍 Logo水印问题调试指南

## 问题诊断步骤

### 1. **检查浏览器控制台**
打开浏览器开发者工具 (F12) -> Console 标签，查看以下调试信息：

#### 上传Logo时应该看到：
```
Logo file uploaded successfully: {name: "logo.png", size: 12345, ...}
Switched watermark type to logo
Watermark config changed: {watermarkType: "logo", logoFile: {...}, ...}
```

#### 处理图片时应该看到：
```
Processing image: test.jpg with config: {watermarkType: "logo", logoFile: {...}, ...}
Image loaded: 1920 x 1080
Original image drawn to canvas
Applying watermark with type: logo
Applying logo watermark...
Logo image loaded successfully: 256 x 256
Set logo opacity to: 0.8
Calculated logo dimensions: 100 x 100
Logo position calculated: {x: 1800, y: 960}
Logo drawn successfully at position: 1800 960 with size: 100 100
Logo watermark applied
Watermark application complete
Image processed successfully: test.jpg
```

### 2. **常见问题排查**

#### **问题1: 没有"Logo image loaded successfully"日志**
- **原因**: Logo文件未正确加载
- **检查**: 
  - Logo文件是否符合格式要求 (PNG/JPG/SVG)
  - 文件大小是否超过5MB
  - 图片尺寸是否超过500x500px

#### **问题2: 看到"Logo watermark skipped - no logo file"**
- **原因**: 配置中logoFile为null
- **检查**:
  - 是否成功上传了Logo文件
  - watermarkType是否设置为'logo'或'both'
  - 配置是否正确传递

#### **问题3: Logo加载成功但看不到水印**
- **原因**: 位置、大小或透明度设置问题
- **检查**:
  - Logo位置是否在图片范围内
  - Logo大小是否太小 (最小20px)
  - 透明度是否太低
  - Logo颜色是否与背景相同

### 3. **手动测试流程**

#### **步骤1: 上传Logo**
1. 准备一个小于5MB、尺寸小于500x500的PNG图片
2. 拖拽到Logo上传区域
3. 确认看到预览图片和文件信息
4. 确认水印类型自动切换到"Logo水印"

#### **步骤2: 配置Logo设置**
1. 调整Logo大小到100px以上
2. 设置透明度为80%
3. 选择"右下角"位置
4. 旋转角度设为0度
5. 查看预览区域是否显示Logo

#### **步骤3: 处理图片**
1. 上传一张测试图片
2. 点击"添加水印"按钮
3. 等待处理完成
4. 检查结果图片是否包含Logo水印

### 4. **问题修复方案**

#### **如果Logo不显示:**
```javascript
// 在浏览器控制台执行以下代码检查配置
console.log('当前配置:', watermarkConfig);
console.log('Logo文件:', watermarkConfig.logoFile);
console.log('水印类型:', watermarkConfig.watermarkType);
```

#### **如果配置正确但仍无效:**
1. 刷新页面重新开始
2. 尝试不同格式的Logo文件
3. 检查Logo文件是否损坏
4. 尝试更简单的PNG格式Logo

#### **如果控制台显示错误:**
- **"Failed to load logo image"**: Logo文件格式问题
- **"Invalid logo file object"**: 文件对象结构问题  
- **"Error applying logo watermark"**: Canvas操作错误

### 5. **最佳测试Logo特征**

#### **推荐Logo规格:**
- **格式**: PNG (支持透明背景)
- **尺寸**: 200x200像素
- **大小**: < 500KB
- **背景**: 透明或纯色
- **颜色**: 高对比度

#### **测试图片推荐:**
- **尺寸**: 1920x1080 或更大
- **格式**: JPG
- **内容**: 纯色背景便于观察水印

### 6. **紧急解决方案**

#### **如果问题持续存在:**
1. 清除浏览器缓存
2. 在无痕模式下测试
3. 尝试不同浏览器
4. 检查是否有浏览器插件干扰

#### **临时workaround:**
- 使用文字水印代替Logo水印
- 或同时使用文字+Logo模式
- 手动清除配置后重新设置

### 7. **成功案例验证**

确认以下操作后Logo水印应该正常工作：
- ✅ 上传了有效的Logo文件
- ✅ 看到Logo预览
- ✅ 水印类型设置为"Logo水印"
- ✅ Logo配置参数合理
- ✅ 浏览器控制台无错误信息

如果完成以上步骤仍有问题，请检查浏览器控制台的详细错误信息。