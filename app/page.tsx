"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Settings as SettingsIcon, GripVertical, Copy, Check, Eye, Edit, ChevronUp, ChevronDown, Code, Smartphone } from "lucide-react"
import { ComponentDialog } from "@/components/component-dialog"
import { AddComponentDialog } from "@/components/add-component-dialog"
import { MobileTutorialDialog } from "@/components/mobile-tutorial-dialog"
import { AssetRegistry } from "@/lib/asset-registry"
import { PreviewAssetRegistry } from "@/lib/preview-asset-registry"
import { ComponentRegistry } from "@/lib/component-registry"
import { generateHTML, parseComponents } from "@/lib/html-generator"
import type { Component } from "@/types/component"
import type { Settings } from "@/types/settings"
import { ShowroomSettingsDialog } from "@/components/showroom-settings-dialog"
import Cookies from "js-cookie"
import { settingsModel } from "@/lib/settings-model"

// Cookie prefix constant
const COOKIE_PREFIX = "showroom_"

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

export default function WebPageBuilder() {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showMobileTutorial, setShowMobileTutorial] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())
  const [hasSettings, setHasSettings] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [showingProducts, setShowingProducts] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [htmlCode, setHtmlCode] = useState("")
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default')

  // Initialize settings from cookies
  useEffect(() => {
    // Get settings from cookies
    const app_id = Cookies.get(COOKIE_PREFIX + "app_id")
    const api_search_key = Cookies.get(COOKIE_PREFIX + "api_search_key")
    const index_name = Cookies.get(COOKIE_PREFIX + "index_name")
    const currency = Cookies.get(COOKIE_PREFIX + "currency")

    // Only pass settings if required values are present
    if (app_id && api_search_key && index_name) {
      const settings: Settings = {
        app_id,
        api_search_key,
        index_name,
        currency: currency || "EGP" // Use cookie value or default
      }
      
      // Initialize settings model first
      settingsModel.initializeSettings(settings)
      setSettings(settings)
      setHasSettings(true)
    }
  }, [])

  // Update HTML when components change
  useEffect(() => {
    if (!hasSettings) {
      return
    }

    const previewHtml = generateHTML(components, true)
    const codeHtml = generateHTML(components, false)
    setHtmlCode(codeHtml)

    requestAnimationFrame(() => {
      const previewContainer = document.getElementById("preview")
      if (previewContainer) {
        previewContainer.innerHTML = previewHtml
        PreviewAssetRegistry.injectDefaultAssets()
      }
    })
  }, [components, hasSettings, settings])

  const handleAddComponent = (type: string) => {
    if (type) {
      const template = ComponentRegistry.getTemplate(type)
      if (!template) {
        return
      }

      const newComponent: Component = {
        id: `${type}-${Date.now()}`,
        type,
        config: template.defaultConfig,
        html: "",  // Don't generate HTML yet
      }

      setSelectedComponent(newComponent)
      setShowAddDialog(false)
      setIsDialogOpen(true)
    }
  }

  const handleAddCustomComponent = (htmlCode: string) => {
    const parsedComponents = parseComponents(htmlCode)
    setComponents((prevComponents) => [...prevComponents, ...parsedComponents])
  }

  const handleEditComponent = (component: Component) => {
    setSelectedComponent(component)
    setIsDialogOpen(true)
  }

  const handleSaveComponent = (component: Component) => {
    const template = ComponentRegistry.getTemplate(component.type)
    if (template) {
      const generatedHtml = template.generateHTML(component.config)
      const updatedComponent = { ...component, html: generatedHtml }

      setComponents((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === component.id)
        if (existingIndex >= 0) {
          const newComponents = [...prev]
          newComponents[existingIndex] = updatedComponent
          return newComponents
        } else {
          return [...prev, updatedComponent]  // Add new component here after configuration
        }
      })
    }
    setIsDialogOpen(false)
    setSelectedComponent(null)
    setShowingProducts(false)
  }

  const handleSaveComponentCode = (component: Component, newHtml: string) => {
    console.log("[handleSaveComponentCode] Starting to save code changes:", {
      componentId: component.id,
      componentType: component.type,
      newHtmlLength: newHtml.length
    })

    // Parse the new HTML to extract updated configuration
    const parsedComponents = parseComponents(newHtml)
    console.log("[handleSaveComponentCode] Parsed components:", parsedComponents)

    if (parsedComponents.length === 0) {
      console.warn("[handleSaveComponentCode] No components parsed from HTML, aborting save")
      return
    }

    // Get the parsed component's config and HTML
    const parsedComponent = parsedComponents[0]
    console.log("[handleSaveComponentCode] Using first parsed component:", {
      parsedType: parsedComponent.type,
      parsedConfig: parsedComponent.config
    })

    const updatedComponent = {
      ...component,
      config: parsedComponent.config,
      html: parsedComponent.html
    }
    console.log("[handleSaveComponentCode] Created updated component:", {
      id: updatedComponent.id,
      type: updatedComponent.type,
      configChanged: JSON.stringify(component.config) !== JSON.stringify(parsedComponent.config),
      htmlChanged: component.html !== parsedComponent.html
    })

    setComponents((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === component.id)
      console.log("[handleSaveComponentCode] Updating components state:", {
        found: existingIndex >= 0,
        index: existingIndex,
        totalComponents: prev.length
      })

      if (existingIndex >= 0) {
        const newComponents = [...prev]
        newComponents[existingIndex] = updatedComponent
        return newComponents
      }
      return prev
    })
    setIsDialogOpen(false)
    setSelectedComponent(null)
    setShowingProducts(false)
    console.log("[handleSaveComponentCode] Finished saving code changes")
  }

  const handleDeleteComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id))
    setShowingProducts(false)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(components)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setComponents(items)
    setShowingProducts(false)
  }

  const handleCopyCode = () => {
    const codeWithAssets = AssetRegistry.getCodeWithAssets(htmlCode)
    navigator.clipboard.writeText(codeWithAssets).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  const handleShowProducts = () => {
    setShowingProducts(true)
    AssetRegistry.initializeInteractiveComponents()
    // The button will remain in loading state until components are modified or rearranged
  }

  return (
    <div className="flex h-screen">
      {/* Component List Sidebar */}
      <div className="w-[20%] bg-gray-50 border-r p-4 flex flex-col h-full sidebar">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700"
          >
            <SettingsIcon className="h-4 w-4" />
            Algolia Settings
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileTutorial(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowAddDialog(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Draggable List */}
        <div className="flex-1 overflow-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="components">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {components.map((component, index) => (
                    <Draggable key={component.id} draggableId={component.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white p-3 rounded-lg mb-2 border flex items-center justify-between group ${
                            snapshot.isDragging ? "shadow-lg" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab hover:bg-gray-50 p-1 rounded"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <span>{componentDisplayNames[component.type] || component.type}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditComponent(component)}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            >
                              <SettingsIcon className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteComponent(component.id)}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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

        {/* Preview Actions */}
        <div className="mt-4">
          <Button onClick={handleCopyCode} size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full">
            {copiedCode ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy Code
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="w-[80%] bg-white overflow-auto h-full">
        <div className="min-h-full">
          {components.length > 0 ? (
            <div id="preview" className="preview-container" />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Get Started with Your Page</p>
              <p className="mb-6">Start fresh by adding components from the sidebar, or paste your existing page code to edit it.</p>
              <Button 
                onClick={() => {
                  setShowAddDialog(true)
                  setActiveTab('custom')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Code className="w-4 h-4 mr-2" />
                Paste Existing Page Code
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Component Dialog */}
      <AddComponentDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSelectComponent={handleAddComponent}
        onAddCustomComponent={handleAddCustomComponent}
        activeTab={activeTab}
      />

      {/* Component Configuration Dialog */}
      {selectedComponent && (
        <ComponentDialog
          component={selectedComponent}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedComponent(null)
          }}
          onSave={handleSaveComponent}
          onSaveCode={handleSaveComponentCode}
        />
      )}

      <MobileTutorialDialog
        isOpen={showMobileTutorial}
        onClose={() => setShowMobileTutorial(false)}
      />

      <ShowroomSettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />

      <style jsx global>{`
        .component-preview {
          margin: 0;
          padding: 0;
        }
        
        .component-preview > * {
          margin-top: 0;
          margin-bottom: 0;
        }

        /* Hide sidebar on mobile devices */
        @media (max-width: 767px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
