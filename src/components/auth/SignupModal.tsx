import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { signupSchema } from '@/utils/validation';
import type { ZodError } from 'zod';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password strength indicators
  const passwordRequirements = [
    { label: '8+ characters', test: (pass: string) => pass.length >= 8 },
    { label: 'Uppercase letter', test: (pass: string) => /[A-Z]/.test(pass) },
    { label: 'Lowercase letter', test: (pass: string) => /[a-z]/.test(pass) },
    { label: 'Number', test: (pass: string) => /[0-9]/.test(pass) },
    { label: 'Special character', test: (pass: string) => /[^A-Za-z0-9]/.test(pass) }
  ];

  // Real-time validation
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    try {
      signupSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        if ((error as ZodError).errors) {
          const zodError = error as ZodError;
          const newErrors: Record<string, string> = {};
          zodError.errors.forEach((err) => {
            if (err.path && touched[err.path[0]]) {
              newErrors[err.path[0]] = err.message;
            }
          });
          setErrors(newErrors);
        }
      }
    }
  }, [formData, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    try {
      signupSchema.parse(formData);
    } catch (error) {
      if (error instanceof Error) {
        if ((error as ZodError).errors) {
          const zodError = error as ZodError;
          const newErrors: Record<string, string> = {};
          zodError.errors.forEach((err) => {
            if (err.path) {
              newErrors[err.path[0]] = err.message;
            }
          });
          setErrors(newErrors);
        }
      }
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically make an API call to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(loginSuccess({
        id: Math.random().toString(),
        email: formData.email,
        name: formData.name
      }));
      onClose();
    } catch (error) {
      setErrors({
        submit: 'Failed to create account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Create your account
                  </Dialog.Title>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg bg-gray-700 border ${
                          errors.name ? 'border-red-500' : 'border-gray-600'
                        } px-4 py-2.5 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
                        placeholder="John Doe"
                      />
                      <AnimatePresence mode="wait">
                        {errors.name && touched.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-sm text-red-500"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg bg-gray-700 border ${
                          errors.email ? 'border-red-500' : 'border-gray-600'
                        } px-4 py-2.5 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
                        placeholder="you@example.com"
                      />
                      <AnimatePresence mode="wait">
                        {errors.email && touched.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-sm text-red-500"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <div className="mt-1 space-y-2">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg bg-gray-700 border ${
                          errors.password ? 'border-red-500' : 'border-gray-600'
                        } px-4 py-2.5 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
                        placeholder="••••••••"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {passwordRequirements.map(({ label, test }) => (
                          <div
                            key={label}
                            className={`flex items-center text-sm ${
                              test(formData.password) ? 'text-green-400' : 'text-gray-400'
                            }`}
                          >
                            {test(formData.password) ? (
                              <CheckIcon className="h-4 w-4 mr-1.5" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 mr-1.5" />
                            )}
                            {label}
                          </div>
                        ))}
                      </div>
                      <AnimatePresence mode="wait">
                        {errors.password && touched.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-500"
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg bg-gray-700 border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                        } px-4 py-2.5 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
                        placeholder="••••••••"
                      />
                      <AnimatePresence mode="wait">
                        {errors.confirmPassword && touched.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-sm text-red-500"
                          >
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {errors.submit && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 text-center"
                      >
                        {errors.submit}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className={`w-full rounded-xl py-3 px-6 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all bg-gradient-to-r from-indigo-500 to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="ml-2">Creating account...</span>
                      </div>
                    ) : (
                      'Create account'
                    )}
                  </motion.button>

                  <div className="text-sm text-center">
                    <span className="text-gray-400">Already have an account?</span>{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLoginClick();
                      }}
                      className="font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      Log in
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default SignupModal;
