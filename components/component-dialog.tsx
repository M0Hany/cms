"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Settings, Code, GripVertical } from "lucide-react"
import type { Component } from "@/types/component"
import { parseComponents } from "@/lib/html-generator"
import { Switch } from "@/components/ui/switch"

interface ComponentDialogProps {
  component: Component
  isOpen: boolean
  onClose: () => void
  onSave: (component: Component) => void
  onSaveCode: (component: Component, html: string) => void
}

export function ComponentDialog({ component, isOpen, onClose, onSave, onSaveCode }: ComponentDialogProps) {
  const [config, setConfig] = useState(component.config)
  const [htmlCode, setHtmlCode] = useState(component.html)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setConfig(component.config)
    setHtmlCode(component.html)
    setSelectedIndex(0)
  }, [component])

  const handleSave = () => {
    onSave({ ...component, config })
  }

  const handleSaveCode = () => {
    // Try to parse the component type and config from the HTML
    const parsedComponents = parseComponents(htmlCode, true)
    if (parsedComponents.length > 0) {
      const parsedComponent = parsedComponents[0]
      onSaveCode({ ...component, type: parsedComponent.type, config: parsedComponent.config }, htmlCode)
    } else {
    onSaveCode(component, htmlCode)
    }
  }

  const handleDragEnd = (result: any, arrayKey: string) => {
    if (!result.destination) return

    const items = Array.from(config[arrayKey] || [])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setConfig({ ...config, [arrayKey]: items })

    // Update selected index if needed
    if (selectedIndex === result.source.index) {
      setSelectedIndex(result.destination.index)
    } else if (selectedIndex === result.destination.index) {
      setSelectedIndex(result.source.index)
    }
  }

  const renderComponentSettings = () => {
    switch (component.type) {
      case "swiper":
        return renderSwiperSettings()
      case "four-categories":
        return renderFourCategoriesSettings()
      case "eight-icons":
        return renderEightIconsSettings()
      case "products-showroom":
        return renderProductsShowroomSettings()
      default:
        return (
          <div className="p-6">
            <p className="text-gray-500">This component type doesn't have specific settings.</p>
          </div>
        )
    }
  }

  const renderSwiperSettings = () => {
    const slides = config.slides || []

    return (
              <div className="flex h-full w-full">
                {/* Left Sidebar - 20% width */}
                <div className="w-1/5 border-r bg-gray-50 flex flex-col min-h-[500px]">
                  <div className="p-4 border-b">
                    <Button
                      onClick={() => {
                        const newSlides = [
                          ...slides,
                          {
                            linkUrl: "",
                            desktopImage: "",
                            mobileImage: "",
                            altText: "",
                          },
                        ]
                        setConfig({ ...config, slides: newSlides })
                        setSelectedIndex(newSlides.length - 1)
                      }}
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slide
                    </Button>
                  </div>

                  <div className="flex-1">
                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, "slides")}>
                      <Droppable droppableId="slides">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 h-full">
                            {slides.map((slide: any, index: number) => (
                              <Draggable key={`slide-${index}`} draggableId={`slide-${index}`} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`mb-2 p-3 rounded border cursor-pointer transition-colors ${
                                      selectedIndex === index
                                        ? "bg-blue-100 border-blue-300"
                                        : "bg-white border-gray-200 hover:bg-gray-50"
                                    } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                    onClick={() => setSelectedIndex(index)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium truncate">
                                        {slide.altText || `Slide ${index + 1}`}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <div {...provided.dragHandleProps} className="cursor-grab p-1">
                                          <GripVertical className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const newSlides = slides.filter((_: any, i: number) => i !== index)
                                            setConfig({ ...config, slides: newSlides })
                                            if (selectedIndex >= newSlides.length) {
                                              setSelectedIndex(Math.max(0, newSlides.length - 1))
                                            }
                                          }}
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>

                {/* Right Content - 80% width */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-6">
                    {slides.length > 0 && selectedIndex < slides.length ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Edit {slides[selectedIndex]?.altText || `Slide ${selectedIndex + 1}`}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="link-url">Link URL</Label>
                            <Input
                              id="link-url"
                              value={slides[selectedIndex]?.linkUrl || ""}
                              onChange={(e) => {
                                const newSlides = [...slides]
                                newSlides[selectedIndex] = { ...newSlides[selectedIndex], linkUrl: e.target.value }
                                setConfig({ ...config, slides: newSlides })
                              }}
                              placeholder="https://example.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="alt-text">Alt Text</Label>
                            <Input
                              id="alt-text"
                              value={slides[selectedIndex]?.altText || ""}
                              onChange={(e) => {
                                const newSlides = [...slides]
                                newSlides[selectedIndex] = { ...newSlides[selectedIndex], altText: e.target.value }
                                setConfig({ ...config, slides: newSlides })
                              }}
                              placeholder="Image description"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="desktop-image">Desktop Image URL</Label>
                          <Input
                            id="desktop-image"
                            value={slides[selectedIndex]?.desktopImage || ""}
                            onChange={(e) => {
                              const newSlides = [...slides]
                              newSlides[selectedIndex] = { ...newSlides[selectedIndex], desktopImage: e.target.value }
                              setConfig({ ...config, slides: newSlides })
                            }}
                            placeholder="https://example.com/desktop.jpg"
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-image">Mobile Image URL</Label>
                          <Input
                            id="mobile-image"
                            value={slides[selectedIndex]?.mobileImage || ""}
                            onChange={(e) => {
                              const newSlides = [...slides]
                              newSlides[selectedIndex] = { ...newSlides[selectedIndex], mobileImage: e.target.value }
                              setConfig({ ...config, slides: newSlides })
                            }}
                            placeholder="https://example.com/mobile.jpg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>No slides added yet.</p>
                        <p className="text-sm">Click "Add Slide" to create your first slide.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 p-6 border-t">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Component</Button>
                  </div>
                </div>
              </div>
    )
  }

  const renderFourCategoriesSettings = () => {
    const categories = config.categories || []

    return (
              <div className="flex h-full w-full">
                {/* Left Sidebar - 20% width */}
                <div className="w-1/5 border-r bg-gray-50 flex flex-col min-h-[500px]">
                  <div className="p-4 border-b">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="main-title">Main Title</Label>
                        <Input
                          id="main-title"
                          value={config.title || ""}
                          onChange={(e) => setConfig({ ...config, title: e.target.value })}
                          placeholder="Enter main title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bg-color">Background Color</Label>
                        <Input
                          id="bg-color"
                          value={config.backgroundColor || ""}
                          onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                          placeholder="#ffffff or white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, "categories")}>
                      <Droppable droppableId="categories">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 h-full">
                            {[0, 1, 2, 3].map((index) => {
                              const category = categories[index] || { linkUrl: "", imageUrl: "", altText: "" }
                              return (
                                <Draggable key={`category-${index}`} draggableId={`category-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`mb-2 p-3 rounded border cursor-pointer transition-colors ${
                                        selectedIndex === index
                                          ? "bg-blue-100 border-blue-300"
                                          : "bg-white border-gray-200 hover:bg-gray-50"
                                      } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                      onClick={() => setSelectedIndex(index)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium truncate">
                                          {category.altText || `Category ${index + 1}`}
                                        </span>
                                        <div {...provided.dragHandleProps} className="cursor-grab p-1">
                                          <GripVertical className="w-3 h-3 text-gray-400" />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>

                {/* Right Content - 80% width */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Edit {categories[selectedIndex]?.altText || `Category ${selectedIndex + 1}`}
                      </h3>

                      <div>
                        <Label htmlFor="link-url">Link URL</Label>
                        <Input
                          id="link-url"
                          value={categories[selectedIndex]?.linkUrl || ""}
                          onChange={(e) => {
                            const newCategories = [...(config.categories || [{}, {}, {}, {}])]
                            newCategories[selectedIndex] = { ...newCategories[selectedIndex], linkUrl: e.target.value }
                            setConfig({ ...config, categories: newCategories })
                          }}
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                          id="image-url"
                          value={categories[selectedIndex]?.imageUrl || ""}
                          onChange={(e) => {
                            const newCategories = [...(config.categories || [{}, {}, {}, {}])]
                            newCategories[selectedIndex] = { ...newCategories[selectedIndex], imageUrl: e.target.value }
                            setConfig({ ...config, categories: newCategories })
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="alt-text">Alt Text</Label>
                        <Input
                          id="alt-text"
                          value={categories[selectedIndex]?.altText || ""}
                          onChange={(e) => {
                            const newCategories = [...(config.categories || [{}, {}, {}, {}])]
                            newCategories[selectedIndex] = { ...newCategories[selectedIndex], altText: e.target.value }
                            setConfig({ ...config, categories: newCategories })
                          }}
                          placeholder="Image description"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 p-6 border-t">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Component</Button>
                  </div>
                </div>
              </div>
    )
  }

  const renderEightIconsSettings = () => {
    const icons = config.icons || []

    return (
              <div className="flex h-full w-full">
                {/* Left Sidebar - 20% width */}
                <div className="w-1/5 border-r bg-gray-50 flex flex-col min-h-[500px]">
                  <div className="p-4 border-b">
                    <div>
                      <Label htmlFor="main-title">Main Title</Label>
                      <Input
                        id="main-title"
                        value={config.title || ""}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        placeholder="Enter main title"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, "icons")}>
                      <Droppable droppableId="icons">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 h-full">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
                              const icon = icons[index] || { linkUrl: "", imageUrl: "", altText: "", subtitle: "" }
                              return (
                                <Draggable key={`icon-${index}`} draggableId={`icon-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`mb-2 p-3 rounded border cursor-pointer transition-colors ${
                                        selectedIndex === index
                                          ? "bg-blue-100 border-blue-300"
                                          : "bg-white border-gray-200 hover:bg-gray-50"
                                      } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                      onClick={() => setSelectedIndex(index)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium truncate">
                                          {icon.subtitle || `Icon ${index + 1}`}
                                        </span>
                                        <div {...provided.dragHandleProps} className="cursor-grab p-1">
                                          <GripVertical className="w-3 h-3 text-gray-400" />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>

                {/* Right Content - 80% width */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Edit {icons[selectedIndex]?.subtitle || `Icon ${selectedIndex + 1}`}
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="link-url">Link URL</Label>
                          <Input
                            id="link-url"
                            value={icons[selectedIndex]?.linkUrl || ""}
                            onChange={(e) => {
                              const newIcons = [...(config.icons || Array(8).fill({}))]
                              newIcons[selectedIndex] = { ...newIcons[selectedIndex], linkUrl: e.target.value }
                              setConfig({ ...config, icons: newIcons })
                            }}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                          <Input
                            id="subtitle"
                            value={icons[selectedIndex]?.subtitle || ""}
                            onChange={(e) => {
                              const newIcons = [...(config.icons || Array(8).fill({}))]
                              newIcons[selectedIndex] = { ...newIcons[selectedIndex], subtitle: e.target.value }
                              setConfig({ ...config, icons: newIcons })
                            }}
                            placeholder="Icon subtitle"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                          id="image-url"
                          value={icons[selectedIndex]?.imageUrl || ""}
                          onChange={(e) => {
                            const newIcons = [...(config.icons || Array(8).fill({}))]
                            newIcons[selectedIndex] = { ...newIcons[selectedIndex], imageUrl: e.target.value }
                            setConfig({ ...config, icons: newIcons })
                          }}
                          placeholder="https://example.com/icon.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="alt-text">Alt Text</Label>
                        <Input
                          id="alt-text"
                          value={icons[selectedIndex]?.altText || ""}
                          onChange={(e) => {
                            const newIcons = [...(config.icons || Array(8).fill({}))]
                            newIcons[selectedIndex] = { ...newIcons[selectedIndex], altText: e.target.value }
                            setConfig({ ...config, icons: newIcons })
                          }}
                          placeholder="Image description"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 p-6 border-t">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Component</Button>
                  </div>
                </div>
              </div>
    )
  }

  const renderProductsShowroomSettings = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6 p-6">
          <div className="space-y-4">
            {/* Toggles Row */}
            <div className="flex items-center gap-6">
              <div>
                <Label className="mb-2 block">Display Mode</Label>
                <div className="relative w-fit rounded-full border bg-muted p-1">
                  <div
                    className={`absolute transition-all duration-200 ${
                      config.mode === "title" ? "translate-x-0" : "translate-x-full"
                    } top-1 left-1 h-8 w-[90px] rounded-full bg-background`}
                  />
                  <div className="relative flex">
                    <button
                      className={`relative z-10 h-8 w-[90px] rounded-full text-sm transition-colors ${
                        config.mode === "title" ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setConfig({ ...config, mode: "title" })}
                    >
                      Title
                    </button>
                    <button
                      className={`relative z-10 h-8 w-[90px] rounded-full text-sm transition-colors ${
                        config.mode === "image" ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setConfig({ ...config, mode: "image" })}
                    >
                      Image
                    </button>
                  </div>
                </div>
              </div>

              {config.mode === "image" && (
                <div>
                  <Label className="mb-2 block">Direction</Label>
                  <div className="relative w-fit rounded-full border bg-muted p-1">
                    <div
                      className={`absolute transition-all duration-200 ${
                        !config.isRTL ? "translate-x-0" : "translate-x-full"
                      } top-1 left-1 h-8 w-[90px] rounded-full bg-background`}
                    />
                    <div className="relative flex">
                      <button
                        className={`relative z-10 h-8 w-[90px] rounded-full text-sm transition-colors ${
                          !config.isRTL ? "text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={() => setConfig({ ...config, isRTL: false })}
                      >
                        LTR
                      </button>
                      <button
                        className={`relative z-10 h-8 w-[90px] rounded-full text-sm transition-colors ${
                          config.isRTL ? "text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={() => setConfig({ ...config, isRTL: true })}
                      >
                        RTL
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="mb-2 block">Sale Mode</Label>
                <div className="relative w-fit rounded-full border bg-muted p-1">
                  <div
                    className={`absolute transition-all duration-200 ${
                      config.sale === "no" ? "translate-x-0" : "translate-x-full"
                    } top-1 left-1 h-8 w-[90px] rounded-full bg-background`}
                  />
                  <div className="relative flex">
                    <button
                      className={`relative z-10 h-8 w-[90px] rounded-full text-sm transition-colors ${
                        config.sale === "no" ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setConfig({ ...config, sale: "no" })}
                    >
                      Regular
                    </button>
                    <button
                      className={`relative z-10 h-8 w-[90px] rounded-full text-sm transition-colors ${
                        config.sale === "yes" ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setConfig({ ...config, sale: "yes" })}
                    >
                      Sale
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {config.mode === "title" ? (
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={config.title || ""}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Enter showroom title"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="desktop-image">Desktop Image URL</Label>
                  <Input
                    id="desktop-image"
                    value={config.bannerConfig?.desktopImage || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        bannerConfig: { ...config.bannerConfig, desktopImage: e.target.value },
                      })
                    }
                    placeholder="Enter desktop image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile-image">Mobile Image URL</Label>
                  <Input
                    id="mobile-image"
                    value={config.bannerConfig?.mobileImage || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        bannerConfig: { ...config.bannerConfig, mobileImage: e.target.value },
                      })
                    }
                    placeholder="Enter mobile image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="alt-text">Alt Text</Label>
                  <Input
                    id="alt-text"
                    value={config.bannerConfig?.altText || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        bannerConfig: { ...config.bannerConfig, altText: e.target.value },
                      })
                    }
                    placeholder="Enter image alt text"
                  />
                </div>
                <div>
                  <Label htmlFor="link-url">Redirection Link</Label>
                  <Input
                    id="link-url"
                    value={config.bannerConfig?.linkUrl || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        bannerConfig: { ...config.bannerConfig, linkUrl: e.target.value },
                      })
                    }
                    placeholder="Enter redirection URL"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="category">Category Number</Label>
              <Input
                id="category"
                value={config.categoryNumber || ""}
                onChange={(e) => setConfig({ ...config, categoryNumber: e.target.value })}
                placeholder="Enter category number"
              />
            </div>

            <div>
              <Label htmlFor="object-ids">Object IDs (comma-separated)</Label>
              <Input
                id="object-ids"
                value={config.objectIds || ""}
                onChange={(e) => setConfig({ ...config, objectIds: e.target.value })}
                placeholder="Enter object IDs"
              />
            </div>
          </div>
        </div>

        {/* Dialog Footer with Buttons */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Component</Button>
        </div>
      </div>
    )
  }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
          <DialogTitle>Configure {component.type.charAt(0).toUpperCase() + component.type.slice(1)}</DialogTitle>
          </DialogHeader>

        <Tabs defaultValue="settings" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>

          <TabsContent value="settings" className="flex-1 overflow-y-auto">
            {renderComponentSettings()}
            </TabsContent>

          <TabsContent value="code" className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-6">
              <div>
                  <Label htmlFor="component-code">Component HTML Code</Label>
                  <Textarea
                    id="component-code"
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Edit the HTML code for this component..."
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Advanced Editing</h4>
                  <p className="text-sm text-yellow-800">
                  You're editing the raw HTML code. Make sure to keep the structure valid to avoid breaking the component.
                  </p>
                </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCode}>Save Code</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
