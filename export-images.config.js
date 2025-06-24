/**
 * @type {import('next-export-optimize-images').Config}
 */
const config = {
  // Generate both AVIF and WebP formats for maximum optimization
  generateFormats: ['avif', 'webp'],
  
  // Optimize build performance while maintaining good quality
  sharpOptions: {
    png: {
      effort: 1, // Faster builds
    },
    webp: {
      effort: 0, // Fastest processing
    },
    avif: {
      effort: 0, // Fastest processing
    },
  },
  
  // Configure device sizes for responsive images
  deviceSizes: [640, 768, 1024, 1280, 1600, 1920],
  
  // Convert format optimizations
  convertFormat: [
    ['png', 'webp'],
    ['jpg', 'avif'],
  ],
}

module.exports = config 