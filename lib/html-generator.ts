import type { Component } from "@/types/component"

// Generate HTML with special component markers
export function generateHTML(components: Component[]): string {
  const baseAssets = `<!-- Base Assets -->
<link rel="stylesheet" href="https://unpkg.com/@vtmn/css-button" />
<link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
<link rel="stylesheet" href="https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.css" />
<link rel="stylesheet" href="https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/4%20blocks.css" />
<link rel="stylesheet" href="https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/8%20icons.css" />
<link rel="stylesheet" href="https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Showroom.css" />
<link rel="stylesheet" href="https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Page%20stretch.css" />

<script src="https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js"></script>
<script src="https://unpkg.com/@alpinejs/intersect@3.8.1/dist/cdn.min.js"></script>
<script src="https://unpkg.com/alpinejs@3.8.1/dist/cdn.min.js" defer></script>
<script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
<script src="https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.js"></script>

<script>
const getCookie = (name) => {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const algoliaDetails = {
  app_id: getCookie("showroom_app_id") || 'TR53CBEI82',
  api_search_key: getCookie("showroom_api_search_key") || "98ef65e220d8d74a2dfac7a67f1dba11",
  index_name: getCookie("showroom_index_name") || "prod_en",
};

function handleLoadingSliders() {
  const loadingProducts = document.getElementsByClassName("loading-products");
  const loadingProductsArr = [...loadingProducts];
  loadingProductsArr.forEach((e) => {
    e.remove();
  });
}

function updateImageUrl(url) {
  if (!url) return '';
  const newParams = "format=auto&quality=40&f=400x0";
  if (url.indexOf("?") > -1) {
    return url + "&" + newParams;
  }
  return url + "?" + newParams;
}

document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    products: [],
    gridStyle: "",
    init() {
      // Initialize with empty state
      this.products = [];
      this.gridStyle = "";
    },
    getProductsFromCategory(prodCount, categoryNumber, priorityObjectIDs = []) {
      try {
        const clientAlg = algoliasearch(algoliaDetails.app_id, algoliaDetails.api_search_key);
        const indexAlg = clientAlg.initIndex(algoliaDetails.index_name);
        const objectIDFilters = priorityObjectIDs.map((id) => \`objectID:\${id}\`).join(" OR ");

        indexAlg.search("", {
          filters: objectIDFilters.length ? objectIDFilters : \`category = \${categoryNumber}\`,
          analytics: false,
        }).then(({ hits: priorityHits }) => {
          if (priorityObjectIDs.length) {
            indexAlg.search("", {
              filters: \`category = \${categoryNumber} \`,
              analytics: false,
            }).then(({ hits: categoryHits }) => {
              const uniqueCategoryHits = categoryHits.filter(
                (hit) => !priorityObjectIDs.includes(hit.objectID)
              );

              const combinedResults = [...priorityHits, ...uniqueCategoryHits].slice(0, prodCount);
              this.products = combinedResults || [];
              handleLoadingSliders();
            }).catch(err => {
              console.error("Error fetching category hits:", err);
              this.products = [];
            });
          } else {
            const filteredResultsByCategory = priorityHits
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, prodCount);

            this.products = filteredResultsByCategory || [];
            handleLoadingSliders();
          }
        }).catch(err => {
          console.error("Error fetching priority hits:", err);
          this.products = [];
        });
      } catch (err) {
        console.error("Error in getProductsFromCategory:", err);
        this.products = [];
      }
    },
    getDiscountedProductsFromCategory(prodCount, categoryNumber, priorityObjectIDs = []) {
      try {
        const clientAlg = algoliasearch(algoliaDetails.app_id, algoliaDetails.api_search_key);
        const indexAlg = clientAlg.initIndex(algoliaDetails.index_name);
        const objectIDFilters = priorityObjectIDs.map((id) => \`objectID:\${id}\`).join(" OR ");

        indexAlg.search("", {
          filters: objectIDFilters.length ? objectIDFilters : \`category = \${categoryNumber} AND percentoff > 0\`,
          analytics: false,
        }).then(({ hits: priorityHits }) => {
          if (priorityObjectIDs.length) {
            indexAlg.search("", {
              filters: \`category = \${categoryNumber} AND percentoff > 0\`,
              analytics: false,
            }).then(({ hits: categoryHits }) => {
              const uniqueCategoryHits = categoryHits.filter(
                (hit) => !priorityObjectIDs.includes(hit.objectID)
              );

              const combinedResults = [...priorityHits, ...uniqueCategoryHits].slice(0, prodCount);
              this.products = combinedResults || [];
              handleLoadingSliders();
            }).catch(err => {
              console.error("Error fetching discounted category hits:", err);
              this.products = [];
            });
          } else {
            const filteredResultsByCategory = priorityHits
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, prodCount);

            this.products = filteredResultsByCategory || [];
            handleLoadingSliders();
          }
        }).catch(err => {
          console.error("Error fetching discounted priority hits:", err);
          this.products = [];
        });
      } catch (err) {
        console.error("Error in getDiscountedProductsFromCategory:", err);
        this.products = [];
      }
    },
    getProductsManual(productsArr) {
      try {
        const clientAlg = algoliasearch(algoliaDetails.app_id, algoliaDetails.api_search_key);
        const indexAlg = clientAlg.initIndex(algoliaDetails.index_name);
        const filters = productsArr.map((id) => \`objectID:\${id}\`).join(" OR ");

        indexAlg.search("", {
          filters: filters,
          analytics: false,
        }).then(({ hits }) => {
          handleLoadingSliders();
          const orderedHits = productsArr.map((id) => hits.find((hit) => hit.objectID === id));
          this.products = orderedHits.filter(Boolean) || [];
          this.updateGridStyle();
        }).catch((err) => {
          console.error("Error in getProductsManual:", err);
          this.products = [];
        });
      } catch (err) {
        console.error("Error in getProductsManual:", err);
        this.products = [];
      }
    },
    updateGridStyle() {
      const columns = this.products?.length || 0;
      this.gridStyle = \`grid-template-columns: repeat(\${columns}, 1fr);\`;
    },
  }));
});
</script>
<!-- End Base Assets -->`

  const componentsHtml = components
    .map((component) => {
      return `<!-- COMPONENT_START:${component.id}:${component.type} -->
${component.html}
<!-- COMPONENT_END:${component.id} -->`
    })
    .join("\n\n")

  return componentsHtml + "\n\n" + baseAssets
}

