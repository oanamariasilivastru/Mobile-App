import { useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

export const usePreferences = () => {
    useEffect(() => {
        runPreferencesDemo();
    }, []);

    async function set(key: string, value: string) {
        await Preferences.set({ key, value });
    }

    async function get(key: string) {
        const res = await Preferences.get({ key });
        return res.value;
    }

    async function remove(key: string) {
        await Preferences.remove({ key });
    }

    async function clear() {
        await Preferences.clear();
    }

    function runPreferencesDemo() {
        (async () => {
            await set('user', JSON.stringify({ username: 'a', password: 'a' }));
            const user = await get('user');
            console.log(user ? JSON.parse(user) : 'User not found');
            await remove('user');
            await clear();
        })();
    }

    return { set, get, remove, clear };
};
