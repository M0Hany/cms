"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Settings, GripVertical, Copy, Check, Eye, Edit, ChevronUp, ChevronDown, Code, Smartphone } from "lucide-react"
import { ComponentDialog } from "@/components/component-dialog"
import { AddComponentDialog } from "@/components/add-component-dialog"
import { MobileTutorialDialog } from "@/components/mobile-tutorial-dialog"
import { AssetRegistry } from "@/lib/asset-registry"
import { ComponentRegistry } from "@/lib/component-registry"
import { generateHTML, parseComponents } from "@/lib/html-generator"
import type { Component } from "@/types/component"
import { ShowroomSettingsDialog } from "@/components/showroom-settings-dialog"

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
  const [htmlCode, setHtmlCode] = useState("")
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [rawHtmlPreview, setRawHtmlPreview] = useState("")
  const [showRawPreview, setShowRawPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showingProducts, setShowingProducts] = useState(false)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default')
  const [isMobileTutorialOpen, setIsMobileTutorialOpen] = useState(false)
  const [isShowroomSettingsOpen, setIsShowroomSettingsOpen] = useState(false)

  // Initialize default assets on component mount
  useEffect(() => {
    AssetRegistry.injectDefaultAssets()
  }, [])

  // Update HTML when components change
  useEffect(() => {
    const newHtml = generateHTML(components)
    setHtmlCode(newHtml)
    setPreviewKey((prev) => prev + 1)
    // Reset showing products state when components are modified
    setShowingProducts(false)
  }, [components])

  // Debounced update for raw HTML preview
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRawHtmlPreview(htmlCode)
      setPreviewKey((prev) => prev + 1)
      // Reinitialize interactive components after preview update
      setTimeout(() => {
        AssetRegistry.initializeInteractiveComponents()
      }, 100)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [htmlCode])

  // Parse components when HTML changes
  useEffect(() => {
    try {
      const parsedComponents = parseComponents(htmlCode)
      if (parsedComponents.length > 0) {
        setShowRawPreview(false)
      } else {
        setShowRawPreview(true)
      }
    } catch (error) {
      console.warn("Could not parse HTML:", error)
      setShowRawPreview(true)
    }
  }, [htmlCode])

  const handleAddComponent = (type: string) => {
    const componentTemplate = ComponentRegistry.getTemplate(type)
    if (componentTemplate) {
      setSelectedComponent({
        id: `${type}-${Date.now()}`,
        type,
        config: componentTemplate.defaultConfig,
        html: "",
      })
      setIsAddDialogOpen(false)
      setIsDialogOpen(true)
    }
  }

  const handleAddCustomComponent = (htmlCode: string) => {
    try {
      const parsedComponents = parseComponents(htmlCode, true) // true for custom parsing
      const newComponents = [...components, ...parsedComponents]
      setComponents(newComponents)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to parse custom component:", error)
    }
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
          return [...prev, updatedComponent]
        }
      })
    }
    setIsDialogOpen(false)
    setSelectedComponent(null)
    setShowingProducts(false)
  }

  const handleSaveComponentCode = (component: Component, newHtml: string) => {
    const updatedComponent = { ...component, html: newHtml }
    setComponents((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === component.id)
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
  }

  const handleDeleteComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(components)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setComponents(items)
    setShowingProducts(false)
  }

  const handleCopyCode = async () => {
    const codeWithAssets = AssetRegistry.getCodeWithAssets(htmlCode)
    try {
      await navigator.clipboard.writeText(codeWithAssets)
      setCopied(true)
      // Reset copy state after 3 seconds
      const timeoutId = setTimeout(() => {
        setCopied(false)
        // Re-initialize Alpine components after the copy state changes back
        setTimeout(() => {
          AssetRegistry.initializeInteractiveComponents()
        }, 100)
      }, 3000) // 3 seconds

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShowProducts = () => {
    setShowingProducts(true)
    AssetRegistry.initializeInteractiveComponents()
    // The button will remain in loading state until components are modified or rearranged
  }

  return (
    <div className="h-screen flex">
      {/* Component List Sidebar */}
      <div className="w-80 bg-gray-50 border-r p-4 flex flex-col sidebar">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Components</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileTutorialOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsShowroomSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
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
                              <Settings className="w-3 h-3" />
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
        <div className="flex items-center gap-2 mb-4">
          <Button onClick={handleCopyCode} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            {copied ? (
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
          <Button onClick={handleShowProducts} size="sm" disabled={showingProducts}>
            {showingProducts ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Showing Products
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Show Products
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-white overflow-auto">
        <div className="min-h-full">
          {components.map((component) => (
            <div key={component.id} dangerouslySetInnerHTML={{ __html: component.html }} />
          ))}
          {components.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Get Started with Your Page</p>
              <p className="mb-6">Start fresh by adding components from the sidebar, or paste your existing page code to edit it.</p>
              <Button 
                onClick={() => {
                  setIsAddDialogOpen(true)
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
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
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
        isOpen={isMobileTutorialOpen}
        onClose={() => setIsMobileTutorialOpen(false)}
      />

      <ShowroomSettingsDialog
        open={isShowroomSettingsOpen}
        onOpenChange={setIsShowroomSettingsOpen}
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