// Component type to display name mapping
const componentDisplayNames: Record<string, string> = {
  'swiper': 'Banner Carousel',
  'products-showroom': 'Products Showroom',
  'four-categories': 'Four Blocks',
  'eight-icons': 'Eight Icons',
  'style': 'Style',
  'script': 'Script',
  'custom': 'Custom'
}

// Advanced HTML parser that detects component boundaries and multiple components
export function parseComponents(html: string, isCustomCode = false): Component[] {
  const components: Component[] = []

  if (!html.trim()) {
    return components
  }

  // Get list of pre-registered asset URLs and inline scripts
  const preRegisteredAssets = [
    "https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js",
    "https://unpkg.com/@alpinejs/intersect@3.8.1/dist/cdn.min.js",
    "https://unpkg.com/alpinejs@3.8.1/dist/cdn.min.js",
    "https://unpkg.com/swiper/swiper-bundle.min.js",
    "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.js",
    "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.css",
    "https://unpkg.com/@vtmn/css-button",
    "https://unpkg.com/swiper/swiper-bundle.min.css",
    "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/4%20blocks.css",
    "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/8%20icons.css",
    "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Showroom.css",
    "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Page%20stretch.css"
  ]

  // Pre-registered inline scripts content (normalized)
  const preRegisteredInlineScripts = [
    normalizeScript(`document.addEventListener("DOMContentLoaded", function() {
      const tracks = document.querySelectorAll(".showroom-products-track");
      const leftShowroomArrows = document.querySelectorAll(".left_showroom_arrow");
      const rightShowroomArrows = document.querySelectorAll(".right_showroom_arrow");
      const trackTranslations = Array(tracks.length).fill(0);`),
    normalizeScript(`
    const getCookie = (name) => {
      const value = "; " + document.cookie;
      const parts = value.split("; " + name + "=");
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    const algoliaDetails = {
      app_id: getCookie("showroom_app_id") || 'TR53CBEI82',
      api_search_key: getCookie("showroom_api_search_key") || "98ef65e220d8d74a2dfac7a67f1dba11",
      index_name: getCookie("showroom_index_name") || "prod_en",
    };`)
  ]

  if (isCustomCode) {
    // Extract and handle external assets first
    const styleRegex = /<link[^>]*href=["']([^"']+)["'][^>]*>/g
    const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/g
    let match

    // Process external styles
    while ((match = styleRegex.exec(html)) !== null) {
      const styleUrl = match[1]
      if (!preRegisteredAssets.includes(styleUrl)) {
        components.push({
          id: `style-${Date.now()}-${Math.random()}`,
          type: "style",
          displayName: componentDisplayNames["style"],
          config: { url: styleUrl },
          html: match[0].trim()
        })
      }
    }

    // Process external scripts
    while ((match = scriptRegex.exec(html)) !== null) {
      const scriptUrl = match[1]
      if (!preRegisteredAssets.includes(scriptUrl)) {
        components.push({
          id: `script-${Date.now()}-${Math.random()}`,
          type: "script",
          displayName: componentDisplayNames["script"],
          config: { url: scriptUrl },
          html: match[0].trim()
        })
      }
    }

    // Process inline scripts
    const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g
    while ((match = inlineScriptRegex.exec(html)) !== null) {
      const scriptContent = match[1].trim()
      if (scriptContent && !match[0].includes('src=')) {
        const normalizedScript = normalizeScript(scriptContent)
        if (!preRegisteredInlineScripts.some(s => normalizedScript.includes(s))) {
          components.push({
            id: `script-${Date.now()}-${Math.random()}`,
            type: "script",
            displayName: componentDisplayNames["script"],
            config: { inline: true },
            html: match[0].trim()
          })
        }
      }
    }

    // Process inline styles
    const inlineStyleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g
    while ((match = inlineStyleRegex.exec(html)) !== null) {
      const styleContent = match[1].trim()
      if (styleContent) {
        components.push({
          id: `style-${Date.now()}-${Math.random()}`,
          type: "style",
          displayName: componentDisplayNames["style"],
          config: { inline: true },
          html: match[0].trim()
        })
      }
    }

    // Remove all style and script tags from the HTML
    html = html
      .replace(/<link[^>]*>/g, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
      .trim()

    // Parse custom HTML code and detect multiple components
    const detectedComponents = detectMultipleComponents(html)
    detectedComponents.forEach((componentHtml, index) => {
      // Try to detect component type from HTML structure
      const type = detectComponentType(componentHtml)
      let config = {}

      // Parse config based on detected type
      if (type === "swiper") {
        config = parseSwiperConfig(componentHtml)
      } else if (type === "four-categories") {
        config = parseFourCategoriesConfig(componentHtml)
      } else if (type === "eight-icons") {
        config = parseEightIconsConfig(componentHtml)
      } else if (type === "products-showroom") {
        config = parseProductsShowroomConfig(componentHtml)
      }

      const component: Component = {
        id: `${type}-${Date.now()}-${index}`,
        type,
        displayName: componentDisplayNames[type] || componentDisplayNames["custom"],
        config,
        html: componentHtml.trim(),
      }
      components.push(component)
    })
    return components
  }

  // Parse existing components with special markers
  const componentRegex = /<!-- COMPONENT_START:([^:]+):([^:]+) -->\s*([\s\S]*?)\s*<!-- COMPONENT_END:\1 -->/g
  let match

  while ((match = componentRegex.exec(html)) !== null) {
    const [, id, type, componentHtml] = match

    // Try to parse config from known component types
    let config = {}
    if (type === "swiper") {
      config = parseSwiperConfig(componentHtml)
    } else if (type === "four-categories") {
      config = parseFourCategoriesConfig(componentHtml)
    } else if (type === "eight-icons") {
      config = parseEightIconsConfig(componentHtml)
    } else if (type === "products-showroom") {
      config = parseProductsShowroomConfig(componentHtml)
    }

    components.push({
      id,
      type,
      displayName: componentDisplayNames[type] || componentDisplayNames["custom"],
      config,
      html: componentHtml.trim(),
    })
  }

  return components
}

// Helper function to normalize script content for comparison
function normalizeScript(script: string): string {
  return script
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[\n\r]/g, '') // Remove newlines
    .trim()
}

