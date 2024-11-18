import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { Spinner } from '@/components/ui/Spinner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const processOAuthCallback = () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const userStr = params.get('user');
        const error = params.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate(`/login?error=${encodeURIComponent(error)}`);
          return;
        }

        if (!accessToken || !refreshToken || !userStr) {
          throw new Error('Missing authentication data');
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Update Redux store
        dispatch(
          loginSuccess({
            ...user,
            accessToken,
            refreshToken,
          })
        );

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=Authentication failed');
      }
    };

    processOAuthCallback();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we complete your authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
