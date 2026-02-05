import type { PetriNet, Place, Transition, OperatorTransition, Arc } from '@/types/petri-net'
import { VISUAL, OperatorType, OPERATOR_INFO } from '@/types/petri-net'

/**
 * Image exporter for SVG and PNG formats
 */
export class ImageExporter {
  /**
   * Export PetriNet to SVG string
   */
  exportSVG(net: PetriNet, padding: number = 50): string {
    const bounds = this.calculateBounds(net, padding)
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${bounds.width}" 
     height="${bounds.height}" 
     viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#1a1a1a"/>
    </marker>
  </defs>
  
  <style>
    .place { fill: white; stroke: #1a1a1a; stroke-width: 2; }
    .transition { fill: white; stroke: #1a1a1a; stroke-width: 2; }
    .operator-and { fill: white; stroke: #4CAF50; stroke-width: 2; }
    .operator-xor { fill: white; stroke: #FF9800; stroke-width: 2; }
    .arc { fill: none; stroke: #1a1a1a; stroke-width: 2; marker-end: url(#arrowhead); }
    .token { fill: #1a1a1a; }
    .label { font-family: system-ui, sans-serif; font-size: 12px; fill: #333; text-anchor: middle; }
  </style>
  
  <!-- Arcs -->
  ${this.renderArcs(net)}
  
  <!-- Places -->
  ${this.renderPlaces(net.places)}
  
  <!-- Transitions -->
  ${this.renderTransitions(net.transitions)}
  
  <!-- Operators -->
  ${this.renderOperators(net.operators)}
</svg>`

    return svg
  }

  /**
   * Export PetriNet to PNG blob
   */
  async exportPNG(net: PetriNet, scale: number = 2): Promise<Blob> {
    const svgString = this.exportSVG(net)
    const bounds = this.calculateBounds(net, 50)
    
    // Create image from SVG
    const img = new Image()
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
    
    // Draw to canvas
    const canvas = document.createElement('canvas')
    canvas.width = bounds.width * scale
    canvas.height = bounds.height * scale
    
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    
    // White background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)
    
    URL.revokeObjectURL(url)
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create PNG blob'))
        },
        'image/png',
        1.0
      )
    })
  }

  /**
   * Calculate bounding box of all elements
   */
  private calculateBounds(net: PetriNet, padding: number): {
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
  } {
    const positions = [
      ...net.places.map((p) => p.position),
      ...net.transitions.map((t) => t.position),
      ...net.operators.map((o) => o.position),
    ]
    
    if (positions.length === 0) {
      return { minX: 0, minY: 0, maxX: 200, maxY: 200, width: 200, height: 200 }
    }
    
    const xs = positions.map((p) => p.x)
    const ys = positions.map((p) => p.y)
    
    const minX = Math.min(...xs) - padding - VISUAL.place.radius
    const maxX = Math.max(...xs) + padding + VISUAL.place.radius
    const minY = Math.min(...ys) - padding - VISUAL.place.radius
    const maxY = Math.max(...ys) + padding + VISUAL.place.radius + 30 // Extra for labels
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  /**
   * Render places as SVG
   */
  private renderPlaces(places: Place[]): string {
    return places.map((place) => {
      const { x, y } = place.position
      const r = VISUAL.place.radius
      
      let tokensMarkup = ''
      if (place.tokens > 0) {
        if (place.tokens <= 5) {
          // Render as dots
          const tokenPositions = this.getTokenPositions(place.tokens, r * 0.5)
          tokensMarkup = tokenPositions
            .map((pos) => `<circle class="token" cx="${x + pos.x}" cy="${y + pos.y}" r="4"/>`)
            .join('\n    ')
        } else {
          // Render as number
          tokensMarkup = `<text x="${x}" y="${y + 4}" class="label">${place.tokens}</text>`
        }
      }
      
      return `
  <g>
    <circle class="place" cx="${x}" cy="${y}" r="${r}"/>
    ${tokensMarkup}
    <text x="${x}" y="${y + r + 18}" class="label">${this.escapeXml(place.name)}</text>
  </g>`
    }).join('\n')
  }

  /**
   * Get token dot positions
   */
  private getTokenPositions(count: number, radius: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = []
    
    if (count === 1) {
      positions.push({ x: 0, y: 0 })
    } else if (count === 2) {
      positions.push({ x: -radius * 0.4, y: 0 }, { x: radius * 0.4, y: 0 })
    } else if (count === 3) {
      positions.push({ x: 0, y: -radius * 0.3 }, { x: -radius * 0.4, y: radius * 0.3 }, { x: radius * 0.4, y: radius * 0.3 })
    } else if (count === 4) {
      positions.push(
        { x: -radius * 0.35, y: -radius * 0.35 },
        { x: radius * 0.35, y: -radius * 0.35 },
        { x: -radius * 0.35, y: radius * 0.35 },
        { x: radius * 0.35, y: radius * 0.35 }
      )
    } else {
      positions.push(
        { x: 0, y: -radius * 0.4 },
        { x: -radius * 0.4, y: 0 },
        { x: radius * 0.4, y: 0 },
        { x: -radius * 0.35, y: radius * 0.35 },
        { x: radius * 0.35, y: radius * 0.35 }
      )
    }
    
    return positions
  }

  /**
   * Render transitions as SVG
   */
  private renderTransitions(transitions: Transition[]): string {
    return transitions.map((trans) => {
      const { x, y } = trans.position
      const w = VISUAL.transition.width
      const h = VISUAL.transition.height
      
      return `
  <g>
    <rect class="transition" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"/>
    <text x="${x}" y="${y + h / 2 + 18}" class="label">${this.escapeXml(trans.name)}</text>
  </g>`
    }).join('\n')
  }

  /**
   * Render operators as SVG
   */
  private renderOperators(operators: OperatorTransition[]): string {
    return operators.map((op) => {
      const { x, y } = op.position
      const size = VISUAL.operator.size / 2
      const info = OPERATOR_INFO[op.operatorType]
      const isAnd = op.operatorType.includes('and')
      const cssClass = isAnd ? 'operator-and' : 'operator-xor'
      
      let shape: string
      if (isAnd) {
        // Diamond shape for AND
        shape = `<polygon class="${cssClass}" points="${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}"/>`
      } else {
        // Circle with X for XOR
        const offset = size * 0.5
        shape = `
    <circle class="${cssClass}" cx="${x}" cy="${y}" r="${size}"/>
    <line x1="${x - offset}" y1="${y - offset}" x2="${x + offset}" y2="${y + offset}" stroke="${info.color}" stroke-width="2"/>
    <line x1="${x + offset}" y1="${y - offset}" x2="${x - offset}" y2="${y + offset}" stroke="${info.color}" stroke-width="2"/>`
      }
      
      return `
  <g>
    ${shape}
    <text x="${x}" y="${y + size + 18}" class="label">${this.escapeXml(op.name)}</text>
  </g>`
    }).join('\n')
  }

  /**
   * Render arcs as SVG
   */
  private renderArcs(net: PetriNet): string {
    const elements = new Map<string, { position: { x: number; y: number }; type: 'place' | 'transition' | 'operator' }>()
    
    net.places.forEach((p) => elements.set(p.id, { position: p.position, type: 'place' }))
    net.transitions.forEach((t) => elements.set(t.id, { position: t.position, type: 'transition' }))
    net.operators.forEach((o) => elements.set(o.id, { position: o.position, type: 'operator' }))
    
    return net.arcs.map((arc) => {
      const source = elements.get(arc.sourceId)
      const target = elements.get(arc.targetId)
      
      if (!source || !target) return ''
      
      // Calculate start and end points on element edges
      const angle = Math.atan2(
        target.position.y - source.position.y,
        target.position.x - source.position.x
      )
      
      const startPoint = this.getPointOnEdge(source.position, source.type, angle)
      const endPoint = this.getPointOnEdge(target.position, target.type, angle + Math.PI)
      
      return `<line class="arc" x1="${startPoint.x}" y1="${startPoint.y}" x2="${endPoint.x}" y2="${endPoint.y}"/>`
    }).join('\n  ')
  }

  /**
   * Get point on element edge
   */
  private getPointOnEdge(
    center: { x: number; y: number },
    type: 'place' | 'transition' | 'operator',
    angle: number
  ): { x: number; y: number } {
    if (type === 'place') {
      const r = VISUAL.place.radius
      return {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle),
      }
    } else {
      // Rectangle intersection
      const w = type === 'operator' ? VISUAL.operator.size : VISUAL.transition.width
      const h = type === 'operator' ? VISUAL.operator.size : VISUAL.transition.height
      const hw = w / 2
      const hh = h / 2
      
      const tanAngle = Math.tan(angle)
      let x: number, y: number
      
      if (Math.abs(Math.cos(angle)) * hh > Math.abs(Math.sin(angle)) * hw) {
        // Intersects left or right edge
        x = Math.cos(angle) > 0 ? hw : -hw
        y = x * tanAngle
      } else {
        // Intersects top or bottom edge
        y = Math.sin(angle) > 0 ? hh : -hh
        x = y / tanAngle
      }
      
      return { x: center.x + x, y: center.y + y }
    }
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

// Singleton instance
export const imageExporter = new ImageExporter()