// Detect component type from HTML structure
function detectComponentType(html: string): string {
  // Swiper Carousel detection
  if (html.includes('class="swiper mySwiper"') || html.includes('class="swiper-slide"')) {
    return "swiper"
  }
  
  // Four Categories detection
  if (html.includes('class="four_categories_wrapper"') || html.includes('class="four_categories_category_wrapper"')) {
    return "four-categories"
  }
  
  // Eight Icons detection
  if (html.includes('class="icons-wrapper"') || html.includes('class="icon-wrapper"')) {
    return "eight-icons"
  }
  
  // Products Showroom detection (both title and image modes)
  if (
    html.includes('class="showroom-container"') || 
    html.includes('id="showroom-title"') ||
    html.includes('class="showroom-banner-wrapper"') ||
    (html.includes('class="component-container"') && html.includes('x-data="products"'))
  ) {
    return "products-showroom"
  }
  
  return "custom"
}

// Detect multiple components in custom HTML by tracking tag nesting levels
function detectMultipleComponents(html: string): string[] {
  const components: string[] = []
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g

  let currentComponent = ""
  let nestingLevel = 0
  let lastIndex = 0
  let match

  while ((match = tagRegex.exec(html)) !== null) {
    const [fullMatch, tagName] = match
    const isClosingTag = fullMatch.startsWith("</")
    const isSelfClosing =
      fullMatch.endsWith("/>") || ["img", "br", "hr", "input", "meta", "link"].includes(tagName.toLowerCase())

    // Add content before this tag
    currentComponent += html.slice(lastIndex, match.index) + fullMatch
    lastIndex = tagRegex.lastIndex

    if (!isSelfClosing) {
      if (isClosingTag) {
        nestingLevel--
      } else {
        nestingLevel++
      }
    }

    // When we're back to level 0, we've completed a component
    if (nestingLevel === 0 && currentComponent.trim()) {
      components.push(currentComponent.trim())
      currentComponent = ""
    }
  }

  // Add any remaining content
  if (lastIndex < html.length) {
    currentComponent += html.slice(lastIndex)
  }

  if (currentComponent.trim()) {
    components.push(currentComponent.trim())
  }

  return components.filter((comp) => comp.length > 0)
}

