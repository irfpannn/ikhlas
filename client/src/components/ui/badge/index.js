import { cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        destructive:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        outline:
          'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        orange:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
