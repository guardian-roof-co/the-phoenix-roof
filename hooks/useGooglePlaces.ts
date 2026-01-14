import { useState, useEffect, useRef } from 'react';

/**
 * Custom Hook for Google Maps Places Autocomplete
 * Encapsulates the script loading check and autocomplete initialization.
 */
export const useGooglePlaces = (
    onPlaceSelected: (address: string, lat: number, lng: number) => void
) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [autocomplete, setAutocomplete] = useState<any | null>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        // Ensure proper cleanup
        let instance: google.maps.places.Autocomplete | null = null;

        const initAutocomplete = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                instance = new window.google.maps.places.Autocomplete(inputRef.current!, {
                    types: ['address'],
                    componentRestrictions: { country: 'us' }
                });

                instance.addListener('place_changed', () => {
                    const place = instance!.getPlace();
                    if (place.geometry && place.geometry.location) {
                        const address = place.formatted_address || '';
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        onPlaceSelected(address, lat, lng);
                    }
                });

                setAutocomplete(instance);
            }
        };

        // If Google script is already loaded
        if (window.google && window.google.maps) {
            initAutocomplete();
        } else {
            // Wait for script to load (simple poll fallback or window event if available)
            // Ideally your app handles script loading globally, but this is a safeguard
            const interval = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(interval);
                    initAutocomplete();
                }
            }, 500);
            return () => clearInterval(interval);
        }

    }, []);

    return { inputRef };
};
