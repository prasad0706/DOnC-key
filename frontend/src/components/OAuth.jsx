import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export default function OAuth() {
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try {
            await googleLogin();
            navigate('/dashboard');
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            if (error.code === 'auth/popup-blocked') {
                alert('Please allow popups for this site to sign in with Google.');
            } else if (error.code === 'auth/operation-not-allowed') {
                alert('Google Sign-In is not enabled in Firebase Console.');
            } else {
                alert('Failed to sign in with Google. Please try again.');
            }
        }
    };

    return (
        <button
            onClick={handleGoogleClick}
            type='button'
            className='btn-secondary w-full gap-2'
        >
            <FcGoogle className='text-xl' />
            <span>Continue with Google</span>
        </button>
    );
}
