<template>
  <a-form layout="vertical">
    <!-- Salutation -->
    <a-form-item
      label="Salutation*"
      :validate-status="!data.salutation && showError ? 'error' : ''"
      :help="!data.salutation && showError ? 'Please select your salutation.' : ''"
    >
      <a-select v-model:value="data.salutation" placeholder="Select salutation">
        <a-select-option value="Mr.">Mr.</a-select-option>
        <a-select-option value="Ms.">Ms.</a-select-option>
        <a-select-option value="Mrs.">Mrs.</a-select-option>
      </a-select>
    </a-form-item>

    <!-- First Name -->
    <a-form-item label="First Name*">
      <a-input v-model:value="data.firstName" placeholder="Enter first name" />
    </a-form-item>

    <!-- Last Name -->
    <a-form-item label="Last Name*">
      <a-input v-model:value="data.lastName" placeholder="Enter last name" />
    </a-form-item>

    <!-- Email -->
    <a-form-item label="Email Address*">
      <a-input type="email" v-model:value="data.email" placeholder="Enter email address" />
    </a-form-item>

    <!-- Upload Image -->
    <a-form-item label="Upload Image">
      <a-upload :beforeUpload="handleUpload" showUploadList="false">
        <a-button icon="upload">Upload</a-button>
      </a-upload>

      <div v-if="data.profileImage" class="mt-2">
        <img :src="data.profileImage" class="w-24 h-24 rounded-full object-cover" />
      </div>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { watch, defineProps, defineEmits, ref } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:data'])
const showError = ref(false)

// Watch for changes and emit two-way binding
watch(
  () => props.data,
  (val) => {
    emit('update:data', val)
  },
  { deep: true },
)

// Simulasi upload → convert image ke base64
const handleUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    props.data.profileImage = e.target.result
  }
  reader.readAsDataURL(file)
  return false // prevent default upload
}
</script>
