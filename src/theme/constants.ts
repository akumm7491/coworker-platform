export const colors = {
  primary: {
    from: 'from-indigo-600',
    to: 'to-purple-600',
    hover: {
      from: 'from-indigo-700',
      to: 'to-purple-700'
    },
    text: 'text-indigo-600',
    bg: 'bg-indigo-600',
    light: {
      from: 'from-indigo-50',
      to: 'to-purple-50'
    }
  },
  success: {
    from: 'from-emerald-500',
    to: 'to-teal-500',
    hover: {
      from: 'from-emerald-600',
      to: 'to-teal-600'
    },
    text: 'text-emerald-600',
    bg: 'bg-emerald-500',
    light: {
      from: 'from-emerald-50',
      to: 'to-teal-50'
    }
  },
  warning: {
    from: 'from-amber-500',
    to: 'to-orange-500',
    hover: {
      from: 'from-amber-600',
      to: 'to-orange-600'
    },
    text: 'text-amber-600',
    bg: 'bg-amber-500',
    light: {
      from: 'from-amber-50',
      to: 'to-orange-50'
    }
  },
  error: {
    from: 'from-rose-500',
    to: 'to-pink-500',
    hover: {
      from: 'from-rose-600',
      to: 'to-pink-600'
    },
    text: 'text-rose-600',
    bg: 'bg-rose-500',
    light: {
      from: 'from-rose-50',
      to: 'to-pink-50'
    }
  },
  neutral: {
    from: 'from-gray-500',
    to: 'to-slate-500',
    hover: {
      from: 'from-gray-600',
      to: 'to-slate-600'
    },
    text: 'text-gray-600',
    bg: 'bg-gray-500',
    light: {
      from: 'from-gray-50',
      to: 'to-slate-50'
    }
  }
} as const;

export const status = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'text-green-500',
    border: 'border-green-200',
    glow: 'shadow-green-500/20'
  },
  paused: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: 'text-yellow-500',
    border: 'border-yellow-200',
    glow: 'shadow-yellow-500/20'
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'text-blue-500',
    border: 'border-blue-200',
    glow: 'shadow-blue-500/20'
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'text-red-500',
    border: 'border-red-200',
    glow: 'shadow-red-500/20'
  },
  idle: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'text-gray-500',
    border: 'border-gray-200',
    glow: 'shadow-gray-500/20'
  }
} as const;

export const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  scale: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  },
  lift: {
    hover: { y: -4 }
  },
  rotate: {
    hover: { rotate: 360, scale: 1.2 },
    transition: { duration: 0.5 }
  }
} as const;
