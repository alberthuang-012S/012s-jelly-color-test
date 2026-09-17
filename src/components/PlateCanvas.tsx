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
    const width = 720
    const height = 720
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = width
    canvas.height = height
    context.fillStyle = '#f7f6f2'
    context.fillRect(0, 0, width, height)
    context.save()
    context.beginPath()
    context.arc(width / 2, height / 2, width * 0.43, 0, Math.PI * 2)
    context.clip()
    context.fillStyle = rgbText(plate.backgroundColor)
    context.fillRect(0, 0, width, height)
    plate.dots.forEach((dot) => {
      context.beginPath()
      context.fillStyle = rgbText(dot.color)
      context.arc(dot.x * width, dot.y * height, dot.radius * width, 0, Math.PI * 2)
      context.fill()
    })
    context.restore()
  }, [plate])

  return <canvas ref={canvasRef} className="plate-canvas" role="img" aria-label="Hidden Number 色彩圓點題板" />
}
