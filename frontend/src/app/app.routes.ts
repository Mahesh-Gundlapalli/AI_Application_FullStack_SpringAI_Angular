import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  },
  {
    path: 'cricket',
    loadComponent: () => import('./pages/cricket/cricket.component').then(m => m.CricketComponent)
  },
  {
    path: 'image',
    loadComponent: () => import('./pages/image/image.component').then(m => m.ImageComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: '**',
    redirectTo: 'chat'
  }
];
