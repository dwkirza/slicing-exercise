<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <a-card class="w-full max-w-md shadow-lg">
      <Form
        :validation-schema="schema"
        :initial-values="{ rememberMe: false }"
        @submit="handleLogin"
        v-slot="{ meta = {} }"
      >
        <!-- Username -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Username*</label>
          <Field name="username" v-slot="{ field, errorMessage }">
            <a-input v-bind="field" placeholder="Enter username" />
            <span class="text-red-500 text-xs">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Password*</label>
          <Field name="password" v-slot="{ field, errorMessage }">
            <a-input-password v-bind="field" placeholder="Enter password" />
            <span class="text-red-500 text-xs">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Remember Me -->
        <div class="flex items-center gap-2 mb-4">
          <Field name="rememberMe" v-slot="{ value, setValue }">
            <a-checkbox :checked="!!value" @change="(e) => setValue(e.target.checked)">
              Keep me logged in
            </a-checkbox>
          </Field>
        </div>

        <!-- Submit -->
        <div class="text-right">
          <a-button
            type="primary"
            html-type="submit"
            :disabled="isPending"
            :loading="isPending"
            block
          >
            LOGIN
          </a-button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p class="text-sm text-red-600">{{ error.message }}</p>
        </div>

        <!-- Test users -->
        <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm">
          <p class="font-medium text-blue-800">Test Users:</p>
          <ul class="text-blue-700 list-disc ml-5 text-xs mt-1 space-y-1">
            <li>Username: <strong>emilys</strong> / Password: <strong>emilyspass</strong></li>
            <li>Username: <strong>michaelw</strong> / Password: <strong>michaelwpass</strong></li>
          </ul>
        </div>

        <!-- Register link -->
        <div class="mt-4 text-center text-sm">
          No account?
          <router-link to="/register" class="text-blue-600 hover:underline ml-1">
            Register here.
          </router-link>
        </div>
      </Form>
    </a-card>
  </div>
</template>

<script setup>
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'
import { ref } from 'vue'
import Cookies from 'js-cookie'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { useFilter } from '@/stores/counter'
import { message } from 'ant-design-vue'

// Store & Router
const store = useFilter()
const router = useRouter()

// Validation schema
const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean(),
})

// Login API function
const loginUser = async (credentials) => {
  const res = await fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return { ...data, username: credentials.username }
}

// Mutation handler
const {
  mutate: login,
  isPending,
  error,
} = useMutation({
  mutationFn: loginUser,
  onSuccess: (data, variables) => {
    const expiryDays = variables.rememberMe ? 365 : 1
    Cookies.set('authToken', data.token, { expires: expiryDays })
    localStorage.setItem('user', JSON.stringify(data))

    store.username = data.username
    message.success(`Welcome ${data.firstName} ${data.lastName}`, 2)
    router.push('/profile')
  },
  onError: (err) => {
    console.error('Login error:', err)
    message.error(err.message || 'Login failed', 3)
  },
})

// Form submit
const handleLogin = (values) => {
  login({
    username: values.username,
    password: values.password,
    rememberMe: values.rememberMe,
  })
}
</script>

<style scoped>
@media (max-width: 640px) {
  .ant-card {
    padding: 1rem;
  }
}
</style>
