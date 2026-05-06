import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { IconButton, Badge, alpha, useTheme } from '@mui/material'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { motion } from 'framer-motion'

export function CartButton({ totalItems }: { totalItems: number }) {
  const theme = useTheme()
  const [bumpKey, setBumpKey] = useState(0)
  const prevTotal = useRef(totalItems)

  useEffect(() => {
    if (totalItems > prevTotal.current) setBumpKey((k) => k + 1)
    prevTotal.current = totalItems
  }, [totalItems])

  useEffect(() => {
    const handler = () => setBumpKey((k) => k + 1)
    window.addEventListener('cart:bump', handler)
    return () => window.removeEventListener('cart:bump', handler)
  }, [])

  return (
    <IconButton
      component={Link}
      to="/cart"
      data-cart-icon
      sx={{
        color: 'text.secondary',
        '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.08) },
      }}
    >
      <motion.div
        key={bumpKey}
        animate={bumpKey > 0 ? { scale: [1, 1.35, 0.9, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ display: 'inline-flex' }}
      >
        <Badge
          badgeContent={totalItems}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: 'secondary.main',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
            },
          }}
        >
          <ShoppingCartOutlinedIcon />
        </Badge>
      </motion.div>
    </IconButton>
  )
}
