import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

export function AnimatedNumber({
  value,
  format = (v) => v.toFixed(0),
}: {
  value: number
  format?: (v: number) => string
}) {
  const mv = useMotionValue(value)
  const display = useTransform(mv, (v) => format(v))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: 'easeOut' })
    return controls.stop
  }, [value, mv])
  return <motion.span>{display}</motion.span>
}
