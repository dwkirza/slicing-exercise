<template>
  <div class="p-4 min-h-screen bg-gray-50 overflow-auto lg:max-h-screen lg:overflow-y-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <h1 class="text-xl sm:text-2xl font-semibold">
        Hello <span class="capitalize">{{ store.username ?? 'Guest' }}</span>
      </h1>
      <a-button type="primary" danger @click="handleLogout">Logout</a-button>
    </div>

    <!-- Content -->
    <a-card>
      <div v-if="isLoadingUsers || isLoadingUser || !store.idUser">Loading...</div>
      <div v-else-if="error">Error: {{ error.message }}</div>
      <div v-else>
        <a-tabs v-model:activeKey="activeTab">
          <!-- Basic -->
          <a-tab-pane key="basic" tab="Basic Details">
            <div class="flex flex-col md:flex-row items-center gap-6 w-full">
              <img
                :src="editableUser.profileImage"
                class="w-32 h-32 rounded-full border object-cover"
                alt="Profile Image"
              />
              <div class="flex-1 space-y-2">
                <a-form layout="vertical">
                  <a-form-item label="Salutation">
                    <a-select v-model:value="editableUser.salutation" :disabled="!isEditable">
                      <a-select-option value="Mr.">Mr.</a-select-option>
                      <a-select-option value="Ms.">Ms.</a-select-option>
                      <a-select-option value="Mrs.">Mrs.</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="First Name">
                    <a-input v-model:value="editableUser.firstName" :disabled="!isEditable" />
                  </a-form-item>
                  <a-form-item label="Last Name">
                    <a-input v-model:value="editableUser.lastName" :disabled="!isEditable" />
                  </a-form-item>
                  <a-form-item label="Email">
                    <a-input v-model:value="editableUser.email" :disabled="!isEditable" />
                  </a-form-item>
                </a-form>
              </div>
            </div>
          </a-tab-pane>

          <!-- Additional -->
          <a-tab-pane key="additional" tab="Additional Details">
            <a-form layout="vertical">
              <a-form-item label="Address">
                <a-input v-model:value="editableUser.address" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Country">
                <a-input v-model:value="editableUser.country" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Postal Code">
                <a-input v-model:value="editableUser.postalCode" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Date of Birth">
                <a-date-picker v-model:value="editableUser.dateOfBirth" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Gender">
                <a-select v-model:value="editableUser.gender" :disabled="!isEditable">
                  <a-select-option value="male">Male</a-select-option>
                  <a-select-option value="female">Female</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="Marital Status">
                <a-select
                  v-model:value="editableUser.maritalStatus"
                  :disabled="!isEditable"
                  @change="onMaritalChange"
                >
                  <a-select-option value="Single">Single</a-select-option>
                  <a-select-option value="Married">Married</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- Spouse -->
          <a-tab-pane
            v-if="editableUser.maritalStatus === 'Married'"
            key="spouse"
            tab="Spouse Details"
          >
            <a-form layout="vertical">
              <a-form-item label="Spouse Salutation">
                <a-select v-model:value="editableUser.spouseSalutation" :disabled="!isEditable">
                  <a-select-option value="Mr.">Mr.</a-select-option>
                  <a-select-option value="Ms.">Ms.</a-select-option>
                  <a-select-option value="Mrs.">Mrs.</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="Spouse First Name">
                <a-input v-model:value="editableUser.spouseFirstName" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Spouse Last Name">
                <a-input v-model:value="editableUser.spouseLastName" :disabled="!isEditable" />
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- Company -->
          <a-tab-pane key="company" tab="Company">
            <a-form layout="vertical">
              <a-form-item label="Company Name">
                <a-input v-model:value="editableUser.companyName" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Department">
                <a-input v-model:value="editableUser.department" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Position">
                <a-input v-model:value="editableUser.position" :disabled="!isEditable" />
              </a-form-item>
              <a-form-item label="Work Email">
                <a-input v-model:value="editableUser.workEmail" :disabled="!isEditable" />
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>

        <!-- Save / Edit Buttons -->
        <div class="mt-6 text-right space-x-2">
          <a-button v-if="!isEditable" @click="enableEdit">Edit</a-button>
          <a-button v-else type="primary" @click="saveProfile">Save & Update</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { message } from 'ant-design-vue'
import { useFilter } from '@/stores/counter'

const router = useRouter()
const store = useFilter()

const isEditable = ref(false)
const activeTab = ref('basic')
const enableEdit = () => (isEditable.value = true)

const editableUser = ref({
  profileImage: '',
  salutation: '',
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  country: '',
  postalCode: '',
  dateOfBirth: null,
  gender: '',
  maritalStatus: '',
  spouseSalutation: '',
  spouseFirstName: '',
  spouseLastName: '',
  companyName: '',
  department: '',
  position: '',
  workEmail: '',
})

// 1. Fetch all users
const { data: usersData, isLoading: isLoadingUsers } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const res = await axios.get('https://dummyjson.com/users')
    return res.data.users
  },
})

// 2. Set ID user berdasarkan username dari store
watchEffect(() => {
  const users = usersData.value
  const username = store.username
  if (users && username && !store.idUser) {
    const found = users.find((u) => u.username === username)
    if (found) {
      store.idUser = found.id
    }
  }
})

// 3. Fetch user detail by ID
const {
  data: userData,
  isLoading: isLoadingUser,
  error,
} = useQuery({
  queryKey: ['userById', store.idUser],
  queryFn: async () => {
    const res = await axios.get(`https://dummyjson.com/users/${store.idUser}`)
    return res.data
  },
  enabled: () => !!store.idUser,
})

// 4. Populate form
watch(userData, (u) => {
  if (u) {
    editableUser.value = {
      profileImage: u.image,
      salutation: u.gender === 'male' ? 'Mr.' : 'Ms.',
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      address: u.address?.address || '',
      country: u.address?.city || '',
      postalCode: u.address?.postalCode || '',
      dateOfBirth: dayjs().subtract(u.age, 'year'),
      gender: u.gender,
      maritalStatus: 'Single',
      spouseSalutation: '',
      spouseFirstName: '',
      spouseLastName: '',
      companyName: u.company?.name || '',
      department: '',
      position: '',
      workEmail: '',
    }
  }
})

// 5. Save profile
const saveProfile = async () => {
  try {
    await axios.put(`https://dummyjson.com/users/${store.idUser}`, editableUser.value)
    message.success('Profile updated successfully', 2)
    isEditable.value = false
  } catch (e) {
    console.error('Save failed:', e)
    message.error('Failed to update profile', 2)
  }
}

// 6. Logout
const handleLogout = () => {
  store.username = null
  store.idUser = null
  Cookies.remove('authToken')
  localStorage.removeItem('user')
  message.success('Logged out successfully', 2)
  router.push('/login')
}

const onMaritalChange = (val) => {
  if (val !== 'Married') {
    editableUser.value.spouseSalutation = ''
    editableUser.value.spouseFirstName = ''
    editableUser.value.spouseLastName = ''
  }
}
</script>
