"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FerrisWheelIcon as Carousel, Grid, Layout } from "lucide-react"

interface ComponentSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectComponent: (type: string) => void
}

export function ComponentSelectionDialog({ isOpen, onClose, onSelectComponent }: ComponentSelectionDialogProps) {
  const components = [
    {
      type: "swiper",
      name: "Swiper Carousel",
      description: "Responsive image carousel with navigation and pagination",
      icon: Carousel,
      preview: "Image slider with multiple slides",
    },
    {
      type: "four-categories",
      name: "Four Categories",
      description: "Grid layout with 4 category images and links",
      icon: Grid,
      preview: "2x2 grid of category images",
    },
    {
      type: "hero",
      name: "Hero Section",
      description: "Large banner section with title, subtitle and call-to-action",
      icon: Layout,
      preview: "Hero banner with text and button",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Component</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {components.map((component) => {
            const IconComponent = component.icon
            return (
              <Card
                key={component.type}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                onClick={() => onSelectComponent(component.type)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 p-3 bg-blue-50 rounded-full w-fit">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <CardDescription className="text-sm">{component.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-center text-xs text-gray-500 bg-gray-50 p-2 rounded">{component.preview}</div>
                  <Button className="w-full mt-3" size="sm">
                    Add Component
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
