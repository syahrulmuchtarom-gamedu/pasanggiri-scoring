// Utility classes untuk dark mode yang konsisten
export const darkModeClasses = {
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    light: 'text-gray-400 dark:text-gray-500'
  },
  
  // Background colors
  bg: {
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-gray-50 dark:bg-gray-900',
    card: 'bg-white dark:bg-gray-800',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700'
  },
  
  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    light: 'border-gray-100 dark:border-gray-800'
  },
  
  // Button variants
  button: {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200',
    danger: 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300',
    success: 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
  },
  
  // Input fields
  input: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500',
  
  // Tables
  table: {
    header: 'border-b dark:border-gray-700 text-gray-900 dark:text-white',
    row: 'border-b dark:border-gray-700 text-gray-900 dark:text-gray-100'
  }
};