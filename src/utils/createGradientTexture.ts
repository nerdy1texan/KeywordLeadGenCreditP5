export function createGradientTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
  
    const context = canvas.getContext('2d')
    const gradient = context.createLinearGradient(0, 0, 256, 0)
    
    gradient.addColorStop(0, '#5244e1')
    gradient.addColorStop(1, '#b06ab3')
  
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
  
    return canvas.toDataURL()
  }