<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <v-container class="pa-4">
          <div style="position: relative; display: inline-block;">
            <v-avatar size="150" class="mb-4">
              <v-img :src="user.image || defaultAvatar" alt="User avatar" />
            </v-avatar>
            <v-btn
              icon
              size="x-small"
              color="secondary"
              style="position: absolute; bottom: 8px; right: 8px; z-index: 2;"
              @click="editAvatarDialog = true"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </div>
          <h2 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h2>
          <div class="text-h5 font-weight-bold mb-2">{{ user.username }}</div>
          <div class="mb-2">{{ user.email }}</div>
          <!--<div class="text--secondary">Last login: <span v-if="user.lastLogin">{{ new Date(user.lastLogin).toLocaleString() }}</span><span v-else>-</span></div>-->

          <div class="locale-changer">
            <!--
            <select v-model="$i18n.locale">
              <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>
            </select>
            -->
            <v-select
              v-model="locale"
              :items="availableLanguages"
              item-title="name"
              item-value="code"
              variant="underlined"
              label-disabled="Select Language"
              class="mt-2"
              style="max-width: 200px;"
              density="compact"
            ></v-select>
          </div>
          <v-dialog v-model="editAvatarDialog" max-width="400px">
            <v-card>
              <v-card-title>{{ $t('profile.avatar.edit') }}</v-card-title>
              <v-card-text>
                <v-alert type="warning" density="compact" class="mb-2">
                  {{ $t('profile.avatar.limitMessage') }}
                </v-alert>
                <v-file-input
                  v-model="avatarFile"
                  :label="$t('profile.avatar.uploadAvatar')"
                  accept="image/*"
                  prepend-icon="mdi-image"
                ></v-file-input>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="editAvatarDialog = false">{{ $t('global.cancel') }}</v-btn>
                <v-btn color="primary" @click="saveAvatar">{{ $t('global.save') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </v-col>
      <v-col cols="12" md="6" lg="8">
        <v-card color="cardBackground" class="pa-4">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3>{{ $t('profile.titles.profileDetails') }}</h3>
            <div>
              <v-btn
                icon
                size="small"
                color="primary"
                @click="openEditProfileDialog"
                class="mr-2"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                color="primary"
                @click="openChangePasswordDialog"
                v-if="user.provider === 'local' || !user.provider"
              >
                <v-icon>mdi-lock-reset</v-icon>
              </v-btn>
            </div>
          </div>
          <v-table density="compact" class="profile-table">
            <tbody>
              <tr>
                <td><strong>{{ $t('user.firstName') }}</strong></td>
                <td>{{ user.firstName }}</td>
              </tr>
              <tr>
                <td><strong>{{ $t('user.lastName') }}</strong></td>
                <td>{{ user.lastName }}</td>
              </tr>
              <tr>
                <td><strong>{{ $t('user.email') }}</strong></td>
                <td>{{ user.email }}</td>
              </tr>
              <tr>
                <td><strong>{{ $t('user.username') }}</strong></td>
                <td>{{ user.username }}</td>
              </tr>
              <tr>
                <td><strong>{{ $t('user.role') }}</strong></td>
                <td>
                  <v-chip class="ma-2" color="primary" label v-if="user.role">
                    <v-icon icon="mdi-account-circle-outline" start></v-icon>
                    {{ user.role.name }}
                  </v-chip>
                  <span v-else>-</span>
                </td>
              </tr>
              <tr>
                <td><strong>{{ $t('user.teams') }}</strong></td>
                <td>
                  <v-chip v-for="group in user.userGroups" :key="group.id" class="ma-1" color="grey" prepend-icon="mdi-account-group">{{ group.name }}</v-chip>
                  <span v-if="!user.userGroups || user.userGroups.length === 0">-</span>
                </td>
              </tr>
              <tr>
                <td><strong>{{ $t('user.provider') }}</strong></td>
                <td>{{ user.provider || 'local' }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-dialog v-model="editProfileDialog" max-width="500px">
            <v-card>
              <v-card-title>{{ $t('profile.actions.editProfile') }}</v-card-title>
              <v-card-text>
                <v-alert
                  v-show="profileError"
                  type="warning"
                  border="start"
                  class="mb-3"
                  :class="{ 'shaking': profileErrorShake }"
                >
                  {{ profileErrorMessage }}
                </v-alert>
                <v-text-field
                  v-model="editedUser.firstName"
                  :label="$t('user.firstName')"
                  :rules="[v => !!v || $t('user.errors.firstNameRequired')]"
                ></v-text-field>
                <v-text-field
                  v-model="editedUser.lastName"
                  :label="$t('user.lastName')"
                  :rules="[v => !!v || $t('user.errors.lastNameRequired')]"
                ></v-text-field>
                <v-text-field
                  v-model="editedUser.email"
                  :label="$t('user.email')"
                  type="email"
                  :rules="[
                    v => !!v || $t('user.errors.emailRequired'),
                    v => /.+@.+\..+/.test(v) || $t('user.errors.emailValid')
                  ]"
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="editProfileDialog = false">{{ $t('global.cancel') }}</v-btn>
                <v-btn color="primary" @click="saveProfile">{{ $t('global.save') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="changePasswordDialog" max-width="500px">
            <v-card>
              <v-card-title>{{ $t('user.changePassword') }}</v-card-title>
              <v-card-text>
                <v-alert
                  v-show="passwordError"
                  type="warning"
                  border="start"
                  class="mb-3"
                  :class="{ 'shaking': passwordErrorShake }"
                >
                  {{ passwordErrorMessage }}
                </v-alert>
                <v-text-field
                  v-model="passwordForm.currentPassword"
                  :label="$t('user.currentPassword')"
                  type="password"
                  :rules="[v => !!v || $t('user.errors.currentPasswordRequired')]"
                  class="mb-2"
                ></v-text-field>
                <v-text-field
                  v-model="passwordForm.newPassword"
                  :label="$t('user.newPassword')"
                  type="password"
                  :rules="[
                    v => !!v || $t('user.errors.newPasswordRequired'),
                    v => v.length >= 8 || $t('user.errors.passwordMinLength')
                  ]"
                  class="mb-2"
                ></v-text-field>
                <v-text-field
                  v-model="passwordForm.confirmPassword"
                  :label="$t('user.confirmPassword')"
                  type="password"
                  :rules="[
                    v => !!v || $t('user.errors.passwordConfirm'),
                    v => v === passwordForm.newPassword || $t('user.errors.passwordMismatch')
                  ]"
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="changePasswordDialog = false">{{ $t('global.cancel') }}</v-btn>
                <v-btn color="primary" @click="savePassword">{{ $t('user.changePassword') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-6" >
      <v-col cols="12">
        <v-card color="cardBackground" class="pa-4">
          <h3 class="mb-4">API Tokens</h3>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
            <v-btn
              fab
              color="primary"
              style="margin-right: 6px;"
              @click="openCreateDialog"
              :disabled="!authStore.hasPermission('token:ok') && !authStore.hasPermission('token:write')"
            >
              <v-icon>mdi-plus</v-icon>
              <span class="sr-only">{{ $t('profile.token.create') }}</span>
            </v-btn>
          </div>
          <v-table density="compact" class="profile-table">
            <thead>
              <tr>
                <th>{{ $t('global.name') }}</th>
                <th>{{ $t('profile.token.expiresAt') }}</th>
                <th class="text-end">{{ $t('user.actions.name') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in tokens" :key="token.id">
                <td>{{ token.name }}</td>
                <td>{{ token.expiresAt ? new Date(token.expiresAt).toLocaleString() : '-' }}</td>
                <td class="text-end">
                  <v-btn
                    elevation="0"
                    variant="tonal"
                    size="small"
                    class="ma-2"
                    @click="deleteToken(token)"
                    :disabled="!authStore.hasPermission('token:ok') && !authStore.hasPermission('token:write')"
                  >
                    <v-icon color="primary">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr v-if="tokens.length === 0">
                <td colspan="3" class="text-center">{{ $t('profile.token.noTokens') }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-dialog v-model="createDialog" max-width="500px">
            <v-card>
              <v-card-title>{{ $t('profile.token.create') }}</v-card-title>
              <v-card-text>
                <v-text-field v-model="newToken.name" :label="$t('global.name')"></v-text-field>
                <v-text-field
                  v-model="newToken.expiresAt"
                  :label="$t('profile.token.expiresAt')"
                  type="datetime-local"
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="createDialog = false">{{ $t('global.abort') }}</v-btn>
                <v-btn color="primary" @click="saveCreate">{{ $t('global.create') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="tokenDialog" max-width="500px">
            <v-card>
              <v-card-title>{{ $t('profile.token.details') }}</v-card-title>
              <v-card-text>
                <v-alert type="warning" density="compact" class="mb-2" v-html="$t('profile.token.warningMessage')">
                </v-alert>
                <v-textarea
                  v-model="generatedToken.token"
                  label="Token"
                  auto-grow
                  readonly
                  rows="3"
                  class="mb-2"
                  :class="{ 'flash': textareaFlash }"
                ></v-textarea>
                <v-btn
                  color="primary"
                  @click="copyToken"
                  class="mb-2"
                >
                  <v-icon left>mdi-content-copy</v-icon>
                  {{ $t('profile.token.copyToken') }}
                </v-btn>
                <v-snackbar v-model="textareaFlash" timeout="3000">
                  {{ $t('profile.token.copiedMessage') }}
                  <template #actions>
                    <v-btn text @click="textareaFlash = false">
                      {{ $t('profile.token.close') }}
                    </v-btn>
                  </template>
                </v-snackbar>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="tokenDialog = false">{{ $t('profile.token.close') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
const authStore = useAuthStore();

export default defineComponent({
  name: 'ProfilePage',
  setup() {
    const { locale, t } = useI18n()

    
    const availableLanguages = ref([
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      //{ code: 'es', name: 'Español' },
      //{ code: 'fr', name: 'Français' },
      { code: 'de-CH', name: 'Schwizerdütsch' },
      { code: 'ja', name: '日本語' },
      { code: 'zhHans', name: '简体中文' },
      { code: 'pt', name: 'Português' },
    ])
    
    const user = ref<any>({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      image: '',
      role: null,
      userGroups: [],
      provider: '',
      lastLogin: null,
    })
    const defaultAvatar = '/img/icons/avatar.svg'
    const tokens = ref<any[]>([])
    const editAvatarDialog = ref(false)
    const avatarFile = ref<File | null>(null)
    const editProfileDialog = ref(false)
    const editedUser = ref<any>({ firstName: '', lastName: '', email: '' })
    const changePasswordDialog = ref(false)
    const passwordForm = ref<any>({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const profileError = ref(false)
    const profileErrorMessage = ref('')
    const profileErrorShake = ref(false)
    const passwordError = ref(false)
    const passwordErrorMessage = ref('')
    const passwordErrorShake = ref(false)
    const createDialog = ref(false)
    const tokenDialog = ref(false)
    const generatedToken = ref<any>({ name: '', expiresAt: '', token: '' })
    const newToken = ref<any>({ name: '', expiresAt: '' })
    const textareaFlash = ref(false)

    const loadProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile')
        user.value = res.data
      } catch (e) {
        // fallback or error handling
      }
    }

    const loadTokens = async () => {
      if (!authStore.hasPermission('token:ok') && !authStore.hasPermission('token:write')) {
        tokens.value = []
        return
      }
      
      try {
        const res = await axios.get('/api/tokens/my')
        tokens.value = res.data 
      } catch (e) {
        tokens.value = []
      }
    }

    const deleteToken = async (token: any) => {
      try {
        await axios.delete(`/api/tokens/my/${token.id}`)
        await loadTokens()
      } catch (e) {
        // error handling
      }
    }

    const saveAvatar = async () => {
      if (!avatarFile.value) return
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)
      try {
        await axios.post('/api/users/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        editAvatarDialog.value = false
        await loadProfile()
      } catch (e) {
        // error handling
      }
    }

    const openEditProfileDialog = () => {
      editedUser.value = {
        firstName: user.value.firstName,
        lastName: user.value.lastName,
        email: user.value.email
      }
      profileError.value = false
      editProfileDialog.value = true
    }

    const saveProfile = async () => {
      try {
        await axios.put('/api/users/profile', editedUser.value)
        editProfileDialog.value = false
        profileError.value = false
        await loadProfile()
      } catch (e: any) {
        profileError.value = true
        profileErrorMessage.value = e.response?.data?.message || 'Failed to update profile'
        profileErrorShake.value = true
        setTimeout(() => {
          profileErrorShake.value = false
        }, 300)
      }
    }

    const openChangePasswordDialog = () => {
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      passwordError.value = false
      changePasswordDialog.value = true
    }

    const savePassword = async () => {
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        return // validation will handle this
      }
      
      try {
        await axios.put('/api/users/profile/password', {
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        })
        changePasswordDialog.value = false
        passwordError.value = false
        passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      } catch (e: any) {
        passwordError.value = true
        passwordErrorMessage.value = e.response?.data?.message || 'Failed to change password'
        passwordErrorShake.value = true
        setTimeout(() => {
          passwordErrorShake.value = false
        }, 300)
      }
    }

    const openCreateDialog = () => {
      newToken.value = { name: '', expiresAt: '', token: '' }
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        const response = await axios.post('/api/tokens/my', newToken.value)
        generatedToken.value = response.data
        await loadTokens()
        createDialog.value = false
        tokenDialog.value = true
        //console.log('Token created:', newToken)
      } catch (e) {
        // error handling
      }
    }

    const copyToken = () => {
      if (generatedToken.value.token) {
        navigator.clipboard.writeText(generatedToken.value.token)
        textareaFlash.value = true
        setTimeout(() => {
          textareaFlash.value = false
        }, 300)
      }
    }

    // Watch for locale changes and save to localStorage
    watch(locale, (newLocale) => {
      localStorage.setItem('kubero.locale', newLocale)
    })

    onMounted(() => {
      loadProfile()
      loadTokens()
    })

    return {
      locale,
      availableLanguages,
      user,
      defaultAvatar,
      tokens,
      deleteToken,
      editAvatarDialog,
      avatarFile,
      saveAvatar,
      editProfileDialog,
      editedUser,
      openEditProfileDialog,
      saveProfile,
      changePasswordDialog,
      passwordForm,
      openChangePasswordDialog,
      savePassword,
      createDialog,
      tokenDialog,
      generatedToken,
      newToken,
      openCreateDialog,
      saveCreate,
      copyToken,
      textareaFlash,
      authStore,
      profileError,
      profileErrorMessage,
      profileErrorShake,
      passwordError,
      passwordErrorMessage,
      passwordErrorShake,
    }
  },
})
</script>

<style scoped>
/* https://unused-css.com/blog/css-shake-animation/ */
@keyframes horizontal-shaking {
 0% { transform: translateX(0) }
 25% { transform: translateX(5px) }
 50% { transform: translateX(-5px) }
 75% { transform: translateX(5px) }
 100% { transform: translateX(0) }
}
.shaking {
    animation: horizontal-shaking 0.3s ease-in-out;
}

.flash {
  animation: flash-animation 3s ease-in-out;
}

@keyframes flash-animation {
  0% { background-color: rgba(255, 255, 0, 0.3); }
  100% { background-color: transparent; }
}

.profile-table {
  background-color: inherit;
}
</style>
