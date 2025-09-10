<template>
  <div class="left-tab">
    <div class="header">
      <button class="btn">Logo</button>
      <button class="btn">&lt;-]</button>
    </div>
  </div>
</template>
<style lang="css" scoped>
.left-tab {
  width: 250px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  border-bottom-right-radius: 25px;
  border-top-right-radius: 25px;
  padding: 20px 0px;
}
.header {
  padding: 0px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
</style>
