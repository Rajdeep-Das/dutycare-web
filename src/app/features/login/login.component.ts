import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <main class="min-h-screen flex items-center justify-center p-6">
      <div class="w-full max-w-sm text-center">
        <h1 class="text-2xl font-semibold">DutyCare</h1>
        <p class="mt-2 text-slate-500">Login — implemented in the Auth phase.</p>
      </div>
    </main>
  `,
})
export class LoginComponent {}
