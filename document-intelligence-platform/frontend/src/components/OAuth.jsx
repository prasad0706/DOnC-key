
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export default function OAuth() {
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            // Using the exported auth from ../utils/firebase which already handles initialization
            const result = await signInWithPopup(auth, provider);

            // Backend integration logic would go here.
            // Since the backend does not currently support google auth endpoints,
            // we are using the context to handle the user session client-side.

            /* 
            // Original logic for backend sync:
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: result.user.displayName,
                email: result.user.email,
                photo: result.user.photoURL,
              }),
            });
            const data = await res.json();
            */

            // Directly updating auth context state
            await googleLogin(result.user);
            navigate('/dashboard');
        } catch (error) {
            if (error.code === 'auth/operation-not-allowed') {
                alert('Google Sign-In is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
                console.error('Firebase Error: Google provider is disabled in the Firebase Console.');
            } else if (error.name === 'SecurityError' || error.message.includes('cross-origin')) {
                console.log('Cross-origin error occurred. This is a browser security restriction.');
            } else {
                console.log('Could not sign in with google', error);
            }
        }
    };

    return (
        <button
            onClick={handleGoogleClick}
            type='button'
            className='w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors'
        >
            <FcGoogle className='text-xl' />
            Continue with Google
        </button>
    );
}
