// stores/authStore.ts
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  userId: string
  username: string
  permissions: string[]
  exp: number
  [key: string]: any
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    permissions: [] as string[],
    userId: '' as string,
    username: '' as string,
    userGroups: [] as string[],
  }),

  actions: {
    loadToken(token: string) {
      this.token = token
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        this.permissions = decoded.permissions || []
        this.userId = decoded.userId
        this.username = decoded.username || ''
        this.userGroups = decoded.userGroups || []
      } catch (e) {
        console.error('Failed to decode JWT Token', e)
        this.reset()
      }
    },

    reset() {
      this.token = ''
      this.permissions = []
      this.userId = ''
    },
  },
  getters: {
    hasPermission: (state) => (perm: string) => state.permissions.includes(perm),
  },

})
