// src/serviceWorkerRegistration.ts
export function register() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `/schoolpilot/sw.js`;
            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log('Service Worker registered: ', registration);
                })
                .catch((error) => {
                    console.log('Service Worker registration failed: ', error);
                });
        });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}