<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view />
</template>

<style lang="scss">
#nav {
  position: absolute;
  bottom: 30px;
  left: 30px;
  user-select: none;

  a {
    color: #fff;

    &.router-link-exact-active {
      font-weight: bold;
    }
  }
}
</style>
