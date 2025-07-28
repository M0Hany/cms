import { ComponentRegistry } from "./component-registry"
import { AssetRegistry } from "./asset-registry"
import { PreviewComponentRegistry } from "./preview-component-registry"
import { PreviewAssetRegistry } from "./preview-asset-registry"
import { settingsModel } from "./settings-model"
import type { Component as ComponentType } from "@/types/component"

export interface Component {
  id: string
  type: string
  displayName?: string
  config: any
  html: string
}

export function generateHTML(components: Component[], isPreview: boolean = false): string {
  const currentSettings = settingsModel.getSettings()

  if (!currentSettings) {
    return "<!-- Error: No settings found -->"
  }

  const registry = isPreview ? PreviewComponentRegistry : ComponentRegistry
  const assetRegistry = isPreview ? PreviewAssetRegistry : AssetRegistry

  const htmlParts = components.map((component) => {
    const template = registry.getTemplate(component.type)
    if (!template) {
      return `<!-- Unknown component type: ${component.type} -->`
    }

    if (component.type === "products-showroom") {
      const html = template.generateHTML(component.config)

      const newConfig = {
        ...component.config,
        currency: currentSettings.currency
      }

      return `<!-- COMPONENT_START ${component.id} -->\n${html}\n<!-- COMPONENT_END ${component.id} -->`
    }

    const html = template.generateHTML(component.config)
    return `<!-- COMPONENT_START ${component.id} -->\n${html}\n<!-- COMPONENT_END ${component.id} -->`
  })

  const combinedHTML = htmlParts.join("\n\n")
  
  if (isPreview) {
    assetRegistry.injectDefaultAssets()
    return combinedHTML
  }
  
  return combinedHTML
}

function detectComponentType(html: string): string {
  if (html.includes('class="swiper mySwiper"') || 
      (html.includes('class="swiper-slide"') && html.includes('picture'))) {
    return "swiper"
  }
  if (html.includes('class="four_categories_wrapper"') || 
      (html.includes('four_categories_box') && html.includes('four_categories_category_wrapper'))) {
    return "four-categories"
  }
  if (html.includes('class="icons-wrapper"')) {
    return "eight-icons"
  }
  if (html.includes('showroom-products-wrapper') || 
      html.includes('showroom-heading') || 
      html.includes('showroom-banner-wrapper')) {
    return "products-showroom"
  }
  if (html.includes('class="hero-banner-section"')) {
    return "hero-banner"
  }
  if (html.includes('class="dual-panel-section"')) {
    return "dual-panel-section"
  }
  if (html.includes('class="info-grid-section"')) {
    return "info-grid-section"
  }
  if (html.includes('class="faqs-section-wrapper"')) {
    return "faqs-section"
  }
  return "Custom"
}

