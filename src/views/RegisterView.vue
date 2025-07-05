<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <a-card class="w-full max-w-md">
      <Form :validation-schema="schema" @submit="handleRegister" v-slot="{ meta }">
        <!-- First Name -->
        <div class="mb-4">
          <label>First Name*</label>
          <Field name="firstName" v-slot="{ field, errorMessage }">
            <a-input v-bind="field" placeholder="Enter First Name" />
            <span class="text-red-500 text-sm">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Last Name -->
        <div class="mb-4">
          <label>Last Name*</label>
          <Field name="lastName" v-slot="{ field, errorMessage }">
            <a-input v-bind="field" placeholder="Enter Last Name" />
            <span class="text-red-500 text-sm">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Username -->
        <div class="mb-4">
          <label>Username*</label>
          <Field name="username" v-slot="{ field, errorMessage }">
            <a-input v-bind="field" placeholder="Enter Username" />
            <span class="text-red-500 text-sm">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label>Password*</label>
          <Field name="password" v-slot="{ field, errorMessage }">
            <a-input-password v-bind="field" placeholder="Enter Password" />
            <span class="text-red-500 text-sm">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Confirm Password -->
        <div class="mb-4">
          <label>Confirm Password*</label>
          <Field name="confirmPassword" v-slot="{ field, errorMessage }">
            <a-input-password v-bind="field" placeholder="Confirm Password" />
            <span class="text-red-500 text-sm">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Age -->
        <div class="mb-4">
          <label>Age*</label>
          <Field name="age" v-slot="{ field, errorMessage }">
            <a-input v-bind="field" type="number" placeholder="Enter Age" />
            <span class="text-red-500 text-sm">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Gender -->
        <div class="mb-4">
          <label>Gender*</label>
          <Field name="gender" v-slot="{ field, errorMessage }">
            <a-select v-bind="field" placeholder="Select Gender" style="width: 100%">
              <a-select-option value="male">Male</a-select-option>
              <a-select-option value="female">Female</a-select-option>
            </a-select>
            <span class="text-red-500 text-sm">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Submit -->
        <div class="text-right">
          <a-button type="primary" html-type="submit" :disabled="!meta.valid" :loading="isPending">
            REGISTER
          </a-button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p class="text-sm text-red-600">{{ error.message }}</p>
        </div>

        <!-- Back to login -->
        <div class="mt-4 text-center">
          <span class="text-sm">Already have an account?</span>
          <router-link to="/login" class="text-blue-600 hover:underline ml-1">
            Login here.
          </router-link>
        </div>
      </Form>
    </a-card>
  </div>
</template>

<script setup>
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { message } from 'ant-design-vue'

const router = useRouter()

// Validation schema
const schema = yup.object({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  username: yup.string().required('Username is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Your passwords do not match.'),
  age: yup
    .number()
    .min(13, 'Age must be at least 13')
    .max(120, 'Age must be less than 120')
    .required('Age is required'),
  gender: yup
    .string()
    .oneOf(['male', 'female'], 'Please select a gender')
    .required('Gender is required'),
})

// Register API
const registerUser = async (userData) => {
  const response = await fetch('https://dummyjson.com/users/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      password: userData.password,
      age: parseInt(userData.age),
      gender: userData.gender,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  return data
}

// Mutation
const {
  mutate: register,
  isPending,
  error,
} = useMutation({
  mutationFn: registerUser,
  onSuccess: () => {
    message.success('Registration successful! Redirecting...', 2)
    setTimeout(() => router.push('/'), 2000)
  },
  onError: (err) => {
    message.error(err.message || 'Registration failed', 3)
  },
})

// Form handler
const handleRegister = (values) => {
  register(values)
}
</script>
