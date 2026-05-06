import { useState } from 'react'
import { Box, Typography } from '@mui/material'

const GRADIENTS = [
  'linear-gradient(135deg, #1A7B6E 0%, #2A9D8F 100%)',
  'linear-gradient(135deg, #E89C20 0%, #F5C565 100%)',
  'linear-gradient(135deg, #145F55 0%, #1A7B6E 100%)',
  'linear-gradient(135deg, #C47F0A 0%, #E89C20 100%)',
  'linear-gradient(135deg, #2A9D8F 0%, #B8D4C0 100%)',
  'linear-gradient(135deg, #1A7B6E 0%, #E89C20 100%)',
]

export function gradientFor(title: string) {
  if (!title) return GRADIENTS[0]
  return GRADIENTS[title.charCodeAt(0) % GRADIENTS.length]
}

interface BookCoverProps {
  url?: string | null
  title: string | null | undefined
  height: number | string
  fontSize?: string | number
  borderRadius?: number | string
  sx?: object
}

export function BookCover({
  url,
  title: rawTitle,
  height,
  fontSize = '3rem',
  borderRadius = 3,
  sx,
}: BookCoverProps) {
  const title = rawTitle ?? ''
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const showImage = !!url && !errored
  const imageVisible = showImage && loaded

  return (
    <Box
      data-book-cover
      sx={{
        height,
        position: 'relative',
        background: gradientFor(title),
        borderRadius,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {showImage && (
        <Box
          component="img"
          src={url ?? undefined}
          alt={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageVisible ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 800,
          fontSize,
          opacity: imageVisible ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        {title.charAt(0)}
      </Typography>
    </Box>
  )
}
