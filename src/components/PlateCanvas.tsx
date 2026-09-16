import { useEffect, useRef } from 'react'
import { rgbText } from '../plate/generator'
import type { GeneratedPlate } from '../test/types'

interface PlateCanvasProps {
  plate: GeneratedPlate
}

export function PlateCanvas({ plate }: PlateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = 900
    const height = 540
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = width
    canvas.height = height
    context.fillStyle = rgbText(plate.backgroundColor)
    context.fillRect(0, 0, width, height)
    plate.dots.forEach((dot) => {
      context.beginPath()
      context.fillStyle = rgbText(dot.color)
      context.arc(dot.x * width, dot.y * height, dot.radius * width, 0, Math.PI * 2)
      context.fill()
    })
  }, [plate])

  return <canvas ref={canvasRef} className="plate-canvas" role="img" aria-label="Hidden Number 色彩圓點題板" />
}
