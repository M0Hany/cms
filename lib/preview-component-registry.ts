import { settingsModel } from "./settings-model"

export interface ComponentTemplate {
  name: string
  defaultConfig: any
  generateHTML: (config: any) => string
}

class PreviewComponentRegistryClass {
  private templates: Map<string, ComponentTemplate> = new Map()

  constructor() {
    this.registerDefaults()
  }

  private registerDefaults() {
    // Swiper Carousel Component
    this.register("swiper", {
      name: "Swiper Carousel",
      defaultConfig: {
        slides: [
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
          },
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
          },
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
          },
        ],
      },
      generateHTML: (config) => {
        const slides = config.slides || []

        // If there's only one slide, use the simple template
        if (slides.length === 1) {
          const slide = slides[0]
          return `<div>
  <a href="${slide.linkUrl}"></a>
  <div class="swiper-slide">
    <a href="${slide.linkUrl}">
      <picture>
        <source media="(min-width: 768px)" srcset="${slide.desktopImage}" />
        <!-- Mobile image -->
        <source media="(max-width: 767px)" srcset="${slide.mobileImage}" />
        <!-- Fallback for older browsers -->
        <img src="${slide.desktopImage}" class="slider-picture" alt="${slide.altText}" loading="lazy" />
      </picture></a>
  </div>
</div>`
        }

        // Multiple slides - use swiper template
        const slidesHTML = slides
          .map(
            (slide: any) => `
    <div class="swiper-slide"><a href="${slide.linkUrl}">
      <picture>
        <source media="(min-width: 768px)" srcset="${slide.desktopImage}" />
        <!-- Mobile image -->
        <source media="(max-width: 767px)" srcset="${slide.mobileImage}" />
        <!-- Fallback for older browsers -->
        <img src="${slide.desktopImage}" class="slider-picture" alt="${slide.altText}" loading="lazy" />
      </picture></a>
    </div>`,
          )
          .join("")

        return `<!-- Swiper -->
<div class="swiper mySwiper">
  <div class="swiper-wrapper">${slidesHTML}
  </div>
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
  <div class="swiper-pagination"></div>
</div>`
      },
    })

    // Four Categories Component
    this.register("four-categories", {
      name: "Four Categories",
      defaultConfig: {
        title: "",
        backgroundColor: "",
        categories: [
          { linkUrl: "", imageUrl: "", altText: "" },
          { linkUrl: "", imageUrl: "", altText: "" },
          { linkUrl: "", imageUrl: "", altText: "" },
          { linkUrl: "", imageUrl: "", altText: "" },
        ],
      },
      generateHTML: (config) => {
        const categories = config.categories || []
        const categoriesHTML = categories
          .map(
            (category: any) => `
      <div class="four_categories_category_wrapper">
        <div style="max-width: 100%;">
          <a href="${category.linkUrl}">
            <div class="four_categories_image_wrapper">
              <img src="${category.imageUrl}" alt="${category.altText}" loading="lazy" width="432" height="467" />
            </div>
          </a>
        </div>
      </div>`,
          )
          .join("")

        return `<div class="four_categories_wrapper" style="background-color:${config.backgroundColor};">
  <div class="four_categories_title_wrapper">
    <div class="four_categories_title_container">
      <h2 class="four_categories_title">${config.title}</h2>
    </div>
  </div>
  <div class="four_categories_container">
    <div class="four_categories_box">${categoriesHTML}
    </div>
  </div>
</div>`
      },
    })

    // Eight Icons Component
    this.register("eight-icons", {
      name: "Eight Icons",
      defaultConfig: {
        title: "",
        icons: [
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "" },
        ],
      },
      generateHTML: (config) => {
        const icons = config.icons || []
        const iconsHTML = icons
          .map(
            (icon: any) => `
      <a href="${icon.linkUrl}" class="icon-wrapper">
        <div class="icon-container">
          <div class="picture-container">
            <picture aria-hidden="true" style="padding-top: 109.773%">
              <img deca-image="true" alt="${icon.altText}" src="${icon.imageUrl}" loading="lazy" />
            </picture>
          </div>
          <div class="icon-subtitle">
            <span>${icon.subtitle}</span>
          </div>
        </div>
      </a>`,
          )
          .join("")

        return `<div id="page-content">
  <h2 class="icons-title">${config.title}</h2>
  <div class="icons-container">
    <div class="icons-wrapper">${iconsHTML}
    </div>
  </div>
</div>`
      },
    })

    // Products Showroom Component
    this.register("products-showroom", {
      name: "Products Showroom",
      defaultConfig: {
        mode: "title",
        title: "",
        categoryNumber: "",
        objectIds: "",
        sale: "no",
        direction: "ltr",
        bannerConfig: {
          desktopImage: "",
          mobileImage: "",
          altText: "",
          linkUrl: ""
        }
      },
      generateHTML: (config) => {
        const objectIDsArray = config.objectIds ? config.objectIds.split(",").map((id: string) => `'${id.trim()}'`) : []
        const sale = config.sale?.toLowerCase() === "yes"
        const currency = settingsModel.getCurrency()
        const isRTL = config.direction === "rtl"

        if (!currency) {
          return "<!-- Error: No currency settings found -->"
        }

        let productFunctionCall = ""
        if (config.categoryNumber) {
          productFunctionCall = sale
            ? `getDiscountedProductsFromCategory(10, ${config.categoryNumber}, [${objectIDsArray.join(", ")}])`
            : `getProductsFromCategory(10, ${config.categoryNumber}, [${objectIDsArray.join(", ")}])`
        } else if (objectIDsArray.length > 0) {
          productFunctionCall = `getProductsManual([${objectIDsArray.join(", ")}])`
        }

        const alpineInit = `
<script>
function initializeAlpineShowroom() {
  window.getProductsFromCategory = async function(prodCount, categoryNumber, priorityObjectIDs = []) {
    const settings = window.settingsModel?.getSettings() || {};
    const clientAlg = algoliasearch(settings.app_id, settings.api_search_key);
    const indexAlg = clientAlg.initIndex(settings.index_name);
    const objectIDFilters = priorityObjectIDs.map((id) => \`objectID:\${id}\`).join(" OR ");

    try {
      const { hits: priorityHits } = await indexAlg.search("", {
        filters: objectIDFilters.length ? objectIDFilters : \`category = \${categoryNumber}\`,
        analytics: false,
      });

      if (priorityObjectIDs.length) {
        const { hits: categoryHits } = await indexAlg.search("", {
          filters: \`category = \${categoryNumber}\`,
          analytics: false,
        });

        const uniqueCategoryHits = categoryHits.filter(
          (hit) => !priorityObjectIDs.includes(hit.objectID)
        );

        return [...priorityHits, ...uniqueCategoryHits].slice(0, prodCount);
      } else {
        return priorityHits.sort((a, b) => b.popularity - a.popularity).slice(0, prodCount);
      }
    } catch (error) {
      return [];
    }
  };

  window.getDiscountedProductsFromCategory = async function(prodCount, categoryNumber, priorityObjectIDs = []) {
    const settings = window.settingsModel?.getSettings() || {};
    const clientAlg = algoliasearch(settings.app_id, settings.api_search_key);
    const indexAlg = clientAlg.initIndex(settings.index_name);
    const objectIDFilters = priorityObjectIDs.map((id) => \`objectID:\${id}\`).join(" OR ");

    try {
      const { hits: priorityHits } = await indexAlg.search("", {
        filters: objectIDFilters.length ? objectIDFilters : \`category = \${categoryNumber} AND percentoff > 0\`,
        analytics: false,
      });

      if (priorityObjectIDs.length) {
        const { hits: categoryHits } = await indexAlg.search("", {
          filters: \`category = \${categoryNumber} AND percentoff > 0\`,
          analytics: false,
        });

        const uniqueCategoryHits = categoryHits.filter(
          (hit) => !priorityObjectIDs.includes(hit.objectID)
        );

        return [...priorityHits, ...uniqueCategoryHits].slice(0, prodCount);
      } else {
        return priorityHits.sort((a, b) => b.popularity - a.popularity).slice(0, prodCount);
      }
    } catch (error) {
      return [];
    }
  };

  window.updateImageUrl = function(url) {
    if (!url) return '';
    return url;
  };
}

initializeAlpineShowroom();
</script>`;

        let headerHtml = ""
        if (config.mode === "title") {
          headerHtml = `<div class="showroom-heading">
  <h2 id="showroom-title">${config.title}</h2>
</div>
  <div class="component-container" style="margin-left: 10px;">`
        } else {
          // Only add RTL class if direction is explicitly set to RTL
          const containerClass = `showroom-container${isRTL ? ' showroom-container-rtl' : ''}`
          headerHtml = `<div class="component-container">
  <div class="${containerClass}">
    <a style="text-decoration: none; display: block; position: relative" href="${config.bannerConfig.linkUrl}">
      <div class="showroom-banner-wrapper">
        <span class="showroom-desktop-banner">
          <span>
            <img alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27268%27%20height=%27477%27/%3e">
          </span>
          <img alt="${config.bannerConfig.altText}" src="${config.bannerConfig.desktopImage}" class="showroom-banner-image" />
        </span>
        <div style="box-sizing: border-box; margin: 0px; min-width: 0px; height: 100%; width: 100%; position: relative;">
          <span class="showroom-mobile-banner">
            <img alt="${config.bannerConfig.altText}" src="${config.bannerConfig.mobileImage}" class="showroom-banner-image" />
          </span>
        </div>
      </div>
    </a>
    <div class="showroom-products-wrapper">`
        }

        let htmlCode = `${alpineInit}
<div class="showroom-component" id="showroom-${Date.now()}">
  ${headerHtml}
  <div class="showroom-container">
    <div class="showroom-products-wrapper">
      <div class="swiper-button-prev left_no_image_arrow showroom_arrow"></div>
      <div class="swiper-button-next right_no_image_arrow showroom_arrow"></div>
      <div class="showroom-products-container">`

        if (productFunctionCall) {
          htmlCode += `
          <section x-data="{ products: [] }" x-init="products = await ${productFunctionCall}">`
        }

        htmlCode += `
          <div class="showroom-products-container no-image-track" style="display: flex;">
            <template x-for="product in products">
              <div class="product--card">
                <a :href="product.url" style="text-decoration: none; color: black;">
                  <div class="product-picture-wrapper">
                    <span>
                      <img class="product-picture" :alt="product.product_name" :src="updateImageUrl(product.image_url)" loading="lazy" />
                    </span>
                  </div>
                  <div class="product-details-wrapper">
                    <div>`

        if (sale) {
          htmlCode += `
                      <span class="old-price" style="padding:5px; color:#616161; text-decoration:line-through;" x-text="product.regular.toFixed(2) + ' ${currency}'"></span>`
        }

        htmlCode += `
                      <div class="product-price-wrapper">
                        <div class="product-price-container">
                          <div class="vp-price">`

        if (sale) {
          htmlCode += `
                            <span class="product-price" style="padding:5px; background-color:#e3262f; color:white;" x-text="product.prix.toFixed(2) + ' ${currency}'"></span>`
        } else {
          htmlCode += `
                            <span class="product-price" x-text="product.prix.toFixed(2) + ' ${currency}'"></span>`
        }

        htmlCode += `
                          </div>
                        </div>
                      </div>
                      <div class="product-brand-wrapper">
                        <span class="product-brand" x-text="product.brand"></span>
                      </div>
                      <div class="product-name" x-text="product.product_name"></div>
                    </div>
                  </div>
                  <div style="box-sizing: border-box; margin: auto 0px 0px; min-width: 0px;">
                    <button class="vp-button">
                      <span class="vp-button__label">
                        <div style="align-items: center; display: flex; justify-content: center;">
                          <svg style="width: 20px; height: 20px; flex: 0 0 auto;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke-width="1.5" aria-hidden="true">
                            <path d="M15.9999 15.7666C17.4821 15.7666 18.6865 14.5622 18.6865 13.0801C18.6865 11.598 17.4821 10.3936 15.9999 10.3936C14.5178 10.3936 13.3134 11.598 13.3134 13.0801C13.3134 14.5622 14.5178 15.7666 15.9999 15.7666Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M21.708 21.7079L17.8747 17.8746C18.9836 16.5674 19.6865 14.8329 19.6865 13.0801C19.6865 8.99472 16.0118 5.32007 11.9264 5.32007C7.84103 5.32007 4.16638 8.99472 4.16638 13.0801C4.16638 17.1655 7.84103 20.84 11.9264 20.84C13.6804 20.84 15.3587 20.2371 16.6977 19.1949L20.5309 23.0281C20.7301 23.2273 20.9919 23.3264 21.2537 23.3264C21.5155 23.3264 21.7774 23.2273 21.9766 23.0281C22.3749 22.6299 22.3749 21.9963 21.9771 21.5985L21.708 21.7079Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                          </svg>
                        View Product
                      </div>
                      </span>
                    </button>
                  </div>
                </a>
              </div>
            </template>
          </div>`

        if (productFunctionCall) {
          htmlCode += `
        </section>`
        }

        htmlCode += `
        </div>
      </div>
    </div>
  </div>
</div>`

        return htmlCode
      },
    })
  }

  register(type: string, template: ComponentTemplate) {
    this.templates.set(type, template)
  }

  getTemplate(type: string): ComponentTemplate | undefined {
    return this.templates.get(type)
  }

  getAllTemplates(): ComponentTemplate[] {
    return Array.from(this.templates.values())
  }
}

export const PreviewComponentRegistry = new PreviewComponentRegistryClass()