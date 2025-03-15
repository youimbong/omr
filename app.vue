<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-3">
        <h1 class="text-xl font-bold text-blue-600">온라인 테스트 답안지 체크 프로그램</h1>
      </div>
    </header>
    
    <main class="container mx-auto py-4">
      <NuxtPage />
    </main>
    
    <footer class="bg-white shadow-inner mt-8 py-4">
      <div class="container mx-auto px-4 text-center text-gray-600 text-sm">
        &copy; 2025 온라인 테스트 답안지 체크 프로그램
      </div>
    </footer>
  </div>
</template>

<style>
body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  @apply bg-gray-100;
}
</style>