
import {RouterAddons, authMiddleware} from './addons';

describe('Addons API', () => {
    it('addons should respond', () => {
        expect(RouterAddons.get('/api/addons')).toBeTruthy();
        expect(RouterAddons.get('/api/cli/addons')).toBeTruthy();
        expect(RouterAddons.get('/api/addons/operators')).toBeTruthy();
    });
});

describe('Auth API', () => {
    process.env.KUBERO_USERS = "";
    it('auth should respond', () => {
        expect(authMiddleware.name).toBe('noAuthMiddleware');
    });
});