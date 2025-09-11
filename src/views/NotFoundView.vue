<script setup lang="ts"></script>
<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/">Go back to Home</a>
  </div>
</template>
<style lang="css" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
.not-found h1 {
  font-size: 4em;
  margin-bottom: 0.5em;
}
.not-found p {
  font-size: 1.5em;
  margin-bottom: 1em;
}
.not-found a {
  font-size: 1.2em;
  color: var(--color-primary);
  text-decoration: none;
}
.not-found a:hover {
  text-decoration: underline;
}
</style>