// Parse configuration from existing Swiper HTML
function parseSwiperConfig(html: string): any {
  const slides: any[] = []
  const slideRegex =
    /<div class="swiper-slide">\s*<a href="([^"]*)"[\s\S]*?<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[\s\S]*?<\/a>\s*<\/div>/gi

  let slideMatch
  while ((slideMatch = slideRegex.exec(html)) !== null) {
    const slideHtml = slideMatch[0]
    const mobileImageMatch = slideHtml.match(/<source[^>]*max-width[^>]*srcset="([^"]*)"/i)

    slides.push({
      linkUrl: slideMatch[1] || "",
      desktopImage: slideMatch[2] || "",
      mobileImage: mobileImageMatch ? mobileImageMatch[1] : slideMatch[2] || "",
      altText: slideMatch[3] || "",
    })
  }

  return { slides: slides.length > 0 ? slides : [{ linkUrl: "", desktopImage: "", mobileImage: "", altText: "" }] }
}

// Parse configuration from existing Four Categories HTML
function parseFourCategoriesConfig(html: string): any {
  const titleMatch = html.match(/<h2 class="four_categories_title">(.*?)<\/h2>/i)
  const backgroundColorMatch = html.match(/style="background-color:([^;"]*);?"/i)

  const categories: any[] = []
  const categoryRegex =
    /<div class="four_categories_category_wrapper">[\s\S]*?<a href="([^"]*)"[\s\S]*?<img src="([^"]*)" alt="([^"]*)"[\s\S]*?<\/div>/gi

  let categoryMatch
  while ((categoryMatch = categoryRegex.exec(html)) !== null) {
    categories.push({
      linkUrl: categoryMatch[1] || "",
      imageUrl: categoryMatch[2] || "",
      altText: categoryMatch[3] || "",
    })
  }

  // Ensure we have exactly 4 categories
  while (categories.length < 4) {
    categories.push({ linkUrl: "", imageUrl: "", altText: "" })
  }

  return {
    title: titleMatch ? titleMatch[1] : "",
    backgroundColor: backgroundColorMatch ? backgroundColorMatch[1].trim() : "",
    categories: categories.slice(0, 4),
  }
}

