import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { XMarkIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSchema } from '@/utils/validation';
import { login } from '@/services/api';
import type { ZodError } from 'zod';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const initialFormData = {
  email: '',
  password: ''
};

function LoginModal({ isOpen, onClose, onSignupClick }: LoginModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);

    try {
      // Validate form data
      loginSchema.parse(formData);

      // Attempt login
      const response = await login(formData);
      
      // Update Redux store with user data and tokens
      dispatch(loginSuccess({
        ...response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      }));

      // Only close modal and clear form on successful login
      setFormData(initialFormData);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle validation errors
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
        } else {
          // Handle API errors
          setServerError(error.message || 'Invalid email or password');
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClasses = (fieldName: string) => {
    const baseClasses = 'block w-full rounded-lg border p-2.5 text-sm';
    if (errors[fieldName]) {
      return `${baseClasses} bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500`;
    }
    return `${baseClasses} bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500`;
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  Log in to your account
                  <button
                    type="button"
                    className="rounded-lg p-1 hover:bg-gray-100 focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Server Error Message */}
                  <AnimatePresence>
                    {serverError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-lg bg-red-50 p-4 text-sm text-red-800 flex items-start"
                      >
                        <XCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{serverError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-900">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={getInputClasses('email')}
                      placeholder="name@company.com"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-900">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={getInputClasses('password')}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                        Remember me
                      </label>
                    </div>
                    <button type="button" className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={onSignupClick}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default LoginModal;
