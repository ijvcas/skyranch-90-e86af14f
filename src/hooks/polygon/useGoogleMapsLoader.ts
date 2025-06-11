
interface GoogleMapsLoaderState {
  isAPILoaded: boolean;
  isAPILoading: boolean;
  loadingCallbacks: (() => void)[];
}

const loaderState: GoogleMapsLoaderState = {
  isAPILoaded: false,
  isAPILoading: false,
  loadingCallbacks: []
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (loaderState.isAPILoaded && window.google?.maps?.drawing) {
      resolve();
      return;
    }

    if (loaderState.isAPILoading) {
      loaderState.loadingCallbacks.push(resolve);
      return;
    }

    loaderState.isAPILoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing&callback=initSimpleDrawing`;
    script.async = true;
    
    (window as any).initSimpleDrawing = () => {
      console.log('Google Maps Drawing API loaded successfully');
      loaderState.isAPILoaded = true;
      loaderState.isAPILoading = false;
      resolve();
      loaderState.loadingCallbacks.forEach(cb => cb());
      loaderState.loadingCallbacks.length = 0;
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      loaderState.isAPILoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};
