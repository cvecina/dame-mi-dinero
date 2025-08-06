<template>
  <div class="wrapper flex flex-col min-h-screen">
    <div class="content flex-grow">
      <slot name="header" />
      <slot name="main"> </slot>
    </div>
    <div class="footer mt-auto">
      <slot name="footer" />
    </div>
  </div>
</template>