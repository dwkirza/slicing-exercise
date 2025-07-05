import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilter = defineStore('filter', () => {
  const username = ref('')
  const idUser = ref(1)

  return { username, idUser }
})
