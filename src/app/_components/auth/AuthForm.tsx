'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Modal } from '@/_components/ui/Modal';
import Spinner from '@/_components/ui/Spinner';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { useUser } from '@/_contexts/UserContext';
import { useAuthModal } from '@/_contexts/AuthContext';
import { signInWithEmail, signUpNewUser } from '@/api/auth';
import { LogIn } from 'lucide-react';

interface AuthFormInput {
  email: string;
  password: string;
  birthyear: number;
  birthmonth: number;
  name: string;
}

export default function AuthForm() {
  const [state, setState] = useState('login'); // ['login', 'register']
  const [showPassword, setShowPassword] = useState(false);
  const { showModal, setShowModal } = useAuthModal();
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormInput>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit: SubmitHandler<AuthFormInput> = async data => {
    if (state === 'login') {
      const resp = await signInWithEmail(data.email, data.password);
      if ('user' in resp) {
        setUser(resp.user);
        toast({
          title: "You're logged in",
          description: 'Welcome back!',
          className: 'bg-green-700 text-white border-transparent',
        });
        setShowModal(false);
      } else {
        toast({
          title: 'Error',
          description: resp.message || 'An error occurred',
          className: 'bg-red-700 text-white border-transparent',
        });
      }
      router.refresh();
    } else {
      const resp = await signUpNewUser(data.email, data.password);
      if ('message' in resp) {
        toast({
          title: 'Signup Error',
          description: resp.message || 'An error occurred during signup',
          className: 'bg-red-700 text-white border-transparent',
        });
      } else {
        toast({
          title: 'Verify email',
          description: 'Please check your email to verify your account.',
          className: 'bg-green-700 text-white border-transparent',
        });
        setShowModal(false);
      }
      router.refresh();
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  const btn = (
    <button
      type="button"
      onClick={() => toggleModal()}
      className="p-1.5 rounded-full dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 focus:outline-none flex flex-col items-center"
      aria-label="Account / Register / Login"
    >
      <span className="bg-gray-800 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-200 rounded-sm p-1.5">
        <LogIn className="h-5 w-5 text-white dark:text-gray-900" />
      </span>
      <span className="hidden md:block ml-1 text-xs">Log in</span>
    </button>
  );

  return (
    <div>
      {btn}

      <Modal
        isOpen={showModal}
        handleClose={toggleModal}
        backdropDismiss={true}
        className="p-0 max-w-md"
      >
        {/* Modal header */}
        <div
          className={`flex items-center justify-between mx-auto px-5 md:px-10 py-5 border-b rounded-t transition-colors duration-300 ${
            state === 'register'
              ? 'bg-gray-900 border-green-200 dark:border-green-700'
              : 'bg-white border-gray-200 dark:border-base-700'
          }`}
        >
          <div className="flex flex-col">
            <h3
              className={`text-xl font-semibold transition-colors duration-300 ${
                state === 'register' ? 'text-gray-200' : 'text-base-900 dark:text-base-100'
              }`}
            >
              {state === 'login' ? 'Welcome Back' : 'Join breaddie'}
            </h3>
            <p
              className={`text-sm mt-1 transition-colors duration-300 ${
                state === 'register' ? 'text-gray-400' : 'text-base-700 dark:text-base-300'
              }`}
            >
              {state === 'login' ? 'Sign in to your account' : 'Create your new account'}
            </p>
          </div>
        </div>

        <form className="max-w-lg mx-auto p-5 md:p-10" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5 w-full">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-500 focus:border-base-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-base-500 dark:focus:border-base-500"
              required
              placeholder="Email"
              {...register('email', {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              })}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email?.type === 'required' && <p role="alert">Please enter your email</p>}
            {errors.email?.type === 'pattern' && <p role="alert">Please enter a valid email</p>}
          </div>
          <div className="mb-4 md:mb-5 w-full">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-500 focus:border-base-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-base-500 dark:focus:border-base-500"
                required
                placeholder="Password"
                {...register('password', { required: true })}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  <svg
                    className={`h-6 ${showPassword ? 'hidden' : 'block'}`}
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="30px"
                    width="30px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      strokeWidth="2"
                      d="M12,17 C9.27272727,17 6,14.2222222 6,12 C6,9.77777778 9.27272727,7 12,7 C14.7272727,7 18,9.77777778 18,12 C18,14.2222222 14.7272727,17 12,17 Z M11,12 C11,12.55225 11.44775,13 12,13 C12.55225,13 13,12.55225 13,12 C13,11.44775 12.55225,11 12,11 C11.44775,11 11,11.44775 11,12 Z"
                    ></path>
                  </svg>
                  <svg
                    className={`h-6 ${showPassword ? 'block' : 'hidden'}`}
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="30px"
                    width="30px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      strokeWidth="2"
                      d="M3,12 L6,12 C6.5,14.5 9.27272727,17 12,17 C14.7272727,17 17.5,14.5 18,12 L21,12 M12,17 L12,20 M7.5,15.5 L5.5,17.5 M16.5,15.5 L18.5,17.5"
                    ></path>
                  </svg>
                </button>
              </div>
              {errors.password?.type === 'required' && (
                <p role="alert">Please enter your password</p>
              )}
            </div>
          </div>
          {state === 'login' && (
            <div className="flex flex-col md:flex-row justify-between mb-5">
              <a
                className="text-sm text-gray-400 font-medium text-foreground mb-4 md:mb-0 md:ml-4 order-1 md:order-2"
                href="/forgot-password"
              >
                Forgot password?
              </a>
            </div>
          )}
          <button
            type="submit"
            className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 w-full text-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              state === 'register'
                ? 'bg-gray-900 hover:bg-gray-800 focus-visible:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus-visible:ring-gray-700'
                : 'bg-base-600 hover:bg-base-700 focus-visible:ring-base-500 dark:bg-base-600 dark:hover:bg-base-700 dark:focus-visible:ring-base-700'
            } ${isSubmitting ? 'disabled:opacity-50' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner className="mr-1.5 inline-block" />}
            {state === 'login' ? 'Log in' : 'Sign up'}
          </button>

          {state === 'login' && (
            <div className="text-sm text-gray-500 text-center mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all duration-300">
              <p className="mb-2">No account yet?</p>
              <button
                onClick={() => setState('register')}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium underline decoration-2 underline-offset-2 hover:decoration-green-600 dark:hover:decoration-green-300 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                Create your account →
              </button>
            </div>
          )}
          {state === 'register' && (
            <div className="text-sm text-gray-500 text-center mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all duration-300">
              <p className="mb-2">Already have an account?</p>
              <button
                onClick={() => setState('login')}
                className="text-base-600 hover:text-base-700 dark:text-base-400 dark:hover:text-base-300 font-medium underline decoration-2 underline-offset-2 hover:decoration-base-600 dark:hover:decoration-base-300 transition-all duration-200 transform hover:scale-105"
              >
                ← Sign in instead
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
