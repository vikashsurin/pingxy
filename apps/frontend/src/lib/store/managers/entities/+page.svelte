<!-- Todo: create separate routes for login, register, and guest


src/routes/(auth)/
├── +layout.svelte      <-- Contains the Logo, "Welcome Back", and Tab UI
├── login/
│   └── +page.svelte    <-- Contains ONLY the Username/Password inputs
├── register/
│   └── +page.svelte    <-- Contains ONLY the Registration inputs
└── guest/
    └── +page.svelte    <-- Contains ONLY the Guest "Join" button
    
    
    
    
    <script>
      import { page } from '$app/stores';
      let { children } = $props();
    </script>
    
    <div class="auth-card">
      <h2>Welcome Back!</h2>
      
      <div class="tabs">
        <a href="/login" class:active={$page.url.pathname === '/login'}>Login</a>
        <a href="/register" class:active={$page.url.pathname === '/register'}>Register</a>
        <a href="/guest" class:active={$page.url.pathname === '/guest'}>Guest</a>
      </div>
    
      {@render children()}
    </div> -->