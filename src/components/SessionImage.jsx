import { useState } from 'react'

// Shows a labelled placeholder when an image URL is missing or fails to load.
export default function SessionImage({ src, alt, className = '', label }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`image-fallback ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : 'true'}>
        <span>{label || 'Photo unavailable'}</span>
      </div>
    )
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
}
