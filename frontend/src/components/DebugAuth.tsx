import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
    const { user, verifyAuth } = useAuth();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const token = sessionStorage.getItem("token");
                const userData = sessionStorage.getItem("user");
                
                setDebugInfo({
                    token: token ? "Token exists" : "No token",
                    userData: userData ? JSON.parse(userData) : "No user data",
                    currentUser: user,
                    sessionStorage: {
                        token: sessionStorage.getItem("token"),
                        user: sessionStorage.getItem("user")
                    }
                });

                const isVerified = await verifyAuth();
                setDebugInfo(prev => ({
                    ...prev,
                    verificationStatus: isVerified ? "Verified" : "Not Verified"
                }));
            } catch (error) {
                setDebugInfo(prev => ({
                    ...prev,
                    error: error instanceof Error ? error.message : "Unknown error"
                }));
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [user, verifyAuth]);

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Authentication Debug Info</h2>
            {isLoading ? (
                <p>Loading debug information...</p>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Current User:</h3>
                        <pre className="bg-white p-2 rounded">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <h3 className="font-semibold">Session Storage:</h3>
                        <pre className="bg-white p-2 rounded">
                            {JSON.stringify(debugInfo.sessionStorage, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <h3 className="font-semibold">Verification Status:</h3>
                        <p className="bg-white p-2 rounded">
                            {debugInfo.verificationStatus}
                        </p>
                    </div>
                    {debugInfo.error && (
                        <div>
                            <h3 className="font-semibold text-red-600">Error:</h3>
                            <p className="bg-white p-2 rounded text-red-600">
                                {debugInfo.error}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DebugAuth; 