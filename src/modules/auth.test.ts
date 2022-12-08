import {Auth} from './auth';

describe('Auth', () => {
    it('requires no authentication', () => {
        process.env.KUBERO_USERS = "";
        const auth = new Auth();
        auth.init();
        expect(auth.getAuthMiddleware().name).toBe('noAuthMiddleware');
        expect(auth.getBearerMiddleware().name).toBe('authenticate');
    });

    it('requires authentication', () => {
        process.env.KUBERO_USERS = 'WwogIHsKICAgICJpZCI6IDEsCiAgICAibWV0aG9kIjogImxvY2FsIiwKICAgICJ1c2VybmFtZSI6ICJhc2RmIiwKICAgICJwYXNzd29yZCI6ICI4YTg0MjNiYTc4YzhmM2RhNjBhNjAyNDkzNjYzYzFjZGMyNDhhODk1NDFiMTI5ODBlMjkyMzk5YzBmMGNhZDIxIiwKICAgICJpbnNlY3VyZSI6IGZhbHNlCiAgfSwKICB7CiAgICAiaWQiOiAyLAogICAgIm1ldGhvZCI6ICJsb2NhbCIsCiAgICAidXNlcm5hbWUiOiAicXdlciIsCiAgICAicGFzc3dvcmQiOiAicXdlciIsCiAgICAiaW5zZWN1cmUiOiB0cnVlCiAgfQpd';
        const auth = new Auth();
        auth.init();
        expect(auth.getAuthMiddleware().name).toBe('authMiddleware');
        expect(auth.getBearerMiddleware().name).toBe('authenticate');
    });
});