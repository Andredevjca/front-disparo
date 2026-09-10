import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'enviar' },
      { path: 'whatsapp', loadComponent: () => import('./pages/whatsapp/whatsapp.component').then((m) => m.WhatsappComponent) },
      { path: 'templates', loadComponent: () => import('./pages/templates/templates.component').then((m) => m.TemplatesComponent) },
      { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent) },
      { path: 'enviar', loadComponent: () => import('./pages/enviar/enviar.component').then((m) => m.EnviarComponent) },
      { path: 'massa', loadComponent: () => import('./pages/massa/massa.component').then((m) => m.MassaComponent) },
      { path: 'historico', loadComponent: () => import('./pages/historico/historico.component').then((m) => m.HistoricoComponent) },
    ],
  },
  { path: '**', redirectTo: 'enviar' },
];
