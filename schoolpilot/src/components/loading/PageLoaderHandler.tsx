import { useState, useEffect, type ReactNode } from 'react';
import SplashScreen from './splash';
import PageLoader from './pageLoader';

interface LoadingHandlerProps {
    children: ReactNode;
    showSplash?: boolean;
    showLoader?: boolean;
    splashTime?: number;
    loaderTime?: number;
}

const LoadingHandler = ({
    children,
    showSplash = true,
    showLoader = true,
    splashTime = 2000,
    loaderTime = 5000,
}: LoadingHandlerProps) => {
    const [isSplashVisible, setIsSplashVisible] = useState(showSplash);
    const [isLoaderVisible, setIsLoaderVisible] = useState(false);

    useEffect(() => {
        if (showSplash) {
            const splashTimer = setTimeout(() => {
                setIsSplashVisible(false);
                if (showLoader) {
                    setIsLoaderVisible(true);
                    const loaderTimer = setTimeout(() => {
                        setIsLoaderVisible(false);
                    }, loaderTime);
                    return () => clearTimeout(loaderTimer);
                }
            }, splashTime);
            return () => clearTimeout(splashTimer);
        } else if (showLoader) {
            setIsLoaderVisible(true);
            const loaderTimer = setTimeout(() => {
                setIsLoaderVisible(false);
            }, loaderTime);
            return () => clearTimeout(loaderTimer);
        }
    }, [showSplash, showLoader, splashTime, loaderTime]);

    if (isSplashVisible) return <SplashScreen />;
    if (isLoaderVisible) return <PageLoader />;

    return <>{children}</>;
};

export default LoadingHandler;
export { SplashScreen, PageLoader };