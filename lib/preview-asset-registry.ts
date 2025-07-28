import { settingsModel } from "./settings-model"

export interface Asset {
  type: "css" | "js"
  url: string
  id: string
}

class PreviewAssetRegistryClass {
  private assets: Set<string> = new Set()
  private defaultAssets: Asset[] = [
    // Scripts
    {
      type: "js",
      url: "https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js",
      id: "algolia-search-js",
    },
    {
      type: "js",
      url: "https://unpkg.com/@alpinejs/intersect@3.8.1/dist/cdn.min.js",
      id: "alpine-intersect-js",
    },
    {
      type: "js",
      url: "https://unpkg.com/alpinejs@3.8.1/dist/cdn.min.js",
      id: "alpine-js",
    },
    {
      type: "js",
      url: "https://unpkg.com/swiper/swiper-bundle.min.js",
      id: "swiper-js",
    },
    {
      type: "js",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.js",
      id: "banner-carousel-js",
    },
    // Stylesheets
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.css",
      id: "banner-carousel-css",
    },
    {
      type: "css",
      url: "https://unpkg.com/@vtmn/css-button",
      id: "vtmn-button-css",
    },
    {
      type: "css",
      url: "https://unpkg.com/swiper/swiper-bundle.min.css",
      id: "swiper-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/4%20blocks.css",
      id: "four-blocks-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/8%20icons.css",
      id: "eight-icons-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Showroom.css",
      id: "showroom-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Page%20stretch.css",
      id: "page-stretch-css",
    },
    // New informational styles
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/dual%20section.css",
      id: "dual-section-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/hero%20banner.css",
      id: "hero-banner-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/info%20grid%20section.css",
      id: "info-grid-section-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/faqs%20section.css",
      id: "faqs-section-css",
    },
  ]

  private customScript = `<script>
document.addEventListener("DOMContentLoaded", function() {
  // Get settings from the settings model
  const settings = window.settingsModel?.getSettings() || {};
  
  // Initialize Algolia details from settings
  window.algoliaDetails = {
    app_id: settings.app_id,
    api_search_key: settings.api_search_key,
    index_name: settings.index_name
  };

  const tracks = document.querySelectorAll(".showroom-products-track");
  const leftShowroomArrows = document.querySelectorAll(".left_showroom_arrow");
  const rightShowroomArrows = document.querySelectorAll(".right_showroom_arrow");
  const trackTranslations = Array(tracks.length).fill(0);

  const noImageTracks = document.querySelectorAll(".no-image-track");
  const leftNoImageArrows = document.querySelectorAll(".left_no_image_arrow");
  const rightNoImageArrows = document.querySelectorAll(".right_no_image_arrow");
  const noImageTrackTranslations = Array(noImageTracks.length).fill(0);

  // Rest of the script remains the same
  // ... existing code ...
});

// Define global functions for Alpine.js
window.getProductsFromCategory = function(prodCount, categoryNumber, priorityObjectIDs = []) {
  const settings = window.settingsModel?.getSettings() || {};
  const clientAlg = algoliasearch(
    settings.app_id,
    settings.api_search_key
  );
  const indexAlg = clientAlg.initIndex(settings.index_name);
  const objectIDFilters = priorityObjectIDs
    .map((id) => \`objectID:\${id}\`)
    .join(" OR ");

  return indexAlg
    .search("", {
      filters: objectIDFilters.length
        ? objectIDFilters
        : \`category = \${categoryNumber}\`,
      analytics: false,
    })
    .then(({ hits: priorityHits }) => {
      if (priorityObjectIDs.length) {
        return indexAlg
          .search("", {
            filters: \`category = \${categoryNumber}\`,
            analytics: false,
          })
          .then(({ hits: categoryHits }) => {
            const uniqueCategoryHits = categoryHits.filter(
              (hit) => !priorityObjectIDs.includes(hit.objectID)
            );

            return [
              ...priorityHits,
              ...uniqueCategoryHits,
            ].slice(0, prodCount);
          });
      } else {
        return priorityHits
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, prodCount);
      }
    });
};

window.getDiscountedProductsFromCategory = function(prodCount, categoryNumber, priorityObjectIDs = []) {
  const settings = window.settingsModel?.getSettings() || {};
  const clientAlg = algoliasearch(
    settings.app_id,
    settings.api_search_key
  );
  const indexAlg = clientAlg.initIndex(settings.index_name);
  const objectIDFilters = priorityObjectIDs
    .map((id) => \`objectID:\${id}\`)
    .join(" OR ");

  return indexAlg
    .search("", {
      filters: objectIDFilters.length
        ? objectIDFilters
        : \`category = \${categoryNumber} AND percentoff > 0\`,
      analytics: false,
    })
    .then(({ hits: priorityHits }) => {
      if (priorityObjectIDs.length) {
        return indexAlg
          .search("", {
            filters: \`category = \${categoryNumber} AND percentoff > 0\`,
            analytics: false,
          })
          .then(({ hits: categoryHits }) => {
            const uniqueCategoryHits = categoryHits.filter(
              (hit) => !priorityObjectIDs.includes(hit.objectID)
            );

            return [
              ...priorityHits,
              ...uniqueCategoryHits,
            ].slice(0, prodCount);
          });
      } else {
        return priorityHits
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, prodCount);
      }
    });
};

window.updateImageUrl = function(url) {
  if (!url) return '';
  // Add any image URL transformation logic here if needed
  return url;
};

document.addEventListener("alpine:init", () => {
  // Register any additional Alpine.js components or data here if needed
});
</script>`

  addAsset(asset: Asset): boolean {
    if (this.hasAsset(asset.id)) {
      return false
    }

    if (typeof window !== "undefined" && window.document) {
      if (asset.type === "css") {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = asset.url
        link.id = asset.id
        link.setAttribute("async", "true")
        document.head.appendChild(link)
      } else if (asset.type === "js") {
        const script = document.createElement("script")
        script.src = asset.url
        script.id = asset.id
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
    }

    this.assets.add(asset.id)
    return true
  }

  injectDefaultAssets() {
    if (typeof window !== "undefined" && window.document) {
      // Make settings model available globally for preview
      ;(window as any).settingsModel = settingsModel

      // Inject all default assets
      this.defaultAssets.forEach((asset) => {
        this.addAsset(asset)
      })

      // Inject custom script
      if (!document.getElementById("custom-script")) {
        const scriptElement = document.createElement("script")
        scriptElement.type = "text/javascript"
        scriptElement.id = "custom-script"
        scriptElement.async = true
        scriptElement.defer = true
        scriptElement.innerHTML = this.customScript.replace(/<script>|<\/script>/g, "")
        document.head.appendChild(scriptElement)
      }

      // Add preview-only initialization script
      if (!document.getElementById("preview-init")) {
        const previewScript = document.createElement("script")
        previewScript.id = "preview-init"
        previewScript.innerHTML = `
          // Wait for Alpine.js to load
          const waitForAlpine = setInterval(() => {
            if (window.Alpine) {
              clearInterval(waitForAlpine)
              // Initialize Alpine
              window.Alpine.start()
              // Initialize any Alpine components that were added dynamically
              document.querySelectorAll('[x-data]').forEach(el => {
                if (!el._x_dataStack) {
                  window.Alpine.initTree(el)
                }
              })
            }
          }, 100)
        `
        document.head.appendChild(previewScript)
      }
    }
  }

  hasAsset(id: string): boolean {
    return this.assets.has(id)
  }

  clear(): void {
    this.assets.clear()
    if (typeof window !== "undefined") {
      this.defaultAssets.forEach((asset) => {
        const element = document.getElementById(asset.id)
        if (element) {
          element.remove()
        }
      })
      const customScript = document.getElementById("custom-script")
      if (customScript) {
        customScript.remove()
      }
    }
  }
}

export const PreviewAssetRegistry = new PreviewAssetRegistryClass()

// Add Swiper to window type for TypeScript
declare global {
  interface Window {
    settingsModel: typeof settingsModel
    Swiper: any
  }
} 