function extractComponentConfig(html: string, type: string): any {
  const config: any = {}
  
  switch (type) {
    case "swiper":
      if (!html.includes('class="swiper mySwiper"')) {
        const linkMatch = html.match(/<a href="([^"]*)"[^>]*>/);
        const sourceMatches = html.match(/<source[^>]*media="[^"]*"[^>]*srcset="([^"]*)"[^>]*>/g);
        const imgMatch = html.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/);

        if (linkMatch && sourceMatches && imgMatch) {
          const desktopSource = sourceMatches.find(s => s.includes('min-width: 768px'));
          const mobileSource = sourceMatches.find(s => s.includes('max-width: 767px'));

          const desktopImage = desktopSource?.match(/srcset="([^"]*)"/)?.[1] || imgMatch[2];
          const mobileImage = mobileSource?.match(/srcset="([^"]*)"/)?.[1] || desktopImage;

          config.slides = [{
            linkUrl: linkMatch[1] || "",
            desktopImage: desktopImage || "",
            mobileImage: mobileImage || "",
            altText: imgMatch[1] || ""
          }];
        } else {
          config.slides = [];
        }
      } else {
        const slideMatches = html.matchAll(/<div class="swiper-slide">[\s\S]*?href="([^"]*)"[\s\S]*?srcset="([^"]*)"[\s\S]*?srcset="([^"]*)"[\s\S]*?src="([^"]*)"[\s\S]*?alt="([^"]*)"[\s\S]*?<\/div>/g)
        const slides = Array.from(slideMatches).map(match => ({
          linkUrl: match[1] || "",
          desktopImage: match[2] || match[4] || "",
          mobileImage: match[3] || "",
          altText: match[5] || ""
        }))
        config.slides = slides
      }
      break

    case "four-categories":
      const titleMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      
      const bgColorMatch = html.match(/background-color:\s*([^"'\s;]*)/)
      config.backgroundColor = bgColorMatch ? bgColorMatch[1] : ""
      
      const categoryWrappers = html.match(/<div class="four_categories_category_wrapper">[\s\S]*?<\/div>\s*<\/div>/g) || []
      config.categories = categoryWrappers.map(wrapper => {
        const linkMatch = wrapper.match(/href="([^"]*)"/)
        const imgMatch = wrapper.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"/)
        
        return {
          linkUrl: linkMatch ? linkMatch[1] : "",
          imageUrl: imgMatch ? imgMatch[2] : "",
          altText: imgMatch ? imgMatch[1] : ""
        }
      })

      while (config.categories.length < 4) {
        config.categories.push({
          linkUrl: "",
          imageUrl: "",
          altText: ""
        })
      }
      break

    case "eight-icons":
      const iconsTitleMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
      config.title = iconsTitleMatch ? iconsTitleMatch[1].trim() : ""
      
      const iconWrappers = html.match(/<a[^>]*class="icon-wrapper"[\s\S]*?<\/a>/g) || []
      config.icons = iconWrappers.map(wrapper => {
        const linkMatch = wrapper.match(/href="([^"]*)"/)
        const imgMatch = wrapper.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"/)
        const subtitleMatch = wrapper.match(/<span>([^<]*)<\/span>/)
        
        return {
          linkUrl: linkMatch ? linkMatch[1] : "",
          imageUrl: imgMatch ? imgMatch[2] : "",
          altText: imgMatch ? imgMatch[1] : "",
          subtitle: subtitleMatch ? subtitleMatch[1] : ""
        }
      })

      while (config.icons.length < 8) {
        config.icons.push({
          linkUrl: "",
          imageUrl: "",
          altText: "",
          subtitle: ""
        })
      }
      break

    case "products-showroom":
      config.mode = html.includes('showroom-heading') ? "title" : "image"

      // Detect direction from container class
      config.direction = html.includes('showroom-container-rtl') ? "rtl" : "ltr"

      if (config.mode === "title") {
        const titleMatch = html.match(/<h2[^>]*id="showroom-title"[^>]*>([\s\S]*?)<\/h2>/)
        config.title = titleMatch ? titleMatch[1].trim() : ""
      } else {
        const bannerConfig: any = {}
        
        const bannerLinkMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?showroom-banner-wrapper/);
        bannerConfig.linkUrl = bannerLinkMatch ? bannerLinkMatch[1] : ""
        
        const desktopImageMatch = html.match(/showroom-desktop-banner[\s\S]*?<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*class="showroom-banner-image"/);
        if (desktopImageMatch) {
          bannerConfig.altText = desktopImageMatch[1]
          bannerConfig.desktopImage = desktopImageMatch[2]
        }
        
        const mobileImageMatch = html.match(/showroom-mobile-banner[\s\S]*?<img[^>]*alt="[^"]*"[^>]*src="([^"]*)"[^>]*class="showroom-banner-image"/);
        bannerConfig.mobileImage = mobileImageMatch ? mobileImageMatch[1] : bannerConfig.desktopImage
        
        config.bannerConfig = bannerConfig
      }

      const intersectMatch = html.match(/x-intersect[^"]*"[^"]*getProductsFromCategory\((\d+),\s*(\d+),\s*\[(.*?)\]\)/);
      if (intersectMatch) {
        config.categoryNumber = intersectMatch[2]
        config.objectIds = intersectMatch[3] ? intersectMatch[3].split(',')
          .map(id => id.trim())
          .filter(id => id)
          .map(id => id.replace(/['"]/g, ''))
          .join(',') : ""
      }

      config.sale = html.includes('class="old-price"') ? "yes" : "no"
      break

    case "hero-banner": {
      const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="hero-banner-image"/)
      config.image = imageMatch ? imageMatch[1] : ""
      const titleMatch = html.match(/<h2[^>]*class="hero-banner-title"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const subtitleMatch = html.match(/<div[^>]*class="hero-banner-subtitle"[^>]*>([\s\S]*?)<\/div>/)
      config.subtitle = subtitleMatch ? subtitleMatch[1].trim() : ""
      break
    }
    case "dual-panel-section": {
      const titleMatch = html.match(/<h2[^>]*class="section-text-title"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const descMatch = html.match(/<p[^>]*class="section-text-description"[^>]*>([\s\S]*?)<\/p>/)
      config.description = descMatch ? descMatch[1].trim() : ""
      config.imageEnabled = html.includes('class="section-image')
      const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="media-content"/)
      config.image = imageMatch ? imageMatch[1] : ""
      break
    }
    case "info-grid-section": {
      const titleMatch = html.match(/<h2[^>]*class="info-grid-section-title"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const itemMatches = html.match(/<li class="info-grid-list-item">[\s\S]*?<\/li>/g) || []
      config.items = itemMatches.map(itemHtml => {
        const iconMatch = itemHtml.match(/<img[^>]*src="([^"]*)"[^>]*class="info-grid-list-item-icon-image"/)
        const titleMatch = itemHtml.match(/<div class="info-grid-list-item-title">([\s\S]*?)<\/div>/)
        const subtitleMatches = Array.from(itemHtml.matchAll(/<div class="info-grid-list-item-subtitle">([\s\S]*?)<\/div>/g)).map(m => m[1].trim())
        return {
          icon: iconMatch ? iconMatch[1] : "",
          title: titleMatch ? titleMatch[1].trim() : "",
          subtitles: subtitleMatches
        }
      })
      break
    }
    case "faqs-section": {
      const titleMatch = html.match(/<h2[^>]*class="faqs-header"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const faqMatches = html.match(/<details class="question-wrapper">[\s\S]*?<\/details>/g) || []
      config.faqs = faqMatches.map(faqHtml => {
        const questionMatch = faqHtml.match(/<summary class="question-text">([\s\S]*?)<\/summary>/)
        const answerMatch = faqHtml.match(/<p class="answer-text">([\s\S]*?)<\/p>/)
        return {
          question: questionMatch ? questionMatch[1].trim() : "",
          answer: answerMatch ? answerMatch[1].trim() : ""
        }
      })
      break
    }
    case "Custom":
      config.html = html
      break
  }
  
  return config
}

export function parseComponents(html: string): ComponentType[] {
  const components: ComponentType[] = []
  
  // Remove <div id="ZA_body_fix">...</div> wrapper if present
  html = html.replace(/<div\s+id=["']ZA_body_fix["'][^>]*>([\s\S]*?)<\/div>/i, '$1')

  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '')
  
  // First try to parse components with special comments
  const commentRegex = /<!-- COMPONENT_START (.*?) -->([\s\S]*?)<!-- COMPONENT_END \1 -->/g
  let match
  let remainingHtml = html
  const processedRanges: [number, number][] = []

  while ((match = commentRegex.exec(html)) !== null) {
    const id = match[1]
    const componentHtml = match[2].trim()
    
    const type = detectComponentType(componentHtml)
    const config = extractComponentConfig(componentHtml, type)
    
    components.push({
      id,
      type,
      config,
      html: componentHtml
    })

    processedRanges.push([match.index, match.index + match[0].length])
  }

  // If no components found with comments, try parsing the entire HTML
  if (components.length === 0) {
    const type = detectComponentType(html)
    const config = extractComponentConfig(html, type)
    
    components.push({
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      config,
      html: html.trim()
    })
  }

  processedRanges.sort((a, b) => b[0] - a[0]).forEach(([start, end]) => {
    remainingHtml = remainingHtml.slice(0, start) + remainingHtml.slice(end)
  })

  let depth = 0
  let currentStart = -1
  const componentRanges: { start: number, end: number }[] = []
  
  const tagRegex = /<(\/)?([a-zA-Z][a-zA-Z0-9-_]*)[^>]*?(\/)?>/g
  while ((match = tagRegex.exec(remainingHtml)) !== null) {
    const isClosingTag = match[1] === '/'
    const isSelfClosingTag = match[3] === '/'
    const tag = match[2].toLowerCase()
    
    if (!isSelfClosingTag) {
      if (!isClosingTag) {
        depth++
        if (depth === 1) {
          currentStart = match.index
        }
      } else {
        depth--
        if (depth === 0 && currentStart !== -1) {
          componentRanges.push({
            start: currentStart,
            end: match.index + match[0].length
          })
          currentStart = -1
        }
      }
    }
  }

  componentRanges.forEach(({ start, end }) => {
    const componentHtml = remainingHtml.slice(start, end).trim()
    
    const cleanedHtml = cleanHtml(componentHtml)
    const type = detectComponentType(cleanedHtml)
    const config = extractComponentConfig(cleanedHtml, type)
    
    components.push({
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      config,
      html: cleanedHtml
    })
  })

  return components
}

function cleanHtml(html: string): string {
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '')
  html = html.replace(/\s+style="[^"]*"/g, '')
  html = html.replace(/\s+x-[^=\s>]+(="[^"]*")?/g, '')
  html = html.replace(/\s+(async|defer)/g, '')
  html = html.replace(/\s+class=""/g, '')
  html = html.replace(/\s+data-[^=\s>]+(="[^"]*")?/g, '')
  html = html.replace(/\s+aria-[^=\s>]+(="[^"]*")?/g, '')
  
  return html.trim()
}
