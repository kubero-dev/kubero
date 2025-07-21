<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="12" lg="12" xl="6">
        <v-expansion-panels multiple elevation="0" class="mb-6">
          <v-expansion-panel>
          <v-expansion-panel-title class="text-h6 font-weight-bold">
            {{ $t('notifications.helpTitle') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-html="$t('notifications.helpText')"></div>
          </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="notifications"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      item-value="name"
      :search="search"
      show-expand
    >
      <template v-slot:[`item.name`]="{ item }">
        <span>{{ item.name }}</span>
      </template>
      <template v-slot:[`item.type`]="{ item }">
        <v-chip :color="getTypeColor(item.type)" size="small" variant="tonal">
          <v-icon start :icon="getTypeIcon(item.type)"></v-icon>
          {{ item.type }}
        </v-chip>
      </template>
      <template v-slot:[`item.enabled`]="{ item }">
        <v-switch
          v-model="item.enabled"
          @change="toggleEnabled(item)"
          color="primary"
          hide-details
        ></v-switch>
      </template>
      <template v-slot:[`item.pipelines`]="{ item }">
        <v-chip-group>
          <v-chip
            v-for="pipeline in item.pipelines"
            :key="pipeline"
            size="x-small"
          >
            {{ pipeline }}
          </v-chip>
        </v-chip-group>
      </template>
      <template v-slot:[`item.events`]="{ item }">
        <v-chip-group>
          <v-chip
            v-for="event in item.events"
            :key="event"
            size="x-small"
          >
            {{ event }}
          </v-chip>
        </v-chip-group>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn elevation="0" variant="tonal" size="small" class="ma-2" @click="openEditDialog(item)">
          <v-icon color="primary">mdi-pencil</v-icon>
        </v-btn>
        <v-btn elevation="0" variant="tonal" size="small" class="ma-2" @click="deleteNotification(item)">
          <v-icon color="primary">mdi-delete</v-icon>  
        </v-btn>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" style="padding:0;">
            <v-card class="ma-2 pa-2" outlined color="cardBackground">
              <v-row>
                <v-col cols="12" md="6">
                  <v-list density="compact" style="background: inherit;">
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">{{$t('notifications.form.config')}}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="item.config.url">
                      <v-list-item-subtitle>{{$t('notifications.form.url')}}</v-list-item-subtitle>
                      <v-list-item-title class="text-truncate" style="max-width: 300px;">{{ item.config.url }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="item.config.channel">
                      <v-list-item-subtitle>{{$t('notifications.form.channel')}}</v-list-item-subtitle>
                      <v-list-item-title>{{ item.config.channel }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="item.config.secret">
                      <v-list-item-subtitle>{{$t('notifications.form.secret')}}</v-list-item-subtitle>
                      <v-list-item-title>***hidden***</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact" style="background: inherit;">
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">{{$t('notifications.form.pipelines')}}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-chip-group>
                        <v-chip
                          v-for="pipeline in item.pipelines"
                          :key="pipeline"
                          size="small"
                        >
                          {{ pipeline }}
                        </v-chip>
                      </v-chip-group>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">{{$t('notifications.form.events')}}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-chip-group>
                        <v-chip
                          v-for="event in item.events"
                          :key="event"
                          size="small"
                        >
                          {{ event }}
                        </v-chip>
                      </v-chip-group>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card>
          </td>
        </tr>
      </template>
    </v-data-table>
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <v-btn fab color="primary" style="margin-right: 6px;" @click="openCreateDialog">
        <v-icon>mdi-plus</v-icon>
        <span class="sr-only">{{ $t('notifications.actions.create') }}</span>
      </v-btn>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="800px">
      <v-card>
        <v-card-title>{{$t('notifications.actions.edit')}}</v-card-title>
        <v-card-text v-if="editedNotification">
          <v-form ref="editForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedNotification.name"
                  :label="$t('notifications.form.name')"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedNotification.type"
                  :items="notificationTypes"
                  :label="$t('notifications.form.type')"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="editedNotification.enabled"
                  :label="$t('notifications.form.enabled')"
                  color="primary"
                ></v-switch>
              </v-col>
              
              <!-- Type-specific configuration -->
              <v-col cols="12" v-if="editedNotification.type === 'slack'">
                <v-text-field
                  v-model="editedNotification.config.url"
                  :label="$t('notifications.form.slackWebhookUrl')"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedNotification.config.channel"
                  :label="$t('notifications.form.channel')"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" v-if="editedNotification.type === 'discord'">
                <v-text-field
                  v-model="editedNotification.config.url"
                  :label="$t('notifications.form.discordWebhookUrl')"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" v-if="editedNotification.type === 'webhook'">
                <v-text-field
                  v-model="editedNotification.config.url"
                  :label="$t('notifications.form.webhookUrl')"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedNotification.config.secret"
                  :label="$t('notifications.form.secret')"
                  type="password"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="editedNotification.pipelines"
                  :label="$t('notifications.form.pipelines')"
                  multiple
                  chips
                  clearable
                  :hint="$t('notifications.form.pipelinesHint')"
                ></v-combobox>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="editedNotification.events"
                  :label="$t('notifications.form.events')"
                  multiple
                  chips
                  clearable
                  :hint="$t('notifications.form.eventsHint')"
                ></v-combobox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-text v-else>
          <v-alert type="error" dismissible>
            {{$t('notifications.errors.edit')}}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">{{$t('global.cancel')}}</v-btn>
          <v-btn color="primary" @click="saveEdit">{{$t('global.save')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Dialog -->
    <v-dialog v-model="createDialog" max-width="800px">
      <v-card>
        <v-card-title>{{$t('notifications.actions.create')}}</v-card-title>
        <v-card-text>
          <v-form ref="createForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newNotification.name"
                  :label="$t('notifications.form.name')"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newNotification.type"
                  :items="notificationTypes"
                  :label="$t('notifications.form.type')"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="newNotification.enabled"
                  :label="$t('notifications.form.enabled')"
                  color="primary"
                ></v-switch>
              </v-col>
              
              <!-- Type-specific configuration -->
              <v-col cols="12" v-if="newNotification.type === 'slack'">
                <v-text-field
                  v-model="newNotification.config.url"
                  :label="$t('notifications.form.slackWebhookUrl')"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newNotification.config.channel"
                  :label="$t('notifications.form.channel')"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" v-if="newNotification.type === 'discord'">
                <v-text-field
                  v-model="newNotification.config.url"
                  :label="$t('notifications.form.discordWebhookUrl')"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" v-if="newNotification.type === 'webhook'">
                <v-text-field
                  v-model="newNotification.config.url"
                  :label="$t('notifications.form.webhookUrl')"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newNotification.config.secret"
                  :label="$t('notifications.form.secret')"
                  type="password"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="newNotification.pipelines"
                  :items="availablePipelines"
                  :label="$t('notifications.form.pipelines')"
                  multiple
                  chips
                  clearable
                  :hint="$t('notifications.form.pipelinesHint')"
                ></v-combobox>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="newNotification.events"
                  :items="availableEvents"
                  :label="$t('notifications.form.events')"
                  multiple
                  chips
                  clearable
                  :hint="$t('notifications.form.eventsHint')"
                ></v-combobox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createDialog = false">{{$t('global.cancel')}}</v-btn>
          <v-btn color="primary" @click="saveCreate">{{$t('global.create')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'NotificationsList',
  setup() {
    const { t } = useI18n() 
    type NotificationConfig = {
      url?: string
      secret?: string
      channel?: string
    }

    type Notification = {
      id?: string
      name: string
      enabled: boolean
      type: 'slack' | 'webhook' | 'discord'
      pipelines: string[]
      events: string[]
      config: NotificationConfig
    }

    const notifications = ref<Notification[]>([])
    const loading = ref(false)
    const search = ref('')
    const editDialog = ref(false)
    const createDialog = ref(false)
    const editedNotification = ref<Notification | null>(null)
    const newNotification = ref<Notification>({
      name: '',
      enabled: true,
      type: 'slack',
      pipelines: [],
      events: [],
      config: {},
    })

    const availablePipelines = ['all'] as string[]
    const availableEvents = [
                'updatePipeline',
                'deletePipeline',
                'newPipeline',
                'newApp',
                'updateApp',
                'deleteApp',
                'restartApp',
                'rebuildApp',
                'deployApp',
                'updateSettings',
                'handleWebhookPush',
            ]

    const notificationTypes = [
      { title: 'Slack', value: 'slack' },
      { title: 'Discord', value: 'discord' },
      { title: 'Webhook', value: 'webhook' },
    ]

    const headers = [
      { title: t('notifications.form.name'), value: 'name' },
      { title: t('notifications.form.type'), value: 'type' },
      { title: t('notifications.form.enabled'), value: 'enabled' },
      { title: t('notifications.form.pipelines'), value: 'pipelines' },
      { title: t('notifications.form.events'), value: 'events' },
      { title: '', value: 'actions', sortable: false, align: 'end' as const },
    ]

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'slack': return 'purple'
        case 'discord': return 'indigo'
        case 'webhook': return 'blue'
        default: return 'grey'
      }
    }

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'slack': return 'mdi-slack'
        case 'discord': return 'mdi-discord'
        case 'webhook': return 'mdi-webhook'
        default: return 'mdi-bell'
      }
    }

    const loadNotifications = async () => {
      loading.value = true
      try {
        const res = await axios.get('/api/notifications')
        notifications.value = res.data.data || res.data || []
      } catch (e) {
        console.error('Error loading notifications:', e)
        notifications.value = []
      }
      loading.value = false
    }

    const toggleEnabled = async (notification: Notification) => {
      try {
        await axios.put(`/api/notifications/${notification.id}`, {
          enabled: notification.enabled,
        })
        await loadNotifications()
      } catch (e) {
        console.error('Error toggling notification:', e)
        // Revert the change on error
        notification.enabled = !notification.enabled
      }
    }

    const openEditDialog = (notification: Notification) => {
      editedNotification.value = JSON.parse(JSON.stringify(notification))
      editDialog.value = true
    }

    const saveEdit = async () => {
      try {
        await axios.put(`/api/notifications/${editedNotification.value?.id}`, editedNotification.value)
        await loadNotifications()
        editDialog.value = false
      } catch (e) {
        console.error('Error saving notification:', e)
      }
    }

    const deleteNotification = async (notification: Notification) => {
      if (confirm(`Are you sure you want to delete the notification "${notification.name}"?`)) {
        try {
          await axios.delete(`/api/notifications/${notification.id}`)
          await loadNotifications()
        } catch (e) {
          console.error('Error deleting notification:', e)
        }
      }
    }

    const openCreateDialog = () => {
      newNotification.value = {
        name: '',
        enabled: true,
        type: 'slack',
        pipelines: [],
        events: [],
        config: {},
      }
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        const payload = JSON.parse(JSON.stringify(newNotification.value))
        delete payload.id
        await axios.post('/api/notifications', payload)
        await loadNotifications()
        createDialog.value = false
      } catch (e) {
        console.error('Error creating notification:', e)
      }
    }

    const loadPipelinesList = async () => {
        const self = this;
        const response = await axios.get(`/api/pipelines`)
        .catch(error => {
            console.log(error);
        });
        if (!response) return;
        response.data.items.forEach((item: any) => {
            availablePipelines.push(item.name);
        });
    }

    onMounted(() => {
      loadNotifications()
      loadPipelinesList()
    })

    return {
      notifications,
      headers,
      loading,
      search,
      notificationTypes,
      getTypeColor,
      getTypeIcon,
      toggleEnabled,
      openEditDialog,
      deleteNotification,
      editDialog,
      editedNotification,
      saveEdit,
      createDialog,
      newNotification,
      openCreateDialog,
      saveCreate,
      availablePipelines,
      availableEvents,
    }
  },
})
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
