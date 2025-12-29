<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { authService } from '@/src/modules/auth';
import type { AuthResult } from '@/src/modules/auth';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-vue-next';

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'login-success', user: any): void;
  (e: 'register-success', user: any): void;
}>();

// Form state
const isLoginMode = ref(true);
const isLoading = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');

// Form fields
const email = ref('');
const password = ref('');
const name = ref('');

// Validation
const emailError = ref('');
const passwordError = ref('');
const nameError = ref('');

const isFormValid = computed(() => {
  if (isLoginMode.value) {
    return email.value.trim() && password.value.trim();
  }
  return email.value.trim() && password.value.trim() && name.value.trim();
});

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    emailError.value = t('auth.emailRequired');
    return false;
  }
  if (!emailRegex.test(email.value)) {
    emailError.value = t('auth.invalidEmail');
    return false;
  }
  emailError.value = '';
  return true;
};

const validatePassword = () => {
  if (!password.value.trim()) {
    passwordError.value = t('auth.passwordRequired');
    return false;
  }
  if (password.value.length < 6) {
    passwordError.value = t('auth.passwordTooShort');
    return false;
  }
  passwordError.value = '';
  return true;
};

const validateName = () => {
  if (!isLoginMode.value && !name.value.trim()) {
    nameError.value = t('auth.nameRequired');
    return false;
  }
  nameError.value = '';
  return true;
};

const handleSubmit = async () => {
  // Clear previous errors
  errorMessage.value = '';
  
  // Validate all fields
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isNameValid = validateName();
  
  if (!isEmailValid || !isPasswordValid || !isNameValid) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    let result: AuthResult;
    
    if (isLoginMode.value) {
      result = await authService.login({
        email: email.value.trim(),
        password: password.value,
      });
    } else {
      result = await authService.register({
        email: email.value.trim(),
        password: password.value,
        name: name.value.trim(),
      });
    }
    
    if (result.success && result.user) {
      if (isLoginMode.value) {
        emit('login-success', result.user);
      } else {
        emit('register-success', result.user);
      }
    } else {
      errorMessage.value = result.error || t('auth.unknownError');
    }
  } catch (error) {
    errorMessage.value = t('auth.networkError');
  } finally {
    isLoading.value = false;
  }
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  errorMessage.value = '';
  emailError.value = '';
  passwordError.value = '';
  nameError.value = '';
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="login-form-container">
    <div class="login-header">
      <h2 class="login-title">
        {{ isLoginMode ? t('auth.login') : t('auth.register') }}
      </h2>
      <p class="login-subtitle">
        {{ isLoginMode ? t('auth.loginSubtitle') : t('auth.registerSubtitle') }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">
      <!-- Name field (register only) -->
      <div v-if="!isLoginMode" class="form-group">
        <label class="form-label">
          <User class="label-icon" />
          {{ t('auth.name') }}
        </label>
        <input
          v-model="name"
          type="text"
          class="form-input"
          :class="{ 'input-error': nameError }"
          :placeholder="t('auth.namePlaceholder')"
          @blur="validateName"
        />
        <span v-if="nameError" class="error-text">{{ nameError }}</span>
      </div>

      <!-- Email field -->
      <div class="form-group">
        <label class="form-label">
          <Mail class="label-icon" />
          {{ t('auth.email') }}
        </label>
        <input
          v-model="email"
          type="email"
          class="form-input"
          :class="{ 'input-error': emailError }"
          :placeholder="t('auth.emailPlaceholder')"
          @blur="validateEmail"
        />
        <span v-if="emailError" class="error-text">{{ emailError }}</span>
      </div>

      <!-- Password field -->
      <div class="form-group">
        <label class="form-label">
          <Lock class="label-icon" />
          {{ t('auth.password') }}
        </label>
        <div class="password-input-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input password-input"
            :class="{ 'input-error': passwordError }"
            :placeholder="t('auth.passwordPlaceholder')"
            @blur="validatePassword"
          />
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility"
          >
            <EyeOff v-if="showPassword" class="toggle-icon" />
            <Eye v-else class="toggle-icon" />
          </button>
        </div>
        <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        class="submit-btn"
        :disabled="!isFormValid || isLoading"
      >
        <Loader2 v-if="isLoading" class="spinner" />
        <span v-else>
          {{ isLoginMode ? t('auth.loginButton') : t('auth.registerButton') }}
        </span>
      </button>

      <!-- Toggle mode link -->
      <div class="toggle-mode">
        <span class="toggle-text">
          {{ isLoginMode ? t('auth.noAccount') : t('auth.hasAccount') }}
        </span>
        <button type="button" class="toggle-link" @click="toggleMode">
          {{ isLoginMode ? t('auth.registerNow') : t('auth.loginNow') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-form-container {
  padding: 16px;
  background: var(--card-bg-color, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e0e6ed);
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #37474f);
  margin: 0 0 4px 0;
}

.login-subtitle {
  font-size: 12px;
  color: var(--label-color, #546e7a);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--label-color, #546e7a);
}

.label-icon {
  width: 14px;
  height: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid var(--border-color, #e0e6ed);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--input-bg-color, #fdfdff);
  color: var(--input-text-color, #37474f);
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #6a88e0);
  box-shadow: 0 0 0 2px rgba(106, 136, 224, 0.2);
}

.form-input.input-error {
  border-color: #ef4444;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--label-color, #546e7a);
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: var(--primary-color, #6a88e0);
}

.toggle-icon {
  width: 18px;
  height: 18px;
}

.error-text {
  font-size: 11px;
  color: #ef4444;
}

.error-message {
  padding: 10px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 12px;
  text-align: center;
}

.submit-btn {
  padding: 12px;
  background: var(--primary-color, #6a88e0);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover-color, #5a78d0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.toggle-mode {
  text-align: center;
  font-size: 12px;
}

.toggle-text {
  color: var(--label-color, #546e7a);
}

.toggle-link {
  background: none;
  border: none;
  color: var(--primary-color, #6a88e0);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 0;
  margin-left: 4px;
}

.toggle-link:hover {
  text-decoration: underline;
}

@media (prefers-color-scheme: dark) {
  .error-message {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
}
</style>
