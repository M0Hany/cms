"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface MobileTutorialDialogProps {
  isOpen: boolean
  onClose: () => void
}

const tutorialSteps = [
  {
    title: "Step 1: Open Chrome DevTools",
    description: "Right-click anywhere on the page and click 'Inspect Element' to open Chrome DevTools.",
    image: "/assets/1.png"
  },
  {
    title: "Step 2: Toggle Device Toolbar",
    description: "Click the 'Toggle device toolbar' icon in the DevTools toolbar to enable mobile view.",
    image: "/assets/2.png"
  },
  {
    title: "Step 3: Adjust DevTools Position",
    description: "Click the three dots menu and select 'Dock to right' to optimize the mobile preview space.",
    image: "/assets/3.png"
  },
  {
    title: "Step 4: Select Mobile Size",
    description: "Choose 'Mobile L - 425px' from the responsive dimensions dropdown at the top.",
    image: "/assets/4.png"
  },
  {
    title: "Step 5: Exit Mobile View",
    description: "When finished, click the 'X' in the top-right corner to close DevTools and return to normal view.",
    image: "/assets/5.png"
  }
]

export function MobileTutorialDialog({ isOpen, onClose }: MobileTutorialDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>How to View Mobile Layout</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={tutorialSteps[currentStep].image}
              alt={tutorialSteps[currentStep].title}
              fill
              className="object-contain"
            />
          </div>

          <div className="text-center space-y-2 px-4">
            <h3 className="text-lg font-semibold">{tutorialSteps[currentStep].title}</h3>
            <p className="text-gray-600">{tutorialSteps[currentStep].description}</p>
          </div>

          <div className="flex items-center justify-between w-full pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentStep < tutorialSteps.length - 1 ? (
              <Button onClick={handleNext} className="flex items-center">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white">
                Got it!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 