// Parse configuration from existing Eight Icons HTML
function parseEightIconsConfig(html: string): any {
  const titleMatch = html.match(/<h2 class="icons-title">(.*?)<\/h2>/i)

  const icons: any[] = []
  const iconRegex =
    /<a href="([^"]*)" class="icon-wrapper">[\s\S]*?<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[\s\S]*?<span>(.*?)<\/span>[\s\S]*?<\/a>/gi

  let iconMatch
  while ((iconMatch = iconRegex.exec(html)) !== null) {
    icons.push({
      linkUrl: iconMatch[1] || "",
      altText: iconMatch[2] || "",
      imageUrl: iconMatch[3] || "",
      subtitle: iconMatch[4] || "",
    })
  }

  // Ensure we have exactly 8 icons
  while (icons.length < 8) {
    icons.push({ linkUrl: "", imageUrl: "", altText: "", subtitle: "" })
  }

  return {
    title: titleMatch ? titleMatch[1] : "",
    icons: icons.slice(0, 8),
  }
}

// Parse configuration from existing Products Showroom HTML
function parseProductsShowroomConfig(html: string): any {
  const titleMatch = html.match(/<h2 id="showroom-title">(.*?)<\/h2>/i)

  // Extract function call to determine configuration
  const functionMatch = html.match(/x-intersect\.once\.margin\.300px="([^"]*)"/)
  let categoryNumber = ""
  let objectIds = ""
  let sale = "no"

  if (functionMatch) {
    const functionCall = functionMatch[1]

    // Check if it's a category-based call
    const categoryRegex = /get(?:Discounted)?ProductsFromCategory\s*\(\s*10\s*,\s*(\d+)\s*,\s*\[(.*?)\]\s*\)/i
    const manualRegex = /getProductsManual\s*\(\s*\[(.*?)\]\s*\)/i

    const categoryMatch = functionCall.match(categoryRegex)

    if (categoryMatch) {
      categoryNumber = categoryMatch[1]
      objectIds = categoryMatch[2].replace(/'/g, "").replace(/\s/g, "")
      sale = functionCall.includes("getDiscountedProductsFromCategory") ? "yes" : "no"
    } else {
      // Check if it's a manual products call
      const manualMatch = functionCall.match(manualRegex)
      if (manualMatch) {
        objectIds = manualMatch[1].replace(/'/g, "").replace(/\s/g, "")
      }
    }
  }

  return {
    title: titleMatch ? titleMatch[1] : "",
    categoryNumber,
    objectIds,
    sale,
  }
}

export const generateProductsShowroomHTML = (config: any) => {
  const {
    mode = 'title',
    title = '',
    bannerConfig,
    categoryNumber = '',
    objectIds = '',
    sale = 'no',
    isRTL = false
  } = config;

  const showroomContainerClass = mode === 'image' && isRTL ? 'showroom-container showroom-container-rtl' : 'showroom-container';

  if (mode === 'title') {
    return `
      <div class="component-container">
        <div class="showroom-container">
          <div class="showroom-header">
            <h2>${title}</h2>
          </div>
          <div class="showroom-content">
            <div x-data="{ copied: false }" class="show-products-button">
              <button @click="copied = true; setTimeout(() => copied = false, 20000)" x-text="copied ? 'Copied!' : 'Show Products'"></button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Image mode
  const { desktopImage = '', mobileImage = '', altText = '', linkUrl = '' } = bannerConfig || {};
  
  return `
    <div class="component-container">
      <div class="${showroomContainerClass}">
        <div class="showroom-banner">
          <a href="${linkUrl}" class="banner-link">
            <picture>
              <source media="(min-width: 768px)" srcset="${desktopImage}">
              <source media="(max-width: 767px)" srcset="${mobileImage}">
              <img src="${desktopImage}" alt="${altText}" class="banner-image">
            </picture>
          </a>
        </div>
        <div class="showroom-content">
          <div x-data="{ copied: false }" class="show-products-button">
            <button @click="copied = true; setTimeout(() => copied = false, 20000)" x-text="copied ? 'Copied!' : 'Show Products'"></button>
          </div>
        </div>
      </div>
    </div>
  `;
